import { z } from "zod";

/** Fonte única de validação para a action e o formulário (RHF + zodResolver). */

export const esquemaDePessoa = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  unidadeId: z.uuid("Escolha a unidade."),
  tipo: z.enum(
    ["titular", "morador", "inquilino", "dependente"],
    "Escolha o papel.",
  ),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  cpf: z.string().optional(),
  moradorAutorizou: z.boolean().optional(),
});

export const esquemaDeVinculo = z.object({
  pessoaId: z.uuid(),
  unidadeId: z.uuid("Escolha a unidade."),
  tipo: z.enum(
    ["titular", "morador", "inquilino", "dependente"],
    "Escolha o papel.",
  ),
  recebeAviso: z.boolean().optional(),
});

export const esquemaDeEncerramento = z.object({
  vinculoId: z.uuid(),
  motivo: z
    .string()
    .trim()
    .min(
      1,
      "Diga por que o vínculo terminou (mudou, vendeu, erro de cadastro).",
    ),
});

export const esquemaDeAutorizacao = z.object({
  unidadeId: z.uuid("Escolha a unidade."),
  nome: z.string().trim().min(1, "Informe o nome."),
  cpf: z.string().min(1, "Informe o CPF."),
  relacao: z.string().trim().min(1, "Conte a relação (irmã, funcionária…)."),
  valeAte: z.coerce.date("Informe até quando vale."),
  emNomeDePessoaId: z.uuid("Escolha o morador que autoriza."),
  pessoaId: z.uuid().optional(),
});

export const esquemaDeContato = z.object({
  pessoaId: z.uuid(),
  canal: z.enum(["whatsapp", "email"], "Escolha o canal."),
  valor: z.string().trim().min(1, "Informe o contato."),
});

export const esquemaDeConsentimento = z.object({ contatoId: z.uuid() });

export const esquemaDeDetalhe = z.object({
  id: z.uuid(),
  mostrarCpf: z.boolean().optional(),
});

export const esquemaDeRecebeAviso = z.object({
  vinculoId: z.uuid(),
  recebeAviso: z.boolean(),
});

export const esquemaDeId = z.object({ id: z.uuid() });
