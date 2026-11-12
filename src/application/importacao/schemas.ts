import { z } from "zod";

import { CADASTROS } from "@/domain/importacao/colunas";

export const esquemaDeCadastro = z.enum(
  CADASTROS,
  "Escolha o que você quer importar.",
);

export const esquemaDeCorrecao = z.object({
  loteId: z.uuid(),
  linhaId: z.uuid(),
  dados: z.record(z.string(), z.string()),
});

export const esquemaDeDecisao = z.object({
  loteId: z.uuid(),
  linhaId: z.uuid(),
  decisao: z.enum(["atualizar", "ignorar"], "Escolha atualizar ou ignorar."),
});

export const esquemaDeConfirmacao = z.object({
  loteId: z.uuid(),
  confirmou: z.boolean(),
});

export const esquemaDeLote = z.object({ loteId: z.uuid() });
