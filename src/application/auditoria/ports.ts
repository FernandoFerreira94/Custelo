export type EntradaAuditoria = {
  acao: string; // MAIÚSCULAS_COM_UNDERSCORE
  alvoTipo: string;
  alvoId?: string;
  antes?: Record<string, unknown>;
  depois?: Record<string, unknown>;
  motivo?: string;
  origem: "web" | "ops" | "saas" | "sistema" | "suporte_jit" | "importacao";
};

export interface Auditoria {
  registrar(
    ctx: { orgId: string; empreendimentoId: string; usuarioId: string | null },
    e: EntradaAuditoria,
  ): Promise<void>;
}

/** Mínimo necessário na trilha: `a***@dominio.com`, nunca o e-mail inteiro. */
export function mascararEmail(email: string): string {
  const [local = "", dominio = ""] = email.split("@");
  return `${local.slice(0, 1)}***@${dominio}`;
}
