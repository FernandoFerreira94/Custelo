import type { Contexto } from "@/application/auth/contexto";
import { pode } from "@/application/permissoes";
import {
  ehElevado,
  type Estado,
  PERMISSAO_DO_EVENTO,
  transicionar,
} from "@/domain/custodia/estados";
import { MSG, MSG_CORRECAO, MSG_CUSTODIA } from "@/lib/mensagens";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

import type { CustodiaRepo, CustodiaTx, NovoEvento } from "./ports";

export type EventoGravado = {
  estado: Estado;
  sequencia: number;
  repetido: boolean;
};

const MOTIVO_MINIMO = 10;

export function validarEmissor(ctx: Contexto, ev: NovoEvento): Resultado<void> {
  const permissao = PERMISSAO_DO_EVENTO[ev.tipo];
  if (permissao === "sistema" || !pode(ctx.papel, permissao))
    return falha("SEM_PERMISSAO", MSG.semPermissao);
  if (ehElevado(ev.tipo) && (ev.motivo?.trim().length ?? 0) < MOTIVO_MINIMO) {
    return falha("ENTRADA_INVALIDA", MSG_CORRECAO.motivoObrigatorio, {
      motivo: MSG_CORRECAO.motivoObrigatorio,
    });
  }
  return sucesso(undefined);
}

/**
 * Anexa um evento dentro de uma transação já aberta (recebimento, retirada 1:N,
 * correção). É a única forma de mudar a custódia: o banco confere a ordem de novo.
 */
export async function anexarEvento(
  tx: CustodiaTx,
  ctx: Contexto,
  encomendaId: string,
  ev: NovoEvento,
): Promise<Resultado<EventoGravado>> {
  const valido = validarEmissor(ctx, ev);
  if (!valido.ok) return valido;

  const repetido = await tx.eventoPorId(ev.id);
  if (repetido) {
    if (repetido.encomendaId !== encomendaId)
      return falha("CONFLITO", MSG_CUSTODIA.idRepetido);
    return sucesso({
      estado: repetido.estadoNovo,
      sequencia: repetido.sequencia,
      repetido: true,
    });
  }

  const atual = await tx.travarEncomenda(encomendaId);
  if (!atual) return falha("NAO_ENCONTRADO", MSG_CUSTODIA.naoEncontrada);

  const anterior = atual.versao === 0 ? null : atual.estado;
  const proximo = transicionar(anterior, ev.tipo, { lembrete: ev.lembrete });
  if (!proximo.ok) return proximo;

  const sequencia = atual.versao + 1;
  await tx.inserirEvento({
    ...ev,
    dados: ev.dados ?? {},
    encomendaId,
    sequencia,
    estadoAnterior: anterior,
    estadoNovo: proximo.data,
    atorTipo: "usuario",
    atorUsuarioId: ctx.usuarioId,
  });

  if (ehElevado(ev.tipo)) {
    await tx.auditar({
      acao: ev.tipo,
      alvoTipo: "encomenda",
      alvoId: encomendaId,
      antes: ev.dados?.de,
      depois: ev.dados?.para,
      motivo: ev.motivo,
      origem: ev.superficie,
    });
  }
  return sucesso({ estado: proximo.data, sequencia, repetido: false });
}

export function registrarEvento(
  ctx: Contexto,
  encomendaId: string,
  ev: NovoEvento,
  deps: { repo: CustodiaRepo },
): Promise<Resultado<EventoGravado>> {
  return deps.repo.naTransacao(ctx, (tx) =>
    anexarEvento(tx, ctx, encomendaId, ev),
  );
}
