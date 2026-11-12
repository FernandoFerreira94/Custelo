import { ehPapel, type PapelCodigo } from "@/application/permissoes";
import type { AuthenticatedSession } from "@/application/auth/session-context";
import { ORG_SCOPE_SENTINEL } from "@/db/session";
import { MSG } from "@/lib/mensagens";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export type Contexto = {
  orgId: string;
  empreendimentoId: string;
  usuarioId: string;
  papel: PapelCodigo;
  escopoDeOrg: boolean;
};

export function resolverContexto(
  sessao: AuthenticatedSession,
  empreendimentosPermitidos: readonly string[],
  pedido?: string,
): Resultado<Contexto> {
  const { claims } = sessao;
  if (claims.user_status !== "ativo")
    return falha("SEM_PERMISSAO", MSG.semPermissao);
  if (!claims.org_id || !claims.empreendimento_id)
    return falha("SEM_SESSAO", MSG.semContexto);
  if (!ehPapel(claims.papel_codigo))
    return falha("SEM_PERMISSAO", MSG.semPermissao);

  const escopoDeOrg = claims.empreendimento_id === ORG_SCOPE_SENTINEL;
  const empreendimentoId = escopoDeOrg ? pedido : claims.empreendimento_id;

  if (!empreendimentoId) return falha("SEM_SESSAO", MSG.semContexto);
  if (!escopoDeOrg && pedido && pedido !== claims.empreendimento_id) {
    return falha("SEM_PERMISSAO", MSG.semPermissao);
  }
  if (!empreendimentosPermitidos.includes(empreendimentoId)) {
    return falha("SEM_PERMISSAO", MSG.semPermissao);
  }

  return sucesso({
    orgId: claims.org_id,
    empreendimentoId,
    usuarioId: sessao.userId,
    papel: claims.papel_codigo,
    escopoDeOrg,
  });
}
