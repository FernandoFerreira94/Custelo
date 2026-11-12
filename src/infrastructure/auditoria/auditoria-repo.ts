import "server-only";

import type { Auditoria } from "@/application/auditoria/ports";
import { auditLog } from "@/db/schema";
import { withTenantDb } from "@/infrastructure/db/tenant-db";

export const auditoriaRepo: Auditoria = {
  async registrar(ctx, e) {
    await withTenantDb(
      {
        orgId: ctx.orgId,
        empreendimentoId: ctx.empreendimentoId,
        userId: ctx.usuarioId ?? "",
      },
      (db) =>
        db.insert(auditLog).values({
          orgId: ctx.orgId,
          empreendimentoId: ctx.empreendimentoId,
          atorUsuarioId: ctx.usuarioId,
          acao: e.acao,
          alvoTipo: e.alvoTipo,
          alvoId: e.alvoId,
          antes: e.antes,
          depois: e.depois,
          motivo: e.motivo,
          origem: e.origem,
        }),
    );
  },
};
