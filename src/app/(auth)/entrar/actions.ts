"use server";

import { headers } from "next/headers";

import { acceptInviteSchema } from "@/components/auth/accept-invite-schema";
import { recoverSchema } from "@/components/auth/recover-schema";
import { setPasswordSchema } from "@/components/auth/set-password-schema";
import {
  acceptInviteForSession,
  getPendingInviteForSession,
  type PendingInviteMetadata,
} from "@/infrastructure/auth/invite-service";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";
import { getAuthenticatedSession } from "@/infrastructure/auth/session";
import { log } from "@/infrastructure/observability/logger";
import { env } from "@/lib/env";

export async function fetchPendingInviteAction(): Promise<
  { ok: true; metadata: PendingInviteMetadata } | { ok: false; code: string }
> {
  return getPendingInviteForSession();
}

export async function acceptInviteAction(
  input: unknown,
): Promise<{ ok: true; redirectTo: string } | { ok: false; mensagem: string }> {
  const parsed = acceptInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, mensagem: "Preencha nome e senha válidos." };
  }

  return acceptInviteForSession(parsed.data);
}

export async function requestRecoveryAction(
  input: unknown,
): Promise<{ ok: true; mensagem: string } | { ok: false; mensagem: string }> {
  const parsed = recoverSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, mensagem: "Informe um e-mail válido." };
  }

  const supabase = await createSupabaseServerClient();
  const requestOrigin = (await headers()).get("origin");
  const origin =
    env.NEXT_PUBLIC_SITE_URL ??
    (env.NODE_ENV === "production"
      ? null
      : (requestOrigin ?? "http://localhost:3000"));

  if (!origin) {
    return {
      ok: false,
      mensagem:
        "Não foi possível enviar o link agora. Tente novamente em instantes.",
    };
  }

  const callbackUrl = new URL("/auth/confirm", origin);
  callbackUrl.searchParams.set("view", "senha");

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: callbackUrl.toString(),
    },
  );

  if (error) {
    return {
      ok: false,
      mensagem:
        "Não foi possível enviar o link agora. Tente novamente em instantes.",
    };
  }

  return {
    ok: true,
    mensagem:
      "Se existir uma conta com esse e-mail, o link será enviado. Por segurança, não confirmamos quais e-mails estão cadastrados.",
  };
}

export async function setPasswordAction(
  input: unknown,
): Promise<{ ok: true; redirectTo: string } | { ok: false; mensagem: string }> {
  const parsed = setPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, mensagem: "Verifique a senha e a confirmação." };
  }

  const session = await getAuthenticatedSession();
  if (!session) {
    return {
      ok: false,
      mensagem: "Link expirado. Solicite um novo link de recuperação.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      mensagem: "Não foi possível salvar a senha. Tente novamente.",
    };
  }

  // A senha já mudou. Se encerrar as outras sessões falhar, não dizemos que
  // a troca falhou (a pessoa tentaria de novo à toa): registramos e seguimos.
  const { error: signOutError } = await supabase.auth.signOut({
    scope: "others",
  });
  if (signOutError) {
    log("warn", { msg: "senha_alterada_sem_encerrar_outras_sessoes" });
  }

  await supabase.auth.refreshSession();

  return { ok: true, redirectTo: "/contexto" };
}
