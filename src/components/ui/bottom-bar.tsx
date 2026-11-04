"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useKeyboard } from "@/hooks/use-keyboard"
import { glass } from "@/lib/glass"

// Novo (o shadcn não tem): barra de ação grudada no rodapé (preço + Comprar, Salvar, Enviar). Sem dependência.
// Respeita a safe area do iPhone (indicador de início) e o teclado: por padrão sobe junto com ele (`keyboard="lift"`),
// como o botão de enviar de um formulário; `hide` some enquanto o teclado está aberto (tab bar do iOS); `ignore` fica parada.
// `position="sticky"` (padrão) gruda no fim da área que rola; `fixed` no fim da tela. Material sólido ou vidro (ADR 0014).
// A sombra de cima só aparece quando há conteúdo passando por trás (`elevated`).
// RN/Expo: `KeyboardStickyView` (react-native-keyboard-controller) + `useSafeAreaInsets`.

function BottomBar({
  position = "sticky",
  keyboard = "lift",
  material = "solid",
  elevated = true,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  position?: "sticky" | "fixed" | "static"
  /** O que fazer com o teclado aberto. */
  keyboard?: "lift" | "hide" | "ignore"
  material?: "solid" | "glass"
  /** Borda e sombra em cima (conteúdo passando por trás). */
  elevated?: boolean
}) {
  const kb = useKeyboard()
  const lift = keyboard === "lift" && kb.open && position !== "static" ? kb.height : 0
  const hidden = keyboard === "hide" && kb.open

  return (
    <div
      data-slot="bottom-bar"
      data-keyboard={kb.open ? "open" : undefined}
      inert={hidden || undefined}
      className={cn(
        "z-30 flex items-center gap-3 px-(--wc-mobile-gutter) pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        position === "sticky" && "sticky bottom-0",
        position === "fixed" && "fixed inset-x-0 bottom-0",
        material === "glass" ? cn(glass("regular"), "border-x-0 border-b-0") : "bg-background",
        elevated && material === "solid" && "border-t shadow-[0_-8px_24px_-12px_color-mix(in_oklab,var(--foreground)_25%,transparent)]",
        // Com o teclado aberto a safe area fica escondida atrás dele: volta ao respiro normal.
        lift > 0 && "pb-3",
        "transition-[translate,opacity] duration-(--wc-motion-duration-base) ease-wc-out motion-reduce:transition-none",
        hidden && "pointer-events-none translate-y-full opacity-0",
        className
      )}
      style={{ ...style, ...(lift ? { translate: `0 ${-lift}px` } : null) }}
      {...props}
    >
      {children}
    </div>
  )
}

/** Resumo à esquerda (rótulo pequeno + valor), ex.: "Total" / "R$ 54,90". */
function BottomBarSummary({ label, className, children, ...props }: React.ComponentProps<"div"> & { label?: React.ReactNode }) {
  return (
    <div data-slot="bottom-bar-summary" className={cn("grid min-w-0 flex-1 leading-tight", className)} {...props}>
      {label && <span className="truncate text-(length:--wc-mobile-text-footnote) text-muted-foreground">{label}</span>}
      <span className="truncate text-(length:--wc-mobile-text-title) font-semibold tabular-nums">{children}</span>
    </div>
  )
}

export { BottomBar, BottomBarSummary }
