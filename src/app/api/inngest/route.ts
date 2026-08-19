import { serve } from "inngest/next";

import { foundationHeartbeat } from "@/infrastructure/jobs/heartbeat";
import { inngest } from "@/infrastructure/jobs/inngest-client";

export const runtime = "nodejs";

/**
 * Publica de proposito: o Inngest Cloud chama este endpoint. A autenticacao
 * e a assinatura do proprio Inngest (`INNGEST_SIGNING_KEY`), nao sessao de
 * usuario. Nao ha dado de tenant no body desta rota.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [foundationHeartbeat],
});
