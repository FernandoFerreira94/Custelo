/** Papeis com leitura na superficie de gestao (WEB). */
const GESTAO_READ_ROLES = new Set([
  "platform_super_admin",
  "org_admin",
  "empreendimento_gestor",
  "auditor",
]);

/** Papeis com escrita em estrutura fisica e pessoas. */
const GESTAO_WRITE_ROLES = new Set([
  "platform_super_admin",
  "org_admin",
  "empreendimento_gestor",
]);

export function canReadGestao(papelCodigo: string | undefined): boolean {
  return Boolean(papelCodigo && GESTAO_READ_ROLES.has(papelCodigo));
}

export function canWriteGestao(papelCodigo: string | undefined): boolean {
  return Boolean(papelCodigo && GESTAO_WRITE_ROLES.has(papelCodigo));
}
