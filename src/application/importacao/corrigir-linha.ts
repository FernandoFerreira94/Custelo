import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDeImportacao } from "@/application/importacao/ports";
import { chaveDaLinha, validarLinha } from "@/domain/importacao/validar-linha";
import type { SituacaoDaLinha } from "@/domain/importacao/validar-linha";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

/**
 * Revalida SÓ aquela linha com o que o gestor corrigiu na conferência. As outras
 * linhas entram como "já vistas", para a repetição dentro do arquivo continuar valendo.
 */
export async function corrigirLinha(
  deps: DepsDeImportacao,
  ctx: Contexto,
  e: { loteId: string; linhaId: string; dados: Record<string, string> },
): Promise<Resultado<{ situacao: SituacaoDaLinha; problemas: string[] }>> {
  const negado = negarSemPermissao(ctx, "importacao.executar");
  if (negado) return negado;

  const lote = await deps.repo.buscarLote(ctx, e.loteId);
  if (!lote) return falha("NAO_ENCONTRADO", "Não achamos esse lote.");
  if (lote.status !== "conferindo") {
    return falha("CONFLITO", "Este lote não está mais em conferência.");
  }

  const linhas = await deps.repo.listarLinhas(ctx, e.loteId);
  const alvo = linhas.find((l) => l.id === e.linhaId);
  if (!alvo) return falha("NAO_ENCONTRADO", "Não achamos essa linha.");

  const doBanco = await deps.repo.contextoDeValidacao(ctx, lote.cadastro);
  const vistos = new Set<string>();
  for (const outra of linhas) {
    if (outra.id === alvo.id) continue;
    const chave = chaveDaLinha(lote.cadastro, outra.dados);
    if (chave) vistos.add(chave);
  }

  const v = validarLinha(lote.cadastro, e.dados, {
    ...doBanco,
    papelDoImportador: ctx.papel,
    hoje: deps.agora(),
    vistos,
  });
  await deps.repo.atualizarLinha(ctx, alvo.id, {
    dados: { ...v.dados, _entrada: e.dados },
    situacao: v.situacao,
    problemas: v.problemas,
    // A decisão anterior vale para a linha antiga; corrigida, começa de novo.
    decisao: null,
  });
  return sucesso({ situacao: v.situacao, problemas: v.problemas });
}
