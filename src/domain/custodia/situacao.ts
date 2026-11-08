import { type Estado, ehTerminal } from "./estados";

export type Situacao =
  | "recebida"
  | "aguardando"
  | "naoIdent"
  | "falha"
  | "pronta"
  | "retirada"
  | "devolvida"
  | "cancelada";
export type Badge = Situacao | "urgente";

export type Prazos = {
  lembreteDias: number;
  lembreteLigado: boolean;
  atrasoDias: number;
  atrasoLigado: boolean;
  devolucaoDias: number;
  devolucaoLigado: boolean;
};

/** Padrões da prancha CFG-005 (`pz-config/config.tsx · REGRAS`). O banco tem os mesmos defaults. */
export const PRAZOS_PADRAO: Prazos = {
  lembreteDias: 2,
  lembreteLigado: true,
  atrasoDias: 7,
  atrasoLigado: true,
  devolucaoDias: 30,
  devolucaoLigado: true,
};

const POR_ESTADO: Record<Estado, Situacao> = {
  RECEBIDA: "recebida",
  IDENTIFICADA: "recebida",
  NAO_IDENTIFICADA: "naoIdent",
  AGUARDANDO_NOTIFICACAO: "aguardando",
  NOTIFICADA: "pronta",
  FALHA_NOTIFICACAO: "falha",
  RETIRADA: "retirada",
  DEVOLVIDA: "devolvida",
  CANCELADA: "cancelada",
};

const DIA = 86_400_000;

export type LeituraSituacao = {
  situacao: Situacao;
  badge: Badge;
  atrasada: boolean;
  sugerirDevolucao: boolean;
  lembreteDevido: boolean;
  diasNaPortaria: number;
};

export function lerSituacao(
  e: { estado: Estado; ocorridoEm: Date; lembreteEnviado?: boolean },
  agora: Date,
  p: Prazos,
): LeituraSituacao {
  const situacao = POR_ESTADO[e.estado];
  const ativa = !ehTerminal(e.estado);
  const idade = Math.max(0, agora.getTime() - e.ocorridoEm.getTime());
  const atrasada = ativa && p.atrasoLigado && idade >= p.atrasoDias * DIA;
  return {
    situacao,
    badge:
      atrasada &&
      (situacao === "recebida" ||
        situacao === "aguardando" ||
        situacao === "pronta")
        ? "urgente"
        : situacao,
    atrasada,
    sugerirDevolucao:
      ativa && p.devolucaoLigado && idade >= p.devolucaoDias * DIA,
    lembreteDevido:
      e.estado === "NOTIFICADA" &&
      p.lembreteLigado &&
      !e.lembreteEnviado &&
      idade >= p.lembreteDias * DIA,
    diasNaPortaria: Math.floor(idade / DIA),
  };
}
