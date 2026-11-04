import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

// WebCode: variantes `ring` (ícone girando, padrão), `dots` (três pontos pulsando: chat, "digitando") e
// `bars` (três barras: carregamento de lista) sem keyframes novos; tamanhos sm/default/lg; movimento reduzido mantém
// a animação (é a única pista de progresso) mas sem rotação (opacidade).
const SIZES = { sm: "size-3", default: "size-4", lg: "size-6" } as const;

function Spinner({
  className,
  variant = "ring",
  size = "default",
  ...props
}: React.ComponentProps<"svg"> & {
  variant?: "ring" | "dots" | "bars";
  size?: keyof typeof SIZES;
}) {
  if (variant === "ring") {
    return (
      <Loader2Icon
        role="status"
        aria-label="Carregando"
        data-slot="spinner"
        data-variant={variant}
        className={cn(
          "animate-spin motion-reduce:animate-pulse",
          SIZES[size],
          className,
        )}
        {...props}
      />
    );
  }
  const n = 3;
  return (
    <span
      role="status"
      aria-label="Carregando"
      data-slot="spinner"
      data-variant={variant}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-[12.5%]",
        SIZES[size],
        className,
      )}
      {...(props as React.ComponentProps<"span">)}
    >
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "animate-pulse bg-current",
            variant === "dots"
              ? "size-1/4 rounded-full"
              : "h-full w-1/5 rounded-full",
          )}
          style={{ animationDelay: `${i * 160}ms`, animationDuration: "900ms" }}
        />
      ))}
    </span>
  );
}

export { Spinner };
