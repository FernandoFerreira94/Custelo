import type { SetPasswordInput } from "@/components/auth/set-password-schema";
import { setPasswordAction } from "@/app/(auth)/entrar/actions";
import { comMensagemDeFalha } from "@/lib/mensagens";

export async function requestSetPassword(
  input: SetPasswordInput,
): Promise<
  { ok: true; redirectTo?: string } | { ok: false; mensagem: string }
> {
  return comMensagemDeFalha(() => setPasswordAction(input));
}
