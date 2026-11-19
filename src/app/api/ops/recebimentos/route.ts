import { registrarRecebimento } from "@/application/recebimento/registrar-recebimento";
import { esquemaDeRecebimento } from "@/application/recebimento/schemas";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { SystemClock } from "@/infrastructure/clock/system-clock";
import { custodiaRepo } from "@/infrastructure/custodia/custodia-repo";
import { responder } from "@/infrastructure/http/resposta";
import { InngestJobScheduler } from "@/infrastructure/jobs/inngest-scheduler";
import { falhaDeEntrada } from "@/lib/resultado";

export const dynamic = "force-dynamic";

/**
 * O mesmo caso de uso da action, por POST: é o que a fila local da I6 reenvia.
 * Idempotente pelo id do evento de recebimento.
 */
export async function POST(req: Request) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return responder(ctx);
  const lido = esquemaDeRecebimento.safeParse(
    await req.json().catch(() => null),
  );
  if (!lido.success) return responder(falhaDeEntrada(lido.error));
  return responder(
    await registrarRecebimento(ctx.data, lido.data, {
      repo: custodiaRepo,
      jobs: new InngestJobScheduler(),
      clock: new SystemClock(),
    }),
  );
}
