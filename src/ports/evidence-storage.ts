export type ResultadoGravacao =
  | { ok: true; caminho: string; sha256: string; jaExistia: boolean }
  | { ok: false; motivo: "indisponivel" | "recusado" };

/** Evidência (foto da etiqueta) em bucket privado. Nunca sobrescreve nem apaga. */
export interface EvidenceStorage {
  /** Idempotente pelo hash: mesmo conteúdo no mesmo caminho = `jaExistia`; outro conteúdo = `recusado`. */
  gravar(
    caminho: string,
    bytes: Uint8Array,
    mime: string,
  ): Promise<ResultadoGravacao>;
  /** URL assinada curta (ADR-008: 60 s). `null` se não existe ou não dá. */
  urlTemporaria(caminho: string, segundos: number): Promise<string | null>;
}
