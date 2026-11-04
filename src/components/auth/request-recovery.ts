import type { RecoverInput } from "@/components/auth/recover-schema";
import { requestRecoveryAction } from "@/app/(auth)/entrar/actions";

export const RECOVERY_ACCEPTED =
  "Se existir uma conta com esse e-mail, o link será enviado. Por segurança, não confirmamos quais e-mails estão cadastrados.";

export async function requestRecovery(
  input: RecoverInput,
): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  return requestRecoveryAction(input);
}
