import { z } from "zod";

import type { Contexto } from "@/application/auth/contexto";
import type { CustodiaRepo } from "@/application/custodia/ports";
import { anexarEvento } from "@/application/custodia/registrar-evento";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import { MSG_RECEBIMENTO } from "@/lib/mensagens";
import { falha, type Resultado, sucesso } from "@/lib/resultado";
import type { Clock } from "@/ports/clock";
import type { JobScheduler } from "@/ports/job-scheduler";

export const esquemaDeIdentificacao = z.object({
  encomendaId: z.uuid(),
  eventoId: z.uuid(),
  unidadeId: z.uuid("Escolha a unidade."),
  pessoaId: z.uuid().optional(),
  nomeDestinatario: z.string().trim().max(120).optional(),
  motivo: z.string().trim().max(280).optional(),
});
export type EntradaIdentificacao = z.output<typeof esquemaDeIdentificacao>;

/**
 * CUS-007: dá destino a uma encomenda não identificada. Mesmo evento e mesmo
 * job do recebimento; repetir o pedido não muda nada (idempotente pelo evento).
 */
export async function identificar(
  ctx: Contexto,
  e: EntradaIdentificacao,
  deps: { repo: CustodiaRepo; jobs: JobScheduler; clock: Clock },
): Promise<Resultado<{ repetido: boolean }>> {
  const negado = negarSemPermissao(ctx, "custodia.registrar");
  if (negado) return negado;

  let codigo = "";
  const r = await deps.repo.naTransacao(ctx, async (tx) => {
    const u = await tx.unidadeAtiva(e.unidadeId);
    if (!u) return falha("ENTRADA_INVALIDA", MSG_RECEBIMENTO.unidadeInativa);
    codigo = u.codigo;
    if (e.pessoaId && !(await tx.pessoaDaUnidade(e.pessoaId, e.unidadeId)))
      return falha(
        "ENTRADA_INVALIDA",
        "Esta pessoa não mora nesta unidade. Escolha de novo.",
      );
    const g = await anexarEvento(tx, ctx, e.encomendaId, {
      id: e.eventoId,
      tipo: "IDENTIFICACAO_CONFIRMADA",
      origem: "online",
      superficie: "ops",
      ocorridoEm: deps.clock.now(),
      dados: {
        para: {
          unidade_id: e.unidadeId,
          pessoa_id: e.pessoaId ?? null,
          nome_destinatario: e.pessoaId ? null : (e.nomeDestinatario ?? null),
        },
        ...(e.motivo ? { motivo_identificacao: e.motivo } : {}),
      },
    });
    if (!g.ok) return g;
    if (!e.pessoaId && e.nomeDestinatario && !g.data.repetido)
      await tx.sugerirCadastro({
        unidadeId: e.unidadeId,
        nome: e.nomeDestinatario,
        encomendaId: e.encomendaId,
      });
    return sucesso({ repetido: g.data.repetido });
  });
  if (!r.ok) return r;
  if (!r.data.repetido)
    await deps.jobs
      .enqueue({
        name: "custodia/encomenda.identificada",
        data: { encomendaId: e.encomendaId },
        idempotencyKey: e.eventoId,
      })
      .catch(() => undefined);
  return sucesso(r.data, MSG_RECEBIMENTO.identificada(codigo));
}
