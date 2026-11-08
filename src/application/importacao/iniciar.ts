import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import {
  CADASTROS_IMPORTAVEIS,
  type DepsDeImportacao,
  MSG_FUNCIONARIOS,
} from "@/application/importacao/ports";
import { mapearCabecalho, type Cadastro } from "@/domain/importacao/colunas";
import type { TabelaLida } from "@/domain/importacao/ler-csv";
import { validarLinha } from "@/domain/importacao/validar-linha";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export type ResumoDaLeitura = {
  loteId: string;
  prontas: number;
  avisos: number;
  erros: number;
  duplicadas: number;
  colunasIgnoradas: string[];
};

const plural = (n: number, um: string, varios: string) =>
  `${n} ${n === 1 ? um : varios}`;

/** "300 linhas lidas: 280 prontas, 12 com aviso, 8 com erro. Nada foi gravado ainda." */
function resumo(
  total: number,
  r: Omit<ResumoDaLeitura, "loteId" | "colunasIgnoradas">,
) {
  const partes = [
    plural(r.prontas, "pronta", "prontas"),
    r.avisos > 0 ? plural(r.avisos, "com aviso", "com aviso") : null,
    r.erros > 0 ? plural(r.erros, "com erro", "com erro") : null,
    r.duplicadas > 0 ? plural(r.duplicadas, "duplicada", "duplicadas") : null,
  ].filter(Boolean);
  return `${plural(total, "linha lida", "linhas lidas")}: ${partes.join(", ")}. Nada foi gravado ainda.`;
}

/**
 * Lê a planilha já em forma de tabela, valida cada linha e guarda o lote para
 * conferência. NÃO escreve em nenhuma tabela de cadastro.
 */
export async function iniciarImportacao(
  deps: DepsDeImportacao,
  ctx: Contexto,
  e: { cadastro: Cadastro; arquivoNome: string; tabela: TabelaLida },
): Promise<Resultado<ResumoDaLeitura>> {
  const negado = negarSemPermissao(ctx, "importacao.executar");
  if (negado) return negado;
  if (e.cadastro === "funcionarios") {
    return falha("INDISPONIVEL", MSG_FUNCIONARIOS);
  }
  if (!CADASTROS_IMPORTAVEIS.includes(e.cadastro)) {
    return falha("ENTRADA_INVALIDA", "Escolha o que você quer importar.");
  }

  const mapa = mapearCabecalho(e.cadastro, e.tabela.cabecalhos);
  if (!mapa.ok) return mapa;

  const doBanco = await deps.repo.contextoDeValidacao(ctx, e.cadastro);
  const contexto = {
    ...doBanco,
    papelDoImportador: ctx.papel,
    hoje: deps.agora(),
    vistos: new Set<string>(),
  };

  const contagem = { prontas: 0, avisos: 0, erros: 0, duplicadas: 0 };
  const linhas = e.tabela.linhas.map((celulas, i) => {
    const dados = Object.fromEntries(
      Object.entries(mapa.data.indices).map(([cabecalho, indice]) => [
        cabecalho,
        celulas[indice] ?? "",
      ]),
    );
    const v = validarLinha(e.cadastro, dados, contexto);
    if (v.situacao === "ok") contagem.prontas += 1;
    else if (v.situacao === "aviso") contagem.avisos += 1;
    else if (v.situacao === "erro") contagem.erros += 1;
    else contagem.duplicadas += 1;
    // `_entrada` guarda o que veio na célula, para a conferência mostrar e corrigir.
    return {
      numeroLinha: i + 1,
      ...v,
      dados: { ...v.dados, _entrada: dados },
    };
  });

  const { id } = await deps.repo.criarLote(ctx, {
    cadastro: e.cadastro,
    arquivoNome: e.arquivoNome,
    linhas,
  });
  // Só o cadastro e o total: nada do conteúdo da planilha vai para a trilha.
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "IMPORTACAO_INICIADA",
    alvoTipo: "importacao",
    alvoId: id,
    depois: { cadastro: e.cadastro, linhas: linhas.length },
    origem: "importacao",
  });
  return sucesso(
    { loteId: id, ...contagem, colunasIgnoradas: mapa.data.ignoradas },
    resumo(linhas.length, contagem),
  );
}
