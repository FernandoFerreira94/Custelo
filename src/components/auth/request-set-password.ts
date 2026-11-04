import type { SetPasswordInput } from "@/components/auth/set-password-schema";
import { setPasswordAction } from "@/app/(auth)/entrar/actions";

export async function requestSetPassword(
  input: SetPasswordInput,
): Promise<{ ok: true; redirectTo?: string } | { ok: false; message: string }> {
  return setPasswordAction(input);
}
