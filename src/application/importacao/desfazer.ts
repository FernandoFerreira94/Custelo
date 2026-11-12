import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDeImportacao } from "@/application/importacao/ports";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

const VINTE_E_QUATRO_HORAS = 24 * 60 * 60 * 1000;

/**
 * Desfaz um lote até 24 h depois de confirmado. Inativa e encerra o que ele criou;
 * nunca apaga. (Na I4 também confere se alguma encomenda já usou esses cadastros.)
 */
export async function desfazerImportacao(
  deps: DepsDeImportacao,
  ctx: Contexto,
  e: { loteId: string },
): Promise<Resultado<{ desfeitos: number }>> {
  const negado = negarSemPermissao(ctx, "importacao.executar");
  if (negado) return negado;

  const lote = await deps.repo.buscarLote(ctx, e.loteId);
  if (!lote) return falha("NAO_ENCONTRADO", "Não achamos esse lote.");
  if (lote.status !== "confirmada" || !lote.confirmadoEm) {
    return falha(
      "CONFLITO",
      "Só dá para desfazer um lote que já foi importado.",
    );
  }
  const agora = deps.agora();
  if (agora.getTime() - lote.confirmadoEm.getTime() > VINTE_E_QUATRO_HORAS) {
    return falha(
      "CONFLITO",
      "Já passaram 24 horas: este lote não pode mais ser desfeito.",
    );
  }

  const linhas = (await deps.repo.listarLinhas(ctx, e.loteId)).filter(
    (l) => l.registroId !== null,
  );
  const r = await deps.repo.desfazerLote(ctx, { lote, linhas, agora });
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "IMPORTACAO_DESFEITA",
    alvoTipo: "importacao",
    alvoId: lote.id,
    depois: { cadastro: lote.cadastro, desfeitos: r.desfeitos },
    origem: "importacao",
  });
  return sucesso(
    r,
    "Importação desfeita. Nada foi apagado: os cadastros ficaram inativos.",
  );
}
