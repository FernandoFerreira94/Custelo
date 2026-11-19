import type { Clock } from "@/ports/clock";
import type { LabelExtractor, ResultadoLeitura } from "@/ports/label-extractor";

export const TIMEOUT_MS = 4000;
export const ORCAMENTO_MS = 8000;
/** Abaixo disso não vale começar outra tentativa. */
const MINIMO_PARA_TENTAR_MS = 500;

/**
 * A regra que protege o KPI: 1 tentativa + 1 nova só se o erro vale repetir e
 * ainda cabe no orçamento de 8 s. Nunca lança; quem chama segue no manual.
 */
export async function lerComOrcamento(
  extrator: LabelExtractor,
  imagem: Uint8Array,
  mime: "image/jpeg" | "image/webp",
  clock: Clock,
): Promise<ResultadoLeitura> {
  const inicio = clock.now().getTime();
  let ultimo: ResultadoLeitura | null = null;
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    const restante = ORCAMENTO_MS - (clock.now().getTime() - inicio);
    if (restante <= MINIMO_PARA_TENTAR_MS) break;
    const controle = new AbortController();
    const timer = setTimeout(
      () => controle.abort(),
      Math.min(TIMEOUT_MS, restante),
    );
    try {
      ultimo = await extrator.ler(imagem, { mime, sinal: controle.signal });
    } catch {
      ultimo = {
        ok: false,
        motivo: controle.signal.aborted ? "timeout" : "indisponivel",
        repetir: true,
        latenciaMs: clock.now().getTime() - inicio,
      };
    } finally {
      clearTimeout(timer);
    }
    if (ultimo.ok || !ultimo.repetir) return ultimo;
  }
  return (
    ultimo ?? {
      ok: false,
      motivo: "timeout",
      repetir: false,
      latenciaMs: ORCAMENTO_MS,
    }
  );
}
