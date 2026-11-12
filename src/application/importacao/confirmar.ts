import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import {
  type DepsDeImportacao,
  MSG_FUNCIONARIOS,
  type ResultadoDaGravacao,
} from "@/application/importacao/ports";
import { linhaEntra } from "@/application/importacao/selecao";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

const PLURAL = (n: number, um: string, varios: string) =>
  `${n} ${n === 1 ? um : varios}`;

/**
 * Grava o lote nos cadastros, numa transação só. Entram as linhas ok e aviso e as
 * duplicadas COM decisão; linha com erro nunca entra. Confirmar de novo (duplo clique)
 * devolve o que já foi feito, sem gravar outra vez.
 */
export async function confirmarImportacao(
  deps: DepsDeImportacao,
  ctx: Contexto,
  e: { loteId: string; confirmou: boolean },
): Promise<Resultado<ResultadoDaGravacao>> {
  const negado = negarSemPermissao(ctx, "importacao.executar");
  if (negado) return negado;
  if (!e.confirmou) {
    return falha("ENTRADA_INVALIDA", "Confira os campos destacados.", {
      confirmou:
        "Confirme que você tem autorização para cadastrar estes dados.",
    });
  }

  const lote = await deps.repo.buscarLote(ctx, e.loteId);
  if (!lote) return falha("NAO_ENCONTRADO", "Não achamos esse lote.");
  if (lote.status === "confirmada") {
    return sucesso(
      { criados: 0, atualizados: 0, ignorados: 0 },
      "Este lote já foi importado.",
    );
  }
  if (lote.status !== "conferindo") {
    return falha("CONFLITO", "Este lote não pode mais ser importado.");
  }
  if (lote.cadastro === "funcionarios") {
    return falha("INDISPONIVEL", MSG_FUNCIONARIOS);
  }

  const todas = await deps.repo.listarLinhas(ctx, e.loteId);
  const entram = todas.filter(linhaEntra);

  const resultado = await deps.repo.gravarLote(ctx, {
    lote,
    linhas: entram,
    agora: deps.agora(),
  });
  // Outro clique confirmou o lote entre a leitura e a gravação.
  if (!resultado) {
    return sucesso(
      { criados: 0, atualizados: 0, ignorados: 0 },
      "Este lote já foi importado.",
    );
  }
  // Cadastro e contagens, nunca dado pessoal.
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "IMPORTACAO_CONFIRMADA",
    alvoTipo: "importacao",
    alvoId: lote.id,
    depois: {
      cadastro: lote.cadastro,
      criados: resultado.criados,
      atualizados: resultado.atualizados,
      ignoradas: todas.length - entram.length,
    },
    origem: "importacao",
  });
  return sucesso(
    resultado,
    `${PLURAL(resultado.criados + resultado.atualizados, "cadastro importado", "cadastros importados")}.`,
  );
}
