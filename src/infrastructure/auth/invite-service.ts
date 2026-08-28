import "server-only";

import type { ManagedScope } from "@/application/auth/access-management";
import {
  acceptPendingInvite,
  fetchPendingInviteMetadata,
  persistInviteRegistration,
  type PendingInviteMetadata,
} from "@/infrastructure/auth/access-management-repository";
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/infrastructure/auth/supabase-admin";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";

export type { PendingInviteMetadata };

export async function getPendingInviteForSession(): Promise<
  { ok: true; metadata: PendingInviteMetadata } | { ok: false; code: string }
> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, code: "UNAUTHORIZED" };
    }

    return fetchPendingInviteMetadata(user.id);
  } catch {
    return { ok: false, code: "UNAVAILABLE" };
  }
}

export async function acceptInviteForSession(input: {
  fullName: string;
  password: string;
}): Promise<{ ok: true; redirectTo: string } | { ok: false; message: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sessão expirada. Abra novamente o link do convite.",
    };
  }

  const { error: passwordError } = await supabase.auth.updateUser({
    password: input.password,
    data: { nome: input.fullName.trim() },
  });

  if (passwordError) {
    return {
      ok: false,
      message: "Não foi possível definir a senha. Tente novamente.",
    };
  }

  const accepted = await acceptPendingInvite(user.id, input.fullName.trim());
  if (!accepted.ok) {
    return {
      ok: false,
      message: "Convite inválido ou já utilizado.",
    };
  }

  await supabase.auth.refreshSession();

  return { ok: true, redirectTo: "/contexto" };
}

export async function sendInviteByEmail(input: {
  actorUserId: string;
  actorOrgId: string;
  actorEmpreendimentoId: string;
  email: string;
  scope: ManagedScope;
}): Promise<{ ok: true } | { ok: false; code: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, code: "UNAVAILABLE" };
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    input.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/entrar`,
    },
  );

  if (error || !data.user) {
    return { ok: false, code: "INVITE_FAILED" };
  }

  const persisted = await persistInviteRegistration(
    input.actorUserId,
    input.actorOrgId,
    input.actorEmpreendimentoId,
    data.user.id,
    input.email,
    input.scope,
  );

  if (!persisted.ok) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, code: persisted.code };
  }

  return { ok: true };
}
