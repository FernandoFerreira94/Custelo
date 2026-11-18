import type { TipoEvento } from "@/domain/custodia/estados";

import type { DadosEvento } from "./ports";

/** Evento como o repo devolve: só o nome do operador, nunca telefone ou CPF. */
export type EventoDaLinha = {
  id: string;
  sequencia: number;
  tipo: TipoEvento;
  dados: DadosEvento;
  motivo: string | null;
  origem: "online" | "offline";
  atorTipo: "usuario" | "sistema";
  atorNome: string | null;
  ocorridoEm: Date;
  registradoEm: Date;
};

/** Códigos legíveis dos ids citados em `dados` (o repo resolve numa consulta só). */
export type Rotulos = {
  unidades: Record<string, string>;
  locais: Record<string, string>;
  pontos: Record<string, string>;
};

export type ItemLinhaDoTempo = {
  id: string;
  tipo: TipoEvento;
  titulo: string;
  descricao: string;
  ocorridoEm: Date;
  /** Selo "Corrigido": uma correção posterior trocou o que este item afirmou. */
  corrigido: boolean;
};

const FUSO = "America/Sao_Paulo";
const hora = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  }).format(d);

const TITULO_PADRAO: Partial<Record<TipoEvento, string>> = {
  NOTIFICACAO_AGENDADA: "Aviso agendado",
  NOTIFICACAO_ENVIADA: "Aviso enviado",
  NOTIFICACAO_FALHOU: "Aviso não entregue",
  NOTIFICACAO_CANCELADA_POR_CORRECAO: "Aviso cancelado pela correção",
  RETIRADA_REGISTRADA: "Retirada",
  RETIRADA_CORRIGIDA: "Retirada corrigida",
  DEVOLUCAO_REGISTRADA: "Devolvida",
  DEVOLUCAO_CORRIGIDA: "Devolução corrigida",
};

const texto = (v: unknown) => (typeof v === "string" ? v : null);

function quem(ev: EventoDaLinha): string {
  return ev.atorTipo === "sistema" ? "Automático" : (ev.atorNome ?? "Equipe");
}

function comOffline(ev: EventoDaLinha, descricao: string): string {
  return ev.origem === "offline"
    ? `${descricao} · registrado sem internet às ${hora(ev.ocorridoEm)}`
    : descricao;
}

export function descreverEvento(
  ev: EventoDaLinha,
  r: Rotulos,
): { titulo: string; descricao: string } {
  const de = ev.dados.de ?? {};
  const para = ev.dados.para ?? {};
  const unidade = (id: unknown) => r.unidades[texto(id) ?? ""] ?? "—";
  const local = (id: unknown) => r.locais[texto(id) ?? ""] ?? "—";
  const nome = quem(ev);
  const motivo = `Motivo: ${ev.motivo ?? "—"} · ${nome}`;

  const base = ((): { titulo: string; descricao: string } => {
    switch (ev.tipo) {
      case "RECEBIMENTO_REGISTRADO":
        return ev.dados.com_foto
          ? { titulo: "Recebida com foto da etiqueta", descricao: nome }
          : { titulo: "Recebida sem foto", descricao: nome };
      case "MARCADA_NAO_IDENTIFICADA":
        return {
          titulo: "Sem destino identificado",
          descricao: `Aguarda identificação · ${nome}`,
        };
      case "IDENTIFICACAO_CONFIRMADA":
        return {
          titulo: `Destino identificado: ${unidade(para.unidade_id)}`,
          descricao: `Por ${nome}`,
        };
      case "LOCALIZACAO_ALTERADA": {
        const motivoRapido = texto(ev.dados.motivo_rapido);
        if (!de.local_guarda_id)
          return {
            titulo: `Guardada na ${local(para.local_guarda_id)}`,
            descricao: `${nome} · ${r.pontos[texto(para.ponto_id) ?? ""] ?? "Portaria"}`,
          };
        return {
          titulo: `Movida de ${local(de.local_guarda_id)} para ${local(para.local_guarda_id)}`,
          descricao: motivoRapido ? `${nome} · ${motivoRapido}` : nome,
        };
      }
      case "ETIQUETA_IMPRESSA": {
        const vez =
          typeof ev.dados.impressao === "number" ? ev.dados.impressao : 1;
        return {
          titulo: "Etiqueta impressa",
          descricao: `${vez}ª impressão · ${nome}`,
        };
      }
      case "ASSOCIACAO_CORRIGIDA":
        return {
          titulo: `Unidade corrigida de ${unidade(de.unidade_id)} para ${unidade(para.unidade_id)}`,
          descricao: motivo,
        };
      case "REGISTRO_CANCELADO":
        return { titulo: "Registro cancelado", descricao: motivo };
      default:
        return {
          titulo: TITULO_PADRAO[ev.tipo] ?? "Registro",
          descricao: nome,
        };
    }
  })();
  return { ...base, descricao: comOffline(ev, base.descricao) };
}

/**
 * Monta a linha do tempo (CUS-003), mais recente primeiro. O recebimento com a
 * identificação confirmada na mesma transação vira um item só, como na prancha.
 */
export function agruparLinhaDoTempo(
  eventos: EventoDaLinha[],
  r: Rotulos,
): ItemLinhaDoTempo[] {
  const ordem = [...eventos].sort((a, b) => a.sequencia - b.sequencia);
  const itens: (ItemLinhaDoTempo & { unidadeAfirmada?: string })[] = [];

  for (let i = 0; i < ordem.length; i++) {
    const ev = ordem[i]!;
    const prox = ordem[i + 1];
    if (
      ev.tipo === "RECEBIMENTO_REGISTRADO" &&
      prox?.tipo === "IDENTIFICACAO_CONFIRMADA" &&
      prox.registradoEm.getTime() === ev.registradoEm.getTime()
    ) {
      const unidadeId = texto(prox.dados.para?.unidade_id) ?? "";
      const codigo = r.unidades[unidadeId] ?? "—";
      const comFoto = Boolean(ev.dados.com_foto);
      const descricao = comFoto
        ? `Sugestão lida: ${codigo} · confirmada por ${quem(prox)}`
        : `Registrada à mão por ${quem(prox)}`;
      itens.push({
        id: ev.id,
        tipo: ev.tipo,
        titulo: comFoto ? "Recebida com foto da etiqueta" : "Recebida sem foto",
        descricao: comOffline(ev, descricao),
        ocorridoEm: ev.ocorridoEm,
        corrigido: false,
        unidadeAfirmada: unidadeId,
      });
      i++;
      continue;
    }

    if (ev.tipo === "ASSOCIACAO_CORRIGIDA") {
      const antiga = texto(ev.dados.de?.unidade_id);
      const afirmou = itens.findLast((it) => it.unidadeAfirmada === antiga);
      if (afirmou) afirmou.corrigido = true;
    }
    itens.push({
      id: ev.id,
      tipo: ev.tipo,
      ...descreverEvento(ev, r),
      ocorridoEm: ev.ocorridoEm,
      corrigido: false,
      unidadeAfirmada: texto(ev.dados.para?.unidade_id) ?? undefined,
    });
  }

  return itens.reverse().map(({ unidadeAfirmada: _u, ...item }) => item);
}
