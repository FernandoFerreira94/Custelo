import { inngest } from "./inngest-client";

/**
 * Prova de que o adaptador de jobs responde. Sem regra de negocio.
 * Payload propositalmente vazio — nada pessoal entra na fila.
 */
export const foundationHeartbeat = inngest.createFunction(
  { id: "foundation-heartbeat" },
  { event: "custelo/foundation.heartbeat" },
  async () => ({ ok: true as const }),
);
