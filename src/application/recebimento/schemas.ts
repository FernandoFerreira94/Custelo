import { z } from "zod";

const texto = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? undefined : v))
    .optional();

/** Fonte única: a action online, a rota da fila offline (I6) e o formulário usam este esquema. */
export const esquemaDeRecebimento = z.object({
  encomendaId: z.uuid(),
  eventos: z.object({
    recebimento: z.uuid(),
    destino: z.uuid(),
    local: z.uuid().optional(),
  }),
  destino: z.discriminatedUnion("tipo", [
    z.object({
      tipo: z.literal("unidade"),
      unidadeId: z.uuid("Escolha a unidade."),
      pessoaId: z.uuid().optional(),
      nomeDestinatario: texto(120),
      avisarUnidadeToda: z.boolean().optional(),
    }),
    z.object({ tipo: z.literal("nao_identificada") }),
  ]),
  pontoId: z.uuid(),
  localGuardaId: z.uuid().optional(),
  transportadora: texto(60),
  rastreio: texto(60),
  volumes: z
    .number()
    .int()
    .min(1, "Pelo menos 1 volume.")
    .max(20, "No máximo 20 volumes."),
  observacao: texto(280),
  comFoto: z.boolean(),
  foto: z
    .object({
      caminho: z.string().min(10).max(300),
      sha256: z.string().regex(/^[0-9a-f]{64}$/),
      bytes: z.number().int().min(1).max(1_572_864),
      mime: z.enum(["image/jpeg", "image/webp"]),
    })
    .optional(),
  leitura: z
    .object({
      id: z.uuid(),
      confianca: z.enum(["alta", "media", "baixa", "nenhuma"]),
      unidadeSugeridaId: z.uuid().nullable(),
    })
    .optional(),
  origem: z.enum(["online", "offline"]),
  ocorridoEm: z.iso.datetime({ offset: true }),
  dispositivoId: z.string().min(1).max(80),
});

export type EntradaRecebimento = z.output<typeof esquemaDeRecebimento>;
