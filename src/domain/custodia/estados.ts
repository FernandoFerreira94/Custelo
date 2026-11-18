import type { Permissao } from "@/application/permissoes";
import { MSG_CUSTODIA } from "@/lib/mensagens";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export const ESTADOS = [
  "RECEBIDA",
  "IDENTIFICADA",
  "NAO_IDENTIFICADA",
  "AGUARDANDO_NOTIFICACAO",
  "NOTIFICADA",
  "FALHA_NOTIFICACAO",
  "RETIRADA",
  "DEVOLVIDA",
  "CANCELADA",
] as const;
export type Estado = (typeof ESTADOS)[number];

export const TIPOS_EVENTO = [
  "RECEBIMENTO_REGISTRADO",
  "IDENTIFICACAO_CONFIRMADA",
  "MARCADA_NAO_IDENTIFICADA",
  "LOCALIZACAO_ALTERADA",
  "ETIQUETA_IMPRESSA",
  "NOTIFICACAO_AGENDADA",
  "NOTIFICACAO_ENVIADA",
  "NOTIFICACAO_FALHOU",
  "NOTIFICACAO_CANCELADA_POR_CORRECAO",
  "ASSOCIACAO_CORRIGIDA",
  "RETIRADA_REGISTRADA",
  "RETIRADA_CORRIGIDA",
  "DEVOLUCAO_REGISTRADA",
  "DEVOLUCAO_CORRIGIDA",
  "REGISTRO_CANCELADO",
] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];

const TERMINAIS: readonly Estado[] = ["RETIRADA", "DEVOLVIDA", "CANCELADA"];
const IDENTIFICADOS: readonly Estado[] = [
  "IDENTIFICADA",
  "AGUARDANDO_NOTIFICACAO",
  "NOTIFICADA",
  "FALHA_NOTIFICACAO",
];

export const ehTerminal = (e: Estado) => TERMINAIS.includes(e);
export const ehIdentificada = (e: Estado) => IDENTIFICADOS.includes(e);

/** Quem pode emitir cada evento. "sistema" = só jobs (I7); usuário nunca emite. */
export const PERMISSAO_DO_EVENTO: Record<TipoEvento, Permissao | "sistema"> = {
  RECEBIMENTO_REGISTRADO: "custodia.registrar",
  IDENTIFICACAO_CONFIRMADA: "custodia.registrar",
  MARCADA_NAO_IDENTIFICADA: "custodia.registrar",
  ETIQUETA_IMPRESSA: "custodia.registrar",
  LOCALIZACAO_ALTERADA: "custodia.mover",
  NOTIFICACAO_AGENDADA: "sistema",
  NOTIFICACAO_ENVIADA: "sistema",
  NOTIFICACAO_FALHOU: "sistema",
  NOTIFICACAO_CANCELADA_POR_CORRECAO: "sistema",
  ASSOCIACAO_CORRIGIDA: "custodia.corrigir",
  REGISTRO_CANCELADO: "custodia.cancelar",
  RETIRADA_REGISTRADA: "retirada.registrar",
  RETIRADA_CORRIGIDA: "retirada.corrigir",
  DEVOLUCAO_REGISTRADA: "devolucao.registrar",
  DEVOLUCAO_CORRIGIDA: "devolucao.corrigir",
};

const ELEVADOS: readonly TipoEvento[] = [
  "ASSOCIACAO_CORRIGIDA",
  "REGISTRO_CANCELADO",
  "RETIRADA_CORRIGIDA",
  "DEVOLUCAO_CORRIGIDA",
];
/** Permissão elevada: exige motivo (mín. 10 caracteres) e entra no audit_log. */
export const ehElevado = (t: TipoEvento) => ELEVADOS.includes(t);

function proximo(
  atual: Estado | null,
  tipo: TipoEvento,
  lembrete: boolean,
): Estado | null {
  if (atual === null)
    return tipo === "RECEBIMENTO_REGISTRADO" ? "RECEBIDA" : null;
  if (ehTerminal(atual)) {
    if (atual === "RETIRADA" && tipo === "RETIRADA_CORRIGIDA")
      return "RETIRADA";
    if (atual === "DEVOLVIDA" && tipo === "DEVOLUCAO_CORRIGIDA")
      return "DEVOLVIDA";
    return null;
  }
  switch (tipo) {
    case "RECEBIMENTO_REGISTRADO":
    case "RETIRADA_CORRIGIDA":
    case "DEVOLUCAO_CORRIGIDA":
      return null;
    case "IDENTIFICACAO_CONFIRMADA":
      return atual === "RECEBIDA" || atual === "NAO_IDENTIFICADA"
        ? "IDENTIFICADA"
        : null;
    case "MARCADA_NAO_IDENTIFICADA":
      return atual === "RECEBIDA" ? "NAO_IDENTIFICADA" : null;
    case "LOCALIZACAO_ALTERADA":
    case "ETIQUETA_IMPRESSA":
    case "NOTIFICACAO_CANCELADA_POR_CORRECAO":
      return atual;
    case "NOTIFICACAO_AGENDADA":
      if (lembrete) return atual === "NOTIFICADA" ? "NOTIFICADA" : null;
      return atual === "IDENTIFICADA" || atual === "FALHA_NOTIFICACAO"
        ? "AGUARDANDO_NOTIFICACAO"
        : null;
    case "NOTIFICACAO_ENVIADA":
      if (lembrete) return atual === "NOTIFICADA" ? "NOTIFICADA" : null;
      return atual === "AGUARDANDO_NOTIFICACAO" || atual === "FALHA_NOTIFICACAO"
        ? "NOTIFICADA"
        : null;
    case "NOTIFICACAO_FALHOU":
      if (lembrete) return atual === "NOTIFICADA" ? "NOTIFICADA" : null;
      return atual === "AGUARDANDO_NOTIFICACAO" || atual === "NOTIFICADA"
        ? "FALHA_NOTIFICACAO"
        : null;
    case "ASSOCIACAO_CORRIGIDA":
      return ehIdentificada(atual) ? "IDENTIFICADA" : null;
    case "RETIRADA_REGISTRADA":
      return ehIdentificada(atual) ? "RETIRADA" : null;
    case "DEVOLUCAO_REGISTRADA":
      return "DEVOLVIDA";
    case "REGISTRO_CANCELADO":
      return "CANCELADA";
  }
}

export function transicionar(
  atual: Estado | null,
  tipo: TipoEvento,
  opcoes: { lembrete?: boolean } = {},
): Resultado<Estado> {
  const p = proximo(atual, tipo, opcoes.lembrete ?? false);
  return p
    ? sucesso(p)
    : falha("CONFLITO", MSG_CUSTODIA.transicaoProibida(atual));
}
