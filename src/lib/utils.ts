import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Espaçamentos da densidade do tema (ADR 0012) e elevação do tema (ADR 0013): `h-control-md` e `h-12` no mesmo elemento, o último vence.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ["control-xs", "control-sm", "control-md", "control-lg", "row"],
      shadow: ["wc-xs", "wc", "wc-md", "wc-lg", "wc-xl"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
