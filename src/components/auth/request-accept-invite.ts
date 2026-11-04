import type { AcceptInviteInput } from "@/components/auth/accept-invite-schema";
import {
  acceptInviteAction,
  fetchPendingInviteAction,
} from "@/app/(auth)/entrar/actions";

export type PendingInvitePreview = {
  inviter: string;
  role: string;
  properties: string;
};

export async function fetchPendingInvite(): Promise<PendingInvitePreview | null> {
  const result = await fetchPendingInviteAction();
  if (!result.ok) {
    return null;
  }

  return result.metadata;
}

export async function requestAcceptInvite(
  input: AcceptInviteInput,
): Promise<{ ok: true; redirectTo?: string } | { ok: false; message: string }> {
  const result = await acceptInviteAction(input);
  if (!result.ok) {
    return result;
  }

  return { ok: true, redirectTo: result.redirectTo };
}
