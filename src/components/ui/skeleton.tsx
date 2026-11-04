import * as React from "react"

import { cn } from "@/lib/utils"

// Base shadcn/ui (MIT). WebCode: brilho que atravessa (transform, barato na GPU) no lugar do pulse;
// com movimento reduzido fica estático. Keyframes e --animate-wc-shimmer vêm no CSS do item.
// `delay` (Vercel Geist, NN/g: nada de indicador abaixo de ~1 s): o esqueleto só aparece depois do atraso, então
// resposta rápida não pisca. Presets com o layout real: `SkeletonRow` (linha de lista), `SkeletonCard`
// (card de produto/mídia) e `SkeletonTable` (linhas × colunas).
function Skeleton({ className, delay, style, ...props }: React.ComponentProps<"div"> & {
  /** Milissegundos até aparecer (fade curto). Use ~300–600 em carregamentos que costumam ser rápidos. */
  delay?: number
}) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      style={delay ? { animationDelay: `${delay}ms`, ...style } : style}
      className={cn(
        delay !== undefined && delay > 0 && "animate-in fade-in fill-mode-both duration-(--wc-motion-duration-base)",
        // Cor translúcida do texto: aparece igual sobre card, página cinza ou palco escuro (bg-muted some sobre a página).
        "relative overflow-hidden rounded-md bg-foreground/8",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-wc-shimmer after:bg-linear-to-r after:from-transparent after:via-foreground/6 after:to-transparent motion-reduce:after:hidden",
        className
      )}
      {...props}
    />
  )
}

/** Parágrafo de esqueleto: N linhas, a última mais curta (lê como texto, não como bloco). */
function SkeletonText({ lines = 3, delay, className, ...props }: React.ComponentProps<"div"> & { lines?: number; delay?: number }) {
  return (
    <div data-slot="skeleton-text" aria-hidden className={cn("grid gap-2", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} delay={delay} className={cn("h-4", i === lines - 1 && lines > 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  )
}

// Larguras que variam por linha (não um bloco repetido): lê como dado real.
const WIDTHS = ["w-2/3", "w-1/2", "w-3/4", "w-2/5", "w-3/5"]

/** Linha de lista: avatar (ou ícone), título e subtítulo, valor à direita opcional. */
function SkeletonRow({
  index = 0,
  avatar = "circle",
  trailing = true,
  delay,
  className,
  ...props
}: React.ComponentProps<"div"> & { index?: number; avatar?: "circle" | "square" | "none"; trailing?: boolean; delay?: number }) {
  return (
    <div data-slot="skeleton-row" aria-hidden className={cn("flex min-h-(--wc-density-row) items-center gap-3 py-2", className)} {...props}>
      {avatar !== "none" && <Skeleton delay={delay} className={cn("size-10 shrink-0", avatar === "circle" ? "rounded-full" : "rounded-md")} />}
      <div className="grid min-w-0 flex-1 gap-1.5">
        <Skeleton delay={delay} className={cn("h-4", WIDTHS[index % WIDTHS.length])} />
        <Skeleton delay={delay} className={cn("h-3", WIDTHS[(index + 2) % WIDTHS.length], "max-w-40")} />
      </div>
      {trailing && <Skeleton delay={delay} className="h-4 w-14 shrink-0" />}
    </div>
  )
}

/** Card de produto/mídia: imagem na proporção, título, linha de apoio e preço/ação. */
function SkeletonCard({ ratio = "4/3", delay, className, ...props }: React.ComponentProps<"div"> & { ratio?: string; delay?: number }) {
  return (
    <div data-slot="skeleton-card" aria-hidden className={cn("grid gap-3 rounded-xl border bg-card p-3", className)} {...props}>
      <Skeleton delay={delay} className="w-full rounded-lg" style={{ aspectRatio: ratio }} />
      <div className="grid gap-2 px-0.5">
        <Skeleton delay={delay} className="h-4 w-3/4" />
        <Skeleton delay={delay} className="h-3 w-1/2" />
      </div>
      <div className="flex items-center justify-between px-0.5">
        <Skeleton delay={delay} className="h-5 w-20" />
        <Skeleton delay={delay} className="h-(--wc-density-control-sm) w-24 rounded-button" />
      </div>
    </div>
  )
}

/** Tabela: cabeçalho e N linhas × M colunas na altura de linha do tema; a 1ª coluna mais larga. */
function SkeletonTable({ rows = 5, columns = 4, delay, className, ...props }: React.ComponentProps<"div"> & { rows?: number; columns?: number; delay?: number }) {
  const cols = { gridTemplateColumns: `2fr repeat(${Math.max(columns - 1, 0)}, minmax(0, 1fr))` }
  return (
    <div data-slot="skeleton-table" aria-hidden className={cn("overflow-hidden rounded-lg border bg-card", className)} {...props}>
      <div className="grid items-center gap-4 border-b bg-muted/50 px-4 py-2.5" style={cols}>
        {Array.from({ length: columns }, (_, c) => (
          <Skeleton key={c} delay={delay} className={cn("h-3", c === 0 ? "w-24" : "w-16")} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid min-h-(--wc-density-row) items-center gap-4 border-b px-4 last:border-b-0" style={cols}>
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} delay={delay} className={cn("h-4", c === 0 ? WIDTHS[r % WIDTHS.length] : c === columns - 1 ? "ml-auto w-16" : "w-3/4")} />
          ))}
        </div>
      ))}
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonRow, SkeletonCard, SkeletonTable }
