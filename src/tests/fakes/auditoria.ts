import type {
  Auditoria,
  EntradaAuditoria,
} from "@/application/auditoria/ports";

export function criarAuditoriaFake() {
  const entradas: EntradaAuditoria[] = [];
  const auditoria: Auditoria = {
    async registrar(_ctx, e) {
      entradas.push(e);
    },
  };
  return { auditoria, entradas };
}
