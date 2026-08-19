import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 10;

export const newPasswordSchema = z
  .string()
  .min(1, "Informe a senha.")
  .min(MIN_PASSWORD_LENGTH, "Mínimo 10 caracteres.");
