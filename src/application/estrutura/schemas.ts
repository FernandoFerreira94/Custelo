import { z } from "zod";

/** Fonte única de validação: a action e o formulário (RHF + zodResolver) usam os mesmos. */

const textoOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullish();

export const TIPOS_DE_UNIDADE = [
  "apartamento",
  "casa",
  "sala",
  "loja",
  "area_comum",
  "outro",
] as const;

export const esquemaDeUnidade = z.object({
  bloco: textoOpcional,
  numero: z.string().trim().min(1, "Informe o número da unidade."),
  tipo: z.enum(TIPOS_DE_UNIDADE, "Escolha o tipo."),
  areaId: z.uuid().nullish(),
  apelidos: z.array(z.string()).max(20, "No máximo 20 apelidos.").optional(),
  nome: textoOpcional,
  responsavelPessoaId: z.uuid().nullish(),
  avisarResponsavel: z.boolean().optional(),
});

export const esquemaDeEdicaoDeUnidade = z.object({
  id: z.uuid(),
  codigo: z.string().trim().min(1, "Informe o código da unidade.").optional(),
  tipo: z.enum(TIPOS_DE_UNIDADE).optional(),
  areaId: z.uuid().nullish(),
  apelidos: z.array(z.string()).max(20, "No máximo 20 apelidos.").optional(),
  nome: textoOpcional,
  responsavelPessoaId: z.uuid().nullish(),
  avisarResponsavel: z.boolean().optional(),
});

export const esquemaDeGeracao = z.object({
  blocos: z.union([
    z.number().int().min(0, "Informe zero ou mais blocos.").max(26),
    z.array(z.string().trim().min(1)).min(1).max(100),
  ]),
  andares: z.number().int().min(1, "Informe ao menos 1 andar."),
  porAndar: z.number().int().min(1, "Informe ao menos 1 unidade por andar."),
  numeracao: z.enum(["andar", "seq"], "Escolha a numeração."),
});

export const esquemaDeArea = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  parentId: z.uuid().nullish(),
  ordem: z.number().int().optional(),
});

export const esquemaDeEdicaoDeArea = z.object({
  id: z.uuid(),
  nome: z.string().trim().min(1, "Informe o nome.").optional(),
  parentId: z.uuid().nullish(),
  ordem: z.number().int().optional(),
});

export const esquemaDePonto = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  funcionamento: textoOpcional,
});

export const esquemaDeEdicaoDePonto = z.object({
  id: z.uuid(),
  nome: z.string().trim().min(1, "Informe o nome.").optional(),
  funcionamento: textoOpcional,
  ativo: z.boolean().optional(),
});

export const esquemaDeId = z.object({ id: z.uuid() });
