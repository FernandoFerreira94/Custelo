import type { RecoverInput } from "@/components/auth/recover-schema";
import { requestRecoveryAction } from "@/app/(auth)/entrar/actions";
import { comMensagemDeFalha } from "@/lib/mensagens";

export const RECOVERY_ACCEPTED =
  "Se existir uma conta com esse e-mail, o link será enviado. Por segurança, não confirmamos quais e-mails estão cadastrados.";

export async function requestRecovery(
  input: RecoverInput,
): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  return comMensagemDeFalha(() => requestRecoveryAction(input));
}
