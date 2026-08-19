import type { AcceptInviteInput } from "@/components/auth/accept-invite-schema";

export const PREVIEW_INVITE = {
  inviter: "Fernanda Alves (Administradora Colinas)",
  role: "Porteiro",
  properties: "Vila Verde · Colinas II",
} as const;

export async function requestAcceptInvite(
  _input: AcceptInviteInput,
): Promise<{ ok: true }> {
  return { ok: true };
}
