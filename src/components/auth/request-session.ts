import type { LoginInput } from "@/components/auth/login-schema";
import type { CusteloAccessClaims } from "@/application/auth/session-context";
import {
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/infrastructure/auth/supabase-browser";
import { decodeJwtPayload, readCusteloClaims } from "@/infrastructure/auth/jwt";
import { mensagemDeFalha } from "@/lib/mensagens";

export const AUTH_UNAVAILABLE =
  "Não foi possível entrar. A sessão ainda não está disponível neste ambiente.";

export const LOGIN_FAILED = "E-mail ou senha incorretos. Tente novamente.";

export const LOGIN_DISABLED =
  "Conta desativada. Fale com a administração do empreendimento.";

export const LOGIN_PENDING =
  "Convite pendente. Conclua o primeiro acesso pelo link enviado por e-mail.";

export const LOGIN_EMAIL_NAO_CONFIRMADO =
  "E-mail ainda não confirmado. Abra o link que enviamos para o seu e-mail.";

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
  let resposta: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
  try {
    resposta = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
  } catch (falha) {
    return { ok: false, message: mensagemDeFalha(falha) };
  }

  const { data, error } = resposta;
  if (error) {
    // Só credencial errada vira "senha incorreta". Rede, limite e servidor têm texto próprio.
    if (error.code === "email_not_confirmed") {
      return { ok: false, message: LOGIN_EMAIL_NAO_CONFIRMADO };
    }
    if (error.code === "invalid_credentials" || error.status === 400) {
      return { ok: false, message: LOGIN_FAILED };
    }
    return { ok: false, message: mensagemDeFalha(error) };
  }

  if (!data.session) {
    return { ok: false, message: LOGIN_FAILED };
  }

  const claims = readCusteloClaims(decodeJwtPayload(data.session.access_token));

  if (claims.user_status !== "ativo") {
    await supabase.auth.signOut();
    return { ok: false, message: messageForStatus(claims.user_status) };
  }

  return { ok: true, redirectTo: "/contexto" };
}
