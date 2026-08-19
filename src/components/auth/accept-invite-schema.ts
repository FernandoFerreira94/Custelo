import { z } from "zod";

import { newPasswordSchema } from "@/components/auth/password-policy";

export const acceptInviteSchema = z.object({
  fullName: z.string().min(1, "Informe o nome completo."),
  password: newPasswordSchema,
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
