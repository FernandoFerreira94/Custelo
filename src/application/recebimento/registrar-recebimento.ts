import type { Contexto } from "@/application/auth/contexto";
import type { CustodiaRepo, NovoEvento } from "@/application/custodia/ports";
import { anexarEvento } from "@/application/custodia/registrar-evento";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import { codigoCurto } from "@/domain/custodia/codigo";
import { MSG_CUSTODIA, MSG_RECEBIMENTO } from "@/lib/mensagens";
import { falha, type Resultado, sucesso } from "@/lib/resultado";
import type { Clock } from "@/ports/clock";
import type { JobScheduler } from "@/ports/job-scheduler";

import type { EntradaRecebimento } from "./schemas";

export type Recebido = {
  encomendaId: string;
  codigoCurto: string;
  identificada: boolean;
  repetido: boolean;
};

/** Relógio do aparelho mais de 10 min à frente: grava assim mesmo e marca o desvio. */
const DESVIO_ALERTA_S = 600;

/**
 * Registra o recebimento numa transação: encomenda + RECEBIMENTO_REGISTRADO +
 * destino (identificada ou não) + guarda, mais foto, leitura e sugestão de
 * cadastro. Idempotente pelo id do evento de recebimento (duplo toque, reenvio
 * offline). O aviso (I7) sai depois do commit e nunca desfaz o registro.
 */
export async function registrarRecebimento(
  ctx: Contexto,
  e: EntradaRecebimento,
  deps: { repo: CustodiaRepo; jobs: JobScheduler; clock: Clock },
): Promise<Resultado<Recebido>> {
  const negado = negarSemPermissao(ctx, "custodia.registrar");
  if (negado) return negado;

  const ocorridoEm = new Date(e.ocorridoEm);
  const desvioS = Math.round(
    (ocorridoEm.getTime() - deps.clock.now().getTime()) / 1000,
  );
  const base = {
    origem: e.origem,
    superficie: "ops" as const,
    dispositivoId: e.dispositivoId,
    ocorridoEm,
  };
  let mensagem: string = MSG_RECEBIMENTO.naoIdentificada;

  const r = await deps.repo.naTransacao<Recebido>(ctx, async (tx) => {
    const ja = await tx.eventoPorId(e.eventos.recebimento);
    if (ja) {
      if (ja.encomendaId !== e.encomendaId)
        return falha("CONFLITO", MSG_CUSTODIA.idRepetido);
      mensagem = "Já estava registrada.";
      return sucesso({
        encomendaId: e.encomendaId,
        codigoCurto: codigoCurto(e.encomendaId),
        identificada: ja.estadoNovo !== "NAO_IDENTIFICADA",
        repetido: true,
      });
    }

    // Valida o destino antes de criar qualquer coisa.
    let codigoUnidade: string | null = null;
    if (e.destino.tipo === "unidade") {
      const u = await tx.unidadeAtiva(e.destino.unidadeId);
      if (!u) return falha("ENTRADA_INVALIDA", MSG_RECEBIMENTO.unidadeInativa);
      codigoUnidade = u.codigo;
      if (e.destino.pessoaId) {
        const p = await tx.pessoaDaUnidade(
          e.destino.pessoaId,
          e.destino.unidadeId,
        );
        if (!p)
          return falha(
            "ENTRADA_INVALIDA",
            "Esta pessoa não mora nesta unidade. Escolha de novo.",
          );
      }
    }
    const local = e.localGuardaId ? await tx.localPorId(e.localGuardaId) : null;
    if (e.localGuardaId && !local?.ativo)
      return falha("ENTRADA_INVALIDA", MSG_CUSTODIA.localInativo);

    await tx.criarEncomenda({
      id: e.encomendaId,
      codigoCurto: codigoCurto(e.encomendaId),
      pontoId: e.pontoId,
      transportadora: e.transportadora ?? null,
      rastreio: e.rastreio ?? null,
      volumes: e.volumes,
      observacao: e.observacao ?? null,
      origem: e.origem,
      ocorridoEm,
      recebidoPor: ctx.usuarioId,
    });

    const aceita =
      e.leitura && e.destino.tipo === "unidade"
        ? e.leitura.unidadeSugeridaId === e.destino.unidadeId
        : false;
    const rec: NovoEvento = {
      ...base,
      id: e.eventos.recebimento,
      tipo: "RECEBIMENTO_REGISTRADO",
      dados: {
        com_foto: e.comFoto,
        ...(e.leitura
          ? { leitura: { confianca: e.leitura.confianca, aceita } }
          : {}),
        ...(desvioS > DESVIO_ALERTA_S ? { relogio_desvio_s: desvioS } : {}),
      },
    };
    const gravado = await anexarEvento(tx, ctx, e.encomendaId, rec);
    if (!gravado.ok) return gravado;

    if (e.destino.tipo === "unidade") {
      const d = e.destino;
      const ident = await anexarEvento(tx, ctx, e.encomendaId, {
        ...base,
        id: e.eventos.destino,
        tipo: "IDENTIFICACAO_CONFIRMADA",
        dados: {
          para: {
            unidade_id: d.unidadeId,
            pessoa_id: d.pessoaId ?? null,
            nome_destinatario: d.pessoaId ? null : (d.nomeDestinatario ?? null),
          },
          ...(d.avisarUnidadeToda ? { avisar_unidade: true } : {}),
          ...(e.leitura && !aceita && e.leitura.unidadeSugeridaId
            ? { sugerida: e.leitura.unidadeSugeridaId }
            : {}),
        },
      });
      if (!ident.ok) return ident;
      if (!d.pessoaId && d.nomeDestinatario) {
        await tx.sugerirCadastro({
          unidadeId: d.unidadeId,
          nome: d.nomeDestinatario,
          encomendaId: e.encomendaId,
        });
        mensagem = MSG_RECEBIMENTO.salvoSemPessoa(
          d.nomeDestinatario.split(" ")[0]!,
          codigoUnidade!,
        );
      } else {
        mensagem = MSG_RECEBIMENTO.salvo(codigoUnidade!);
      }
    } else {
      const nao = await anexarEvento(tx, ctx, e.encomendaId, {
        ...base,
        id: e.eventos.destino,
        tipo: "MARCADA_NAO_IDENTIFICADA",
      });
      if (!nao.ok) return nao;
    }

    if (local && e.eventos.local) {
      const guardado = await anexarEvento(tx, ctx, e.encomendaId, {
        ...base,
        id: e.eventos.local,
        tipo: "LOCALIZACAO_ALTERADA",
        dados: {
          de: { local_guarda_id: null },
          para: { local_guarda_id: local.id, ponto_id: local.pontoId },
        },
      });
      if (!guardado.ok) return guardado;
    }

    if (e.foto) await tx.gravarFoto(e.encomendaId, e.foto);
    if (e.leitura)
      await tx.vincularLeitura(e.leitura.id, e.encomendaId, aceita);

    return sucesso({
      encomendaId: e.encomendaId,
      codigoCurto: codigoCurto(e.encomendaId),
      identificada: e.destino.tipo === "unidade",
      repetido: false,
    });
  });

  if (!r.ok) return r;
  if (r.data.identificada && !r.data.repetido) {
    // Falha aqui não desfaz o registro: a I7 varre identificada sem aviso.
    await deps.jobs
      .enqueue({
        name: "custodia/encomenda.identificada",
        data: { encomendaId: e.encomendaId },
        idempotencyKey: e.eventos.destino,
      })
      .catch(() => undefined);
  }
  return sucesso(r.data, mensagem);
}
