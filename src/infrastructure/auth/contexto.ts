import "server-only";

import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";

import { type Contexto, resolverContexto } from "@/application/auth/contexto";
import { ORG_SCOPE_SENTINEL } from "@/db/session";
import { empreendimentos } from "@/db/schema";
import { getAuthenticatedSession } from "@/infrastructure/auth/session";
import { withTenantDb } from "@/infrastructure/db/tenant-db";
import { MSG } from "@/lib/mensagens";
import { falha, type Resultado } from "@/lib/resultado";
import { log } from "@/infrastructure/observability/logger";

/** Cookie com o empreendimento escolhido por quem tem escopo de organização. */
const COOKIE_EMPREENDIMENTO = "pz-emp";

async function empreendimentosDaOrg(
  orgId: string,
  usuarioId: string,
): Promise<string[]> {
  // A RLS limita o select à organização do contexto.
  const linhas = await withTenantDb(
    { orgId, empreendimentoId: ORG_SCOPE_SENTINEL, userId: usuarioId },
    (db) => db.select({ id: empreendimentos.id }).from(empreendimentos),
  );
  return linhas.map((l) => l.id);
}

/**
 * Contexto validado no servidor: sessão + escopos. O empreendimento pedido
 * nunca é confiado; só vale se estiver na lista permitida do usuário.
 */
export async function contextoDaSessao(
  pedido?: string,
): Promise<Resultado<Contexto>> {
  const sessao = await getAuthenticatedSession();
  if (!sessao) return falha("SEM_SESSAO", MSG.sessaoExpirada);

  const { claims } = sessao;
  const escopoDeOrg = claims.empreendimento_id === ORG_SCOPE_SENTINEL;
  const escolhido =
    pedido ??
    (escopoDeOrg
      ? (await cookies()).get(COOKIE_EMPREENDIMENTO)?.value
      : undefined);

  let permitidos: string[] = [];
  if (claims.org_id && claims.empreendimento_id) {
    permitidos = escopoDeOrg
      ? await empreendimentosDaOrg(claims.org_id, sessao.userId)
      : [claims.empreendimento_id];
  }

  const resultado = resolverContexto(sessao, permitidos, escolhido);
  if (!resultado.ok && resultado.codigo === "SEM_PERMISSAO" && escolhido) {
    // Sem id pessoal: só org e o alerta de observabilidade (invariante 12).
    log("warn", { msg: "cross_tenant_negado", org_id: claims.org_id });
    Sentry.captureMessage("cross_tenant_negado", {
      tags: { cross_tenant: "true" },
    });
  }
  return resultado;
}
