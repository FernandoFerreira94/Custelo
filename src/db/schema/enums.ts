import { pgEnum } from "drizzle-orm/pg-core";

/** Status da conta contratante. */
export const organizacaoStatusEnum = pgEnum("organizacao_status", [
  "ativa",
  "suspensa",
  "offboarding",
]);

/** Status operacional do empreendimento. */
export const empreendimentoStatusEnum = pgEnum("empreendimento_status", [
  "ativo",
  "inativo",
]);

/** Ciclo de vida do usuario no produto (revogacao imediata via user_status). */
export const usuarioStatusEnum = pgEnum("usuario_status", [
  "ativo",
  "desativado",
  "convite_pendente",
]);

/** Codigos estaveis de papel — espelham auth-rbac SKILL. */
export const papelCodigoEnum = pgEnum("papel_codigo", [
  "platform_super_admin",
  "org_admin",
  "empreendimento_gestor",
  "recepcionista",
  "auditor",
]);

/** Conta contratante (condominio) ou prestadora de servico (D20). */
export const organizacaoTipoEnum = pgEnum("organizacao_tipo", [
  "contratante",
  "prestadora",
]);

/** Servico prestado por contrato (D20). */
export const contratoServicoTipoEnum = pgEnum("contrato_servico_tipo", [
  "portaria",
  "vigilancia",
]);

/** Ciclo de vida do contrato: so o condominio ativa (aceite). */
export const contratoStatusEnum = pgEnum("contrato_status", [
  "proposto",
  "ativo",
  "suspenso",
  "encerrado",
]);

/** Papel da pessoa na unidade (pessoas-vinculos). */
export const vinculoTipoEnum = pgEnum("vinculo_tipo", [
  "titular",
  "morador",
  "dependente",
  "inquilino",
  "autorizado",
]);

/** Ciclo de vida do vinculo pessoa-unidade. */
export const vinculoStatusEnum = pgEnum("vinculo_status", [
  "ativo",
  "encerrado",
]);

/** Tipo da unidade-destino (area comum tem responsavel). */
export const unidadeTipoEnum = pgEnum("unidade_tipo", [
  "apartamento",
  "casa",
  "sala",
  "loja",
  "area_comum",
  "outro",
]);

export const contatoCanalEnum = pgEnum("contato_canal", ["whatsapp", "email"]);

export const contatoStatusEnum = pgEnum("contato_status", [
  "valido",
  "falha",
  "precisa_confirmacao",
]);
