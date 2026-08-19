import type { RecoverInput } from "@/components/auth/recover-schema";

export const RECOVERY_ACCEPTED =
  "Se existir uma conta com esse e-mail, o link será enviado. Por segurança, não confirmamos quais e-mails estão cadastrados.";

export async function requestRecovery(
  _input: RecoverInput,
): Promise<{ ok: true; message: string }> {
  return { ok: true, message: RECOVERY_ACCEPTED };
}
