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
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/infrastructure/auth/supabase-admin";
import { getAuthenticatedSession } from "@/infrastructure/auth/session";

export async function fetchPendingInviteAction(): Promise<
  { ok: true; metadata: PendingInviteMetadata } | { ok: false; code: string }
> {
  return getPendingInviteForSession();
}

export async function acceptInviteAction(
  input: unknown,
): Promise<{ ok: true; redirectTo: string } | { ok: false; message: string }> {
  const parsed = acceptInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Preencha nome e senha válidos." };
  }

  return acceptInviteForSession(parsed.data);
}

export async function requestRecoveryAction(
  input: unknown,
): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  const parsed = recoverSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Informe um e-mail válido." };
  }

  const supabase = await createSupabaseServerClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${origin}/entrar`,
    },
  );

  if (error) {
    return {
      ok: false,
      message:
        "Não foi possível enviar o link agora. Tente novamente em instantes.",
    };
  }

  return {
    ok: true,
    message:
      "Se existir uma conta com esse e-mail, o link será enviado. Por segurança, não confirmamos quais e-mails estão cadastrados.",
  };
}

export async function setPasswordAction(
  input: unknown,
): Promise<{ ok: true; redirectTo: string } | { ok: false; message: string }> {
  const parsed = setPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Verifique a senha e a confirmação." };
  }

  const session = await getAuthenticatedSession();
  if (!session) {
    return {
      ok: false,
      message: "Link expirado. Solicite um novo link de recuperação.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      message: "Não foi possível salvar a senha. Tente novamente.",
    };
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      message: "Não foi possível concluir a alteração agora. Tente novamente.",
    };
  }

  const admin = createSupabaseAdminClient();
  const { error: signOutError } = await admin.auth.admin.signOut(
    session.userId,
    "others",
  );

  if (signOutError) {
    return {
      ok: false,
      message: "Não foi possível concluir a alteração agora. Tente novamente.",
    };
  }

  await supabase.auth.refreshSession();

  return { ok: true, redirectTo: "/contexto" };
}
