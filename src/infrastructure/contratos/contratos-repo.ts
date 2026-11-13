import type postgres from "postgres";

import type { Contexto } from "@/application/auth/contexto";
import {
  CODIGOS_DO_BANCO,
  type CodigoDoBanco,
  type ContratoResumo,
  type ContratosRepo,
  ErroDeContrato,
} from "@/application/contratos/ports";
import { withAppRls } from "@/db/session";
import { getClient } from "@/infrastructure/db/tenant-db";

/** As funções do banco levantam `CODIGO: detalhe`; o prefixo vira ErroDeContrato. */
export function erroDeContrato(erro: unknown): ErroDeContrato | null {
  const mensagem = (erro as { message?: unknown } | null)?.message;
  if (typeof mensagem !== "string") return null;
  const codigo = mensagem.split(":")[0]?.trim();
  return (CODIGOS_DO_BANCO as readonly string[]).includes(codigo ?? "")
    ? new ErroDeContrato(codigo as CodigoDoBanco)
    : null;
}

async function noContexto<T>(
  ctx: Contexto,
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  try {
    return await withAppRls(
      getClient(),
      {
        orgId: ctx.orgId,
        empreendimentoId: ctx.empreendimentoId,
        userId: ctx.usuarioId,
      },
      fn,
    );
  } catch (erro) {
    throw erroDeContrato(erro) ?? erro;
  }
}

export const contratosRepo: ContratosRepo = {
  porId: (ctx, id) =>
    noContexto(ctx, async (tx) => {
      // RLS de contratos_servico: só as duas pontas enxergam.
      const [linha] = await tx<ContratoResumo[]>`
        select c.id, c.status,
               app.prestadora_nome_do_contrato(c.id) as "prestadoraNome",
               c.papeis_permitidos::text[] as "papeisPermitidos"
        from contratos_servico c
        where c.id = ${id}
      `;
      return linha ?? null;
    }),
  propor: (ctx, p) =>
    noContexto(ctx, async (tx) => {
      const [linha] = await tx<{ id: string }[]>`
        select app.propor_contrato(
          ${p.localOrgId}::uuid, ${p.empreendimentoId}::uuid,
          ${p.servico}::contrato_servico_tipo,
          ${p.papeisPermitidos}::papel_codigo[],
          coalesce(${p.inicio ?? null}::date, current_date),
          ${p.fim ?? null}::date
        ) as id
      `;
      return linha!.id;
    }),
  aceitar: (ctx, id) =>
    noContexto(ctx, async (tx) => {
      await tx`select app.aceitar_contrato(${id}::uuid)`;
    }),
  atribuirFuncionario: (ctx, contratoId, usuarioId, papel) =>
    noContexto(ctx, async (tx) => {
      await tx`
        select app.atribuir_funcionario_contrato(
          ${contratoId}::uuid, ${usuarioId}::uuid, ${papel}::papel_codigo
        )
      `;
    }),
  suspenderFuncionario: (ctx, contratoId, usuarioId, motivo) =>
    noContexto(ctx, async (tx) => {
      await tx`
        select app.suspender_funcionario_no_local(
          ${contratoId}::uuid, ${usuarioId}::uuid, ${motivo}
        )
      `;
    }),
  encerrar: (ctx, id, motivo) =>
    noContexto(ctx, async (tx) => {
      await tx`select app.encerrar_contrato(${id}::uuid, ${motivo})`;
    }),
};
