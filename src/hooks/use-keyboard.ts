"use client";

import * as React from "react";

// Teclado virtual aberto e a altura dele, pelo VisualViewport (iOS Safari e Chrome Android). Sem dependência.
// No iOS o teclado encolhe só a viewport visual: o que é `fixed` no rodapé fica atrás dele. Use `height`
// para subir barras (`translate`) ou o `bottom` de algo fixo. Com `interactive-widget=resizes-content`
// (Chrome Android) a página já encolhe e `height` fica perto de 0, o que também está certo.
// Fora do navegador ou sem VisualViewport: { open: false, height: 0 }.
// RN/Expo: `useKeyboardHandler`/`KeyboardStickyView` do react-native-keyboard-controller.

export type KeyboardState = { open: boolean; height: number };

const CLOSED: KeyboardState = { open: false, height: 0 };
/** Abaixo disso é barra de endereço recolhendo, não teclado. */
const MIN = 120;

export function useKeyboard(): KeyboardState {
  const [state, setState] = React.useState<KeyboardState>(CLOSED);

  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let raf = 0;
    const read = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = Math.max(
          0,
          Math.round(window.innerHeight - vv.height - vv.offsetTop),
        );
        const next = h >= MIN ? { open: true, height: h } : CLOSED;
        setState((s) =>
          s.open === next.open && s.height === next.height ? s : next,
        );
      });
    };
    read();
    vv.addEventListener("resize", read);
    vv.addEventListener("scroll", read);
    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener("resize", read);
      vv.removeEventListener("scroll", read);
    };
  }, []);

  return state;
}
