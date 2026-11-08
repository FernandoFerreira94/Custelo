import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDeEstrutura } from "@/application/estrutura/ports";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

/** Ninguém apaga cadastro: desativa, e só quando nada ativo depende dele. */
export async function desativarArea(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  areaId: string,
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const ativas = await deps.repo.contarUnidadesAtivasNaArea(ctx, areaId);
  if (ativas > 0) {
    return falha(
      "CONFLITO",
      `Esta área tem ${ativas} ${ativas === 1 ? "unidade ativa" : "unidades ativas"}. Mova ou desative as unidades antes.`,
    );
  }
  await deps.repo.atualizarArea(ctx, areaId, { ativo: false });
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "AREA_DESATIVADA",
    alvoTipo: "area",
    alvoId: areaId,
    origem: "web",
  });
  return sucesso(null, "Área desativada.");
}

export async function desativarUnidade(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  unidadeId: string,
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const unidade = await deps.repo.unidadePorId(ctx, unidadeId);
  if (!unidade) return falha("NAO_ENCONTRADO", "Não achamos essa unidade.");

  // Na I4 também checa encomenda em custódia.
  const vinculos = await deps.repo.contarVinculosAtivosDaUnidade(
    ctx,
    unidadeId,
  );
  if (vinculos > 0) {
    return falha(
      "CONFLITO",
      `Encerre os vínculos de ${unidade.codigo} antes de desativar.`,
    );
  }
  await deps.repo.atualizarUnidade(ctx, unidadeId, { ativo: false });
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "UNIDADE_DESATIVADA",
    alvoTipo: "unidade",
    alvoId: unidadeId,
    depois: { codigo: unidade.codigo },
    origem: "web",
  });
  return sucesso(null, `${unidade.codigo} desativada.`);
}
