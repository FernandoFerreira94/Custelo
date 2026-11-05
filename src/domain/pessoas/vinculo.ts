import { falha, type Resultado, sucesso } from "@/lib/resultado";

import type { Contato } from "./contato";

export type TipoDeVinculo =
  "titular" | "morador" | "inquilino" | "dependente" | "autorizado";

export type Vinculo = {
  id: string;
  pessoaId: string;
  unidadeId: string;
  tipo: TipoDeVinculo;
  status: "ativo" | "encerrado";
  recebeAviso: boolean;
  ordemAviso: number;
  /** Fim do vínculo; no autorizado é o "vale até". */
  vigenciaFim: Date | null;
  motivoEncerramento?: string;
};

/**
 * Quem entra na cascata de aviso da unidade. Autorizado retira, não recebe aviso.
 * O consentimento é condição: sem ele, nada sai (D3).
 */
export function podeReceberAviso(
  vinculo: Vinculo,
  contato: Contato,
  agora: Date,
): boolean {
  if (vinculo.status !== "ativo" || !vinculo.recebeAviso) return false;
  if (vinculo.tipo === "autorizado") return false;
  if (vinculo.vigenciaFim && vinculo.vigenciaFim <= agora) return false;
  if (contato.status === "falha") return false;
  return contato.consentimentoEm !== null;
}

export function encerrarVinculo(
  vinculo: Vinculo,
  e: { motivo: string; agora: Date },
): Resultado<Vinculo> {
  if (vinculo.status === "encerrado") {
    return falha("CONFLITO", "Este vínculo já está encerrado.");
  }
  const motivo = e.motivo.trim();
  if (!motivo) {
    return falha(
      "ENTRADA_INVALIDA",
      "Diga por que o vínculo terminou (mudou, vendeu, erro de cadastro).",
    );
  }
  return sucesso({
    ...vinculo,
    status: "encerrado",
    vigenciaFim: e.agora,
    recebeAviso: false,
    motivoEncerramento: motivo,
  });
}

export type EntradaDaCascata = { vinculo: Vinculo; contato: Contato };

/** Ordem de aviso da unidade: por `ordemAviso`, depois pela ordem do contato. A I7 usa. */
export function cascataDeAviso(
  vinculos: readonly Vinculo[],
  contatosPorPessoa: Readonly<Record<string, readonly Contato[]>>,
  agora: Date,
): EntradaDaCascata[] {
  return [...vinculos]
    .sort((a, b) => a.ordemAviso - b.ordemAviso)
    .flatMap((vinculo) =>
      [...(contatosPorPessoa[vinculo.pessoaId] ?? [])]
        .sort((a, b) => a.ordem - b.ordem)
        .filter((contato) => podeReceberAviso(vinculo, contato, agora))
        .map((contato) => ({ vinculo, contato })),
    );
}
