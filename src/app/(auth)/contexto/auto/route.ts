import { NextResponse } from "next/server";

import { canWriteWithStatus } from "@/application/auth/session-context";
import { resolveSurfaceRedirect } from "@/application/auth/user-scope";
import { getAuthenticatedSession } from "@/infrastructure/auth/session";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";
import {
  defineActiveContext,
  listAccessibleScopes,
} from "@/infrastructure/auth/user-scopes";

/**
 * Entrada automática quando a pessoa tem um só empreendimento.
 * Route Handler (e não página) porque precisa gravar o cookie da sessão renovada,
 * senão o token fica sem org/empreendimento e as rotas protegidas mandam de volta
 * para /contexto em loop.
 */
export async function GET(request: Request) {
  const destino = (caminho: string) =>
    NextResponse.redirect(new URL(caminho, request.url));

  const session = await getAuthenticatedSession();
  if (!session) return destino("/entrar");
  if (!canWriteWithStatus(session.claims.user_status)) {
    return destino("/sem-acesso");
  }

  const scopes = await listAccessibleScopes(session.userId);
  if (scopes.length === 0) return destino("/sem-acesso");
  const unico = scopes.length === 1 ? scopes[0] : undefined;
  if (!unico) return destino("/contexto");

  const persisted = await defineActiveContext(
    session.userId,
    unico.orgId,
    unico.empreendimentoId,
  );
  if (!persisted.ok) return destino("/contexto?erro=contexto");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.refreshSession();
  if (error) return destino("/contexto?erro=sessao");

  return destino(resolveSurfaceRedirect(persisted.papelCodigo));
}
