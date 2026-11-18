"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// WebCode (sem equivalente no shadcn): uso de um limite do plano (usuários, armazenamento, OS no mês).
// O tom muda pelo significado: normal → aviso a partir de `warnAt` (80%) → perigo no limite. Variantes
// bar (linha com rótulo), ring (anel com o % no centro) e compact (uma linha só, para listas e menus).
// Sem limite (`max` null) mostra só o valor. Números em pt-BR com tabular-nums.
type Tone = "default" | "warning" | "danger"

const BAR = { default: "bg-primary", warning: "bg-warning", danger: "bg-danger" } as const
const STROKE = { default: "stroke-primary", warning: "stroke-warning", danger: "stroke-danger" } as const

function toneOf(ratio: number, warnAt: number): Tone {
  if (ratio >= 1) return "danger"
  if (ratio >= warnAt) return "warning"
  return "default"
}

function UsageMeter({
  label,
  value,
  max,
  unit,
  hint,
  warnAt = 0.8,
  variant = "bar",
  format = (n) => n.toLocaleString("pt-BR"),
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode
  value: number
  /** null = sem limite no plano. */
  max: number | null
  /** Sufixo do número (GB, OS). */
  unit?: string
  /** Linha de apoio (ex.: "14 ativos + 2 convites pendentes"). */
  hint?: React.ReactNode
  /** Fração em que o tom vira aviso. Padrão 0,8. */
  warnAt?: number
  variant?: "bar" | "ring" | "compact"
  format?: (n: number) => string
}) {
  const ratio = max ? value / max : 0
  const pct = Math.min(100, Math.round(ratio * 100))
  const tone = max ? toneOf(ratio, warnAt) : "default"
  const u = unit ? ` ${unit}` : ""
  const amount = max ? `${format(value)}${u} de ${format(max)}${u}` : `${format(value)}${u} · sem limite`
  const flag =
    tone === "danger" ? (
      <Badge variant="danger">No limite</Badge>
    ) : tone === "warning" ? (
      <Badge variant="warning">{Math.round(warnAt * 100)}%+</Badge>
    ) : null
  const meter = {
    role: "meter",
    "aria-valuemin": 0,
    "aria-valuemax": max ?? undefined,
    "aria-valuenow": value,
    "aria-valuetext": amount,
  } as const
  const labelId = React.useId()

  if (variant === "ring") {
    const r = 26
    const c = 2 * Math.PI * r
    return (
      <div data-slot="usage-meter" data-variant="ring" data-tone={tone} className={cn("flex items-center gap-3", className)} {...props}>
        <div {...meter} aria-labelledby={labelId} className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-border" />
            {max ? (
              <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - pct / 100)}
                className={cn("transition-[stroke-dashoffset] duration-(--wc-motion-duration-slow) ease-wc-out", STROKE[tone])}
              />
            ) : null}
          </svg>
          <span className="absolute inset-0 grid place-items-center text-xs font-semibold tabular-nums">{max ? `${pct}%` : "∞"}</span>
        </div>
        <div className="grid min-w-0 gap-0.5">
          <span id={labelId} className="flex items-center gap-2 text-sm font-medium">
            {label}
            {flag}
          </span>
          <span className="text-sm text-muted-foreground tabular-nums">{amount}</span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
      </div>
    )
  }

  const bar = (
    <div {...meter} aria-labelledby={labelId} className={cn("relative w-full overflow-hidden rounded-full bg-border", variant === "compact" ? "h-1.5" : "h-2")}>
      {max ? (
        <div
          className={cn("h-full w-full rounded-full transition-transform duration-(--wc-motion-duration-slow) ease-wc-out", BAR[tone])}
          style={{ transform: `translateX(-${100 - pct}%)` }}
        />
      ) : null}
    </div>
  )

  if (variant === "compact")
    return (
      <div data-slot="usage-meter" data-variant="compact" data-tone={tone} className={cn("grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm", className)} {...props}>
        <span id={labelId} className="font-medium">
          {label}
        </span>
        {bar}
        <span className="text-muted-foreground tabular-nums">{max ? `${format(value)}/${format(max)}` : format(value)}</span>
      </div>
    )

  return (
    <div data-slot="usage-meter" data-variant="bar" data-tone={tone} className={cn("grid gap-1.5", className)} {...props}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span id={labelId} className="flex items-center gap-2 font-medium">
          {label}
          {flag}
        </span>
        <span className="font-semibold tabular-nums">{amount}</span>
      </div>
      {bar}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}

export { UsageMeter }
