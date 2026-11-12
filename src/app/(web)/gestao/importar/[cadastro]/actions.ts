"use server";

import { revalidatePath } from "next/cache";

import { negarSemPermissao } from "@/application/estrutura/guarda";
import { confirmarImportacao } from "@/application/importacao/confirmar";
import { corrigirLinha } from "@/application/importacao/corrigir-linha";
import { decidirDuplicado } from "@/application/importacao/decidir-duplicado";
import { desfazerImportacao } from "@/application/importacao/desfazer";
import { iniciarImportacao } from "@/application/importacao/iniciar";
import type { DepsDeImportacao } from "@/application/importacao/ports";
import {
  esquemaDeCadastro,
  esquemaDeConfirmacao,
  esquemaDeCorrecao,
  esquemaDeDecisao,
  esquemaDeLote,
} from "@/application/importacao/schemas";
import { validarArquivo } from "@/application/importacao/validar-arquivo";
import { auditoriaRepo } from "@/infrastructure/auditoria/auditoria-repo";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { executarAcao } from "@/infrastructure/auth/executar-acao";
import { falhaDeErroPg } from "@/infrastructure/db/erros-pg";
import { importacaoRepo } from "@/infrastructure/importacao/importacao-repo";
import { lerArquivo } from "@/infrastructure/importacao/ler-arquivo";
import { codigoDeFalha, mensagemDeFalha } from "@/lib/mensagens";
import { falha, falhaDeEntrada, type Resultado } from "@/lib/resultado";

const deps: DepsDeImportacao = {
  repo: importacaoRepo,
  auditoria: auditoriaRepo,
  agora: () => new Date(),
};
const LISTAS = ["/gestao/unidades", "/gestao/pessoas", "/gestao/estrutura"];

/**
 * Etapa 1: recebe o arquivo, valida no servidor (tamanho e formato) ANTES de ler, e cria o
 * lote para conferência. Nada vai para os cadastros aqui. O arquivo não é guardado.
 */
export async function enviarPlanilhaAction(formData: FormData) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return ctx;

  const cadastro = esquemaDeCadastro.safeParse(formData.get("cadastro"));
  if (!cadastro.success) return falhaDeEntrada(cadastro.error);
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return falha("ENTRADA_INVALIDA", "Escolha o arquivo da planilha.", {
      arquivo: "Escolha o arquivo da planilha.",
    });
  }

  const conteudo = new Uint8Array(await arquivo.arrayBuffer());
  const formato = validarArquivo({
    nome: arquivo.name,
    tipo: arquivo.type,
    bytes: arquivo.size,
    inicio: conteudo.slice(0, 4),
  });
  if (!formato.ok) return formato;

  try {
    const tabela = await lerArquivo(formato.data, conteudo);
    if (!tabela.ok) return tabela;
    return await iniciarImportacao(deps, ctx.data, {
      cadastro: cadastro.data,
      arquivoNome: arquivo.name,
      tabela: tabela.data,
    });
  } catch (erro) {
    return (
      falhaDeErroPg(erro) ?? falha(codigoDeFalha(erro), mensagemDeFalha(erro))
    );
  }
}

export async function corrigirLinhaAction(entrada: unknown) {
  return executarAcao(esquemaDeCorrecao, entrada, {
    revalidar: [],
    executar: (ctx, d) => corrigirLinha(deps, ctx, d),
  });
}

export async function decidirDuplicadoAction(entrada: unknown) {
  return executarAcao(esquemaDeDecisao, entrada, {
    revalidar: [],
    executar: (ctx, d) => decidirDuplicado(deps, ctx, d),
  });
}

export async function confirmarImportacaoAction(entrada: unknown) {
  return executarAcao(esquemaDeConfirmacao, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => confirmarImportacao(deps, ctx, d),
  });
}

export async function desfazerImportacaoAction(entrada: unknown) {
  return executarAcao(esquemaDeLote, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => desfazerImportacao(deps, ctx, d),
  });
}

/** Cancela o lote em conferência: nada foi gravado, só deixa de aparecer para retomar. */
export async function cancelarLoteAction(
  entrada: unknown,
): Promise<Resultado<null>> {
  return executarAcao(esquemaDeLote, entrada, {
    revalidar: ["/gestao/importar"],
    executar: async (ctx, { loteId }) => {
      const negado = negarSemPermissao(ctx, "importacao.executar");
      if (negado) return negado;
      const lote = await importacaoRepo.buscarLote(ctx, loteId);
      if (!lote) return falha("NAO_ENCONTRADO", "Não achamos esse lote.");
      if (lote.status !== "conferindo") {
        return falha("CONFLITO", "Este lote não está mais em conferência.");
      }
      await importacaoRepo.cancelarLote(ctx, loteId);
      revalidatePath("/gestao/importar");
      return { ok: true, data: null, mensagem: "Importação cancelada." };
    },
  });
}
