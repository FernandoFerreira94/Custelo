import type { Contexto } from "@/application/auth/contexto";
import { pode } from "@/application/permissoes";
import { ehTerminal } from "@/domain/custodia/estados";
import { MSG, MSG_CUSTODIA } from "@/lib/mensagens";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

import type { CustodiaRepo } from "./ports";
import { anexarEvento, type EventoGravado } from "./registrar-evento";

export type PedidoMover = {
  /** UUIDv7 do evento: repetir o pedido não move duas vezes. */
  eventoId: string;
  paraLocalId: string;
  motivoRapido?: string;
  origem: "online" | "offline";
  superficie: "ops" | "web";
  dispositivoId?: string;
  ocorridoEm: Date;
};

/**
 * Guarda ou move a encomenda de prateleira. Capacidade é referência: local cheio
 * guarda assim mesmo e só avisa (CUS-005).
 */
export function moverEncomenda(
  ctx: Contexto,
  encomendaId: string,
  p: PedidoMover,
  deps: { repo: CustodiaRepo },
): Promise<Resultado<EventoGravado>> {
  if (!pode(ctx.papel, "custodia.mover"))
    return Promise.resolve(falha("SEM_PERMISSAO", MSG.semPermissao));

  return deps.repo.naTransacao(ctx, async (tx) => {
    const evento = {
      id: p.eventoId,
      tipo: "LOCALIZACAO_ALTERADA" as const,
      origem: p.origem,
      superficie: p.superficie,
      dispositivoId: p.dispositivoId,
      ocorridoEm: p.ocorridoEm,
    };
    // Reenvio do mesmo pedido: o local já mudou, então não valida de novo.
    if (await tx.eventoPorId(p.eventoId))
      return anexarEvento(tx, ctx, encomendaId, evento);

    const atual = await tx.travarEncomenda(encomendaId);
    if (!atual) return falha("NAO_ENCONTRADO", MSG_CUSTODIA.naoEncontrada);
    if (ehTerminal(atual.estado))
      return falha("CONFLITO", MSG_CUSTODIA.transicaoProibida(atual.estado));

    const para = await tx.localPorId(p.paraLocalId);
    if (!para?.ativo)
      return falha("ENTRADA_INVALIDA", MSG_CUSTODIA.localInativo);
    if (para.id === atual.localGuardaId)
      return falha("ENTRADA_INVALIDA", MSG_CUSTODIA.mesmoLocal(para.codigo));
    const de = atual.localGuardaId
      ? await tx.localPorId(atual.localGuardaId)
      : null;

    const gravado = await anexarEvento(tx, ctx, encomendaId, {
      ...evento,
      dados: {
        de: { local_guarda_id: atual.localGuardaId, ponto_id: atual.pontoId },
        para: { local_guarda_id: para.id, ponto_id: para.pontoId },
        ...(p.motivoRapido ? { motivo_rapido: p.motivoRapido } : {}),
      },
    });
    if (!gravado.ok) return gravado;

    const cheio = para.capacidade !== null && para.usado >= para.capacidade;
    const mensagem = cheio
      ? MSG_CUSTODIA.localCheio(para.codigo, para.usado + 1, para.capacidade!)
      : de
        ? MSG_CUSTODIA.movida(de.codigo, para.codigo)
        : MSG_CUSTODIA.guardada(para.codigo);
    return sucesso(gravado.data, mensagem);
  });
}
