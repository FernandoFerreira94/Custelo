import type { Contexto } from "@/application/auth/contexto";
import type {
  Alerta,
  CadastroMatching,
  Confianca,
} from "@/domain/recebimento/matching";
import type { MotivoFalhaLeitura } from "@/ports/label-extractor";

export type ConfigLeitura = {
  leituraAutomatica: boolean;
  leiturasPorDia: number;
  /** Leituras já feitas hoje no fuso do empreendimento. */
  leiturasHoje: number;
};

/** O que fica no banco da leitura: só os campos usados na tela, nunca as linhas. */
export type NovaLeitura = {
  provedor: string;
  modelo: string;
  versaoPrompt: string;
  latenciaMs: number;
  resultado: "ok" | MotivoFalhaLeitura;
  confianca: Confianca;
  unidadeLida: string | null;
  nomeLido: string | null;
  unidadeSugeridaId: string | null;
  pessoaSugeridaId: string | null;
  tokensEntrada: number | null;
  tokensSaida: number | null;
  custoMicroUsd: number | null;
};

export interface LeituraRepo {
  configLeitura(ctx: Contexto): Promise<ConfigLeitura>;
  /** Unidades ativas + pessoas com vínculo ativo ou encerrado há até 12 meses. */
  cadastroMatching(ctx: Contexto): Promise<CadastroMatching>;
  gravarLeitura(ctx: Contexto, l: NovaLeitura): Promise<string>;
}

/** A sugestão como a tela recebe (com código e nome, sem as linhas lidas). */
export type SugestaoDto = {
  confianca: Confianca;
  unidade: { id: string; codigo: string } | null;
  pessoa: { id: string; nome: string } | null;
  candidatas: { id: string; codigo: string }[];
  alertas: Alerta[];
  exMorador: { nome: string; encerradoEm: string | null } | null;
};

export type FotoGuardada = {
  caminho: string;
  sha256: string;
  bytes: number;
  mime: "image/jpeg" | "image/webp";
};
