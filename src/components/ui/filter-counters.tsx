"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// WebCode (sem equivalente no shadcn): contadores que filtram a lista abaixo ("Abertas 12 · Em execução 4").
// Um clique filtra, outro clique no mesmo limpa (value null). Cada item é um botão com aria-pressed e o
// número entra no nome acessível. Tom pelo significado (ponto colorido; nunca só a cor: o rótulo vem junto).
// Variantes pills (linha que rola no celular) e cards (número grande, grade).
type Tone = "neutral" | "info" | "success" | "warning" | "danger"

const DOT: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  info: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
}

type FilterCounter = { value: string; label: string; count: number; tone?: Tone }

function FilterCounters({
  items,
  value,
  defaultValue = null,
  onValueChange,
  variant = "pills",
  loading = false,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue"> & {
  items: FilterCounter[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  variant?: "pills" | "cards"
  loading?: boolean
}) {
  const [inner, setInner] = React.useState<string | null>(defaultValue)
  const active = value === undefined ? inner : value
  const pick = (v: string) => {
    const next = active === v ? null : v
    setInner(next)
    onValueChange?.(next)
  }
  const cards = variant === "cards"
  return (
    <div
      role="group"
      data-slot="filter-counters"
      data-variant={variant}
      className={cn(
        cards
          ? "grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2"
          : "-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      {...props}
    >
      {items.map((it) => {
        const on = active === it.value
        return (
          <button
            key={it.value}
            type="button"
            aria-pressed={on}
            disabled={loading}
            onClick={() => pick(it.value)}
            className={cn(
              "group/counter relative shrink-0 border text-left outline-none select-none",
              "transition-[background-color,border-color,box-shadow,scale] duration-(--wc-motion-duration-fast) ease-wc-out active:scale-[.97] motion-reduce:active:scale-100",
              "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait",
              on ? "border-brand/40 bg-accent shadow-wc-xs" : "bg-card hover:bg-muted",
              cards
                ? "grid gap-1 rounded-lg p-3"
                : "inline-flex h-(--wc-density-control-sm) items-center gap-2 rounded-full px-3 text-sm pointer-coarse:h-(--wc-mobile-control-sm)"
            )}
          >
            <span className={cn("flex items-center gap-2", cards && "text-sm text-muted-foreground group-aria-pressed/counter:text-foreground")}>
              <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT[it.tone ?? "neutral"])} />
              {it.label}
            </span>
            {loading ? (
              <Skeleton className={cards ? "h-7 w-10" : "h-4 w-5"} />
            ) : (
              <span className={cn("font-semibold tabular-nums", cards ? "text-2xl tracking-tight" : "text-sm")}>
                {it.count.toLocaleString("pt-BR")}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { FilterCounters, type FilterCounter }
