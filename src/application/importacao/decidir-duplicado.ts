import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDeImportacao } from "@/application/importacao/ports";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

/** Linha duplicada só entra se o gestor decidir: atualizar o que existe ou ignorar. */
export async function decidirDuplicado(
  deps: DepsDeImportacao,
  ctx: Contexto,
  e: { loteId: string; linhaId: string; decisao: "atualizar" | "ignorar" },
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "importacao.executar");
  if (negado) return negado;

  const lote = await deps.repo.buscarLote(ctx, e.loteId);
  if (!lote) return falha("NAO_ENCONTRADO", "Não achamos esse lote.");
  if (lote.status !== "conferindo") {
    return falha("CONFLITO", "Este lote não está mais em conferência.");
  }
  const linha = (await deps.repo.listarLinhas(ctx, e.loteId)).find(
    (l) => l.id === e.linhaId,
  );
  if (!linha) return falha("NAO_ENCONTRADO", "Não achamos essa linha.");
  if (linha.situacao !== "duplicado") {
    return falha("CONFLITO", "Só linhas duplicadas precisam dessa decisão.");
  }

  await deps.repo.atualizarLinha(ctx, linha.id, {
    situacao: linha.situacao,
    problemas: linha.problemas,
    decisao: e.decisao,
  });
  return sucesso(
    null,
    e.decisao === "atualizar"
      ? "Vai atualizar o que já existe."
      : "Linha ignorada.",
  );
}
