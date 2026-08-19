import type { SetPasswordInput } from "@/components/auth/set-password-schema";

export async function requestSetPassword(
  _input: SetPasswordInput,
): Promise<{ ok: true }> {
  return { ok: true };
}
