"use client";

import * as React from "react";

// @webcode/goo — o filtro "gooey" (metaball) em SVG nativo, sem dependência. Desfoca as formas e depois sobe o
// contraste do alfa: o que estava perto se funde como gota de líquido. REGRA: aplique o filtro só numa camada de
// FORMAS SÓLIDAS (fundo dos botões, bolhas) e ponha ícones e texto numa camada por cima, sem filtro; senão o texto
// também derrete. Não funciona com vidro (backdrop-filter): use superfície sólida (`bg-popover`, `bg-primary`).

/** Matriz do feColorMatrix: mantém a cor e multiplica o alfa por `contrast`, recortando em `-contrast * cut`. */
export function gooMatrix(contrast = 18, cut = 0.42) {
  const c = Math.max(2, contrast);
  return `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${c} ${-Math.round(c * cut * 100) / 100}`;
}

/** id seguro para `url(#…)` (o useId do React traz ":" em algumas versões). */
export function useGooId(prefix = "wc-goo") {
  return `${prefix}-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** SVG invisível com o filtro. Ponha uma vez perto da camada e use `style={{ filter: \`url(#${id})\` }}`. */
export function GooFilter({
  id,
  blur = 6,
  contrast = 18,
}: {
  id: string;
  blur?: number;
  contrast?: number;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter
          id={id}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={blur}
            result="blur"
          />
          <feColorMatrix in="blur" mode="matrix" values={gooMatrix(contrast)} />
        </filter>
      </defs>
    </svg>
  );
}
