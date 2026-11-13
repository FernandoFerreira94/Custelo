import type { Contexto } from "@/application/auth/contexto";

/**
 * Pareamento do aparelho por código do local (IP.3, D20). O banco (0014) limita as
 * tentativas, responde igual para código inexistente, vencido ou revogado e grava a
 * auditoria. Antes do login nunca sai lista de locais nem de usuários.
 */

export type RespostaDoPareamento =
  | { ok: true; localNome: string }
  | { ok: false; code: "NAO_ENCONTRADO" | "MUITAS_TENTATIVAS" };

export type LocalDoAparelho = {
  orgId: string;
  empreendimentoId: string;
  localNome: string;
};

export type CodigoCriado = { id: string; codigo: string; expiraEm: string };

export interface PareamentoRepo {
  parear(
    codigo: string,
    chaveDeOrigem: string,
    tokenSha256: string,
  ): Promise<RespostaDoPareamento>;
  localDoAparelho(tokenSha256: string): Promise<LocalDoAparelho | null>;
  /** null quando o código sorteado já existe (o caso de uso sorteia outro). */
  criarCodigo(
    ctx: Contexto,
    codigo: string,
    expiraEm: Date,
  ): Promise<CodigoCriado | null>;
  revogarCodigo(ctx: Contexto, id: string): Promise<void>;
}

export interface Segredos {
  /** Token aleatório do aparelho; vai só para o cookie httpOnly. */
  novoToken(): string;
  sha256(texto: string): string;
  /** HMAC do IP com segredo do servidor: o banco nunca vê o IP. */
  chaveDeOrigem(ip: string): string;
  sortear(limite: number): number;
}

export type DepsDePareamento = {
  repo: PareamentoRepo;
  segredos: Segredos;
  agora: () => Date;
};

export const MSG_PAREAMENTO = {
  naoEncontrado: "Código não encontrado ou vencido.",
  pareado: (local: string) => `Aparelho ligado a ${local}.`,
  codigoCriado:
    "Código criado. Imprima ou mostre o QR no aparelho da portaria.",
  codigoRevogado: "Código revogado. Aparelhos novos não entram mais com ele.",
  semCodigoLivre: "Não deu para criar o código agora. Tente de novo.",
} as const;
