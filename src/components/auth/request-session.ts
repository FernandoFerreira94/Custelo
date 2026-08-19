import type { LoginInput } from "@/components/auth/login-schema";
import type { CusteloAccessClaims } from "@/application/auth/session-context";
import {
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/infrastructure/auth/supabase-browser";
import { decodeJwtPayload, readCusteloClaims } from "@/infrastructure/auth/jwt";

export const AUTH_UNAVAILABLE =
  "Não foi possível entrar. A sessão ainda não está disponível neste ambiente.";

export const LOGIN_FAILED = "E-mail ou senha incorretos. Tente novamente.";

export const LOGIN_DISABLED =
  "Conta desativada. Fale com a administração do empreendimento.";

export const LOGIN_PENDING =
  "Convite pendente. Conclua o primeiro acesso pelo link enviado por e-mail.";

export const LOGIN_UNCONFIGURED =
  "Conta ainda não configurada. Fale com a administração.";

function messageForStatus(status: CusteloAccessClaims["user_status"]): string {
  switch (status) {
    case "desativado":
      return LOGIN_DISABLED;
    case "convite_pendente":
      return LOGIN_PENDING;
    case "missing":
      return LOGIN_UNCONFIGURED;
    default:
      return LOGIN_FAILED;
  }
}

export async function requestSession(
  input: LoginInput,
): Promise<{ ok: true; redirectTo: string } | { ok: false; message: string }> {
  if (!isSupabaseBrowserConfigured()) {
    return { ok: false, message: AUTH_UNAVAILABLE };
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session) {
    return { ok: false, message: LOGIN_FAILED };
  }

  const claims = readCusteloClaims(decodeJwtPayload(data.session.access_token));

  if (claims.user_status !== "ativo") {
    await supabase.auth.signOut();
    return { ok: false, message: messageForStatus(claims.user_status) };
  }

  return { ok: true, redirectTo: "/contexto" };
}
