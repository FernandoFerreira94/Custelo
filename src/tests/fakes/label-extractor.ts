import type {
  LabelExtractor,
  LeituraEtiqueta,
  ResultadoLeitura,
} from "@/ports/label-extractor";

type Falha = Extract<ResultadoLeitura, { ok: false }>;

/** Leitor roteirizado: devolve as respostas na ordem (a última se repete) e conta as chamadas. */
export function criarLabelExtractorFake(
  ...respostas: (Partial<LeituraEtiqueta> | Falha)[]
) {
  let chamadas = 0;
  const leitor: LabelExtractor = {
    async ler(_imagem, { sinal }) {
      const r = respostas[Math.min(chamadas, respostas.length - 1)];
      chamadas++;
      if (sinal.aborted)
        return { ok: false, motivo: "timeout", repetir: true, latenciaMs: 0 };
      if (!r)
        return { ok: false, motivo: "ilegivel", repetir: false, latenciaMs: 5 };
      if ("motivo" in r) return r;
      return {
        ok: true,
        provedor: "fake",
        modelo: "fake-1",
        versaoPrompt: "v1",
        latenciaMs: 5,
        uso: { tokensEntrada: 100, tokensSaida: 20, custoMicroUsd: 30 },
        leitura: {
          unidadeTexto: null,
          nomeTexto: null,
          transportadora: null,
          rastreio: null,
          linhas: [],
          ...r,
        },
      };
    },
  };
  return {
    leitor,
    get chamadas() {
      return chamadas;
    },
  };
}
