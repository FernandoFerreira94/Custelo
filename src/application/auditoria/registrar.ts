import type {
  Auditoria,
  EntradaAuditoria,
} from "@/application/auditoria/ports";
import type { Contexto } from "@/application/auth/contexto";
import { log } from "@/infrastructure/observability/logger";

/**
 * Registra depois da operação que deu certo. Falha de auditoria não desfaz o que
 * já foi feito, mas vira log de erro para alguém agir (nunca com dado pessoal).
 */
export async function registrarAuditoria(
  auditoria: Auditoria,
  ctx: Contexto,
  entrada: EntradaAuditoria,
): Promise<void> {
  try {
    await auditoria.registrar(
      {
        orgId: ctx.orgId,
        empreendimentoId: ctx.empreendimentoId,
        usuarioId: ctx.usuarioId,
      },
      entrada,
    );
  } catch {
    log("error", {
      msg: `falha_auditoria:${entrada.acao}`,
      org_id: ctx.orgId,
      empreendimento_id: ctx.empreendimentoId,
    });
  }
}
