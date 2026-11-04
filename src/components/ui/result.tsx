import * as React from "react"
import { CheckIcon, InfoIcon, LockIcon, SearchXIcon, ServerCrashIcon, TriangleAlertIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Inspirado no Result do Ant Design (MIT; reimplementado). Tela de desfecho: pagamento aprovado, envio com erro,
// sem permissão, página não encontrada. Diferente do Empty (lista vazia), o Result encerra um fluxo e diz o
// próximo passo. WebCode: ícone em círculo tingido (cor + forma, não só cor), check que se desenha no sucesso
// (CSS, some com movimento reduzido), código 403/404/500 grande e discreto, título como heading com nível
// configurável e `extra` para as ações (primária primeiro).
type Status = "success" | "error" | "warning" | "info" | "403" | "404" | "500"

const TONE: Record<Status, string> = {
  success: "bg-success-soft text-success",
  error: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-accent-soft text-brand",
  "403": "bg-muted text-muted-foreground",
  "404": "bg-muted text-muted-foreground",
  "500": "bg-danger-soft text-danger",
}

const ICON: Record<Exclude<Status, "success">, React.ComponentType<{ className?: string }>> = {
  error: XIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
  "403": LockIcon,
  "404": SearchXIcon,
  "500": ServerCrashIcon,
}

function DrawnCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="size-8">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        pathLength={1}
        className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:animate-[wc-draw_var(--wc-motion-duration-slow,400ms)_var(--wc-motion-ease-out,ease-out)_120ms_both]"
      />
      <style>{"@keyframes wc-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}"}</style>
    </svg>
  )
}

function Result({
  status = "info",
  title,
  description,
  extra,
  icon,
  headingLevel = 2,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  status?: Status
  title: React.ReactNode
  description?: React.ReactNode
  /** Ações (botões). A primária vem primeiro. */
  extra?: React.ReactNode
  /** Substitui o ícone padrão do status. */
  icon?: React.ReactNode
  headingLevel?: 1 | 2 | 3
}) {
  const Heading = `h${headingLevel}` as "h2"
  const code = status === "403" || status === "404" || status === "500"
  const Icon = status === "success" ? null : ICON[status]
  return (
    <div
      data-slot="result"
      data-status={status}
      className={cn("mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-10 text-center", className)}
      {...props}
    >
      {code && (
        <p className="text-6xl leading-none font-semibold tracking-tight text-muted-foreground tabular-nums">
          {status}
        </p>
      )}
      <span
        aria-hidden
        className={cn(
          "grid size-16 place-items-center rounded-full [&_svg:not([class*='size-'])]:size-7",
          "motion-safe:animate-in motion-safe:zoom-in-90 motion-safe:fade-in-0 motion-safe:duration-(--wc-motion-duration-base)",
          TONE[status]
        )}
      >
        {icon ?? (Icon ? <Icon /> : <DrawnCheck />)}
      </span>
      <div className="grid gap-2">
        <Heading className="text-xl font-semibold tracking-tight text-balance">{title}</Heading>
        {description && <p className="text-sm text-pretty text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="w-full">{children}</div>}
      {extra && <div className="flex flex-wrap items-center justify-center gap-2 pt-2">{extra}</div>}
    </div>
  )
}

export { Result }
