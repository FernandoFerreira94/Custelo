import { z } from "zod";

import { loginSchema } from "@/components/auth/login-schema";

export const recoverSchema = loginSchema.pick({ email: true });

export type RecoverInput = z.infer<typeof recoverSchema>;
