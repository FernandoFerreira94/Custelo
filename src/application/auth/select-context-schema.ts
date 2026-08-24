import { z } from "zod";

export const selectContextSchema = z.object({
  orgId: z.string().uuid("Organização inválida."),
  empreendimentoId: z.string().uuid("Empreendimento inválido."),
});

export type SelectContextInput = z.infer<typeof selectContextSchema>;
