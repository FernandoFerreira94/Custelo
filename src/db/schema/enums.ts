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
