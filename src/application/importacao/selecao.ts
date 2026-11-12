import type { LinhaDoLote } from "@/application/importacao/ports";

/**
 * Quais linhas entram nos cadastros ao confirmar: ok e aviso, e as duplicadas COM decisão.
 * Linha com erro nunca entra. A tela e o caso de uso usam esta mesma regra.
 */
export function linhaEntra(
  l: Pick<LinhaDoLote, "situacao" | "decisao">,
): boolean {
  return (
    l.situacao === "ok" ||
    l.situacao === "aviso" ||
    (l.situacao === "duplicado" &&
      (l.decisao === "atualizar" || l.decisao === "criar"))
  );
}

export type ContagemDoLote = {
  total: number;
  prontas: number;
  avisos: number;
  erros: number;
  duplicadas: number;
  /** Duplicadas que ainda esperam a decisão do gestor. */
  semDecisao: number;
  entram: number;
};

export function contarLote(
  linhas: readonly Pick<LinhaDoLote, "situacao" | "decisao">[],
): ContagemDoLote {
  const c = (f: (l: (typeof linhas)[number]) => boolean) =>
    linhas.filter(f).length;
  return {
    total: linhas.length,
    prontas: c((l) => l.situacao === "ok"),
    avisos: c((l) => l.situacao === "aviso"),
    erros: c((l) => l.situacao === "erro"),
    duplicadas: c((l) => l.situacao === "duplicado"),
    semDecisao: c((l) => l.situacao === "duplicado" && !l.decisao),
    entram: c(linhaEntra),
  };
}
