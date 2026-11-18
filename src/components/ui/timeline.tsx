"use client"

import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// WebCode (sem equivalente no shadcn): linha do tempo para rastreio de pedido, histórico de atividade,
// changelog e jornada de onboarding. Lista ordenada (`<ol>`); cada item tem `status`: done (✓, linha cheia),
// current (anel com 3 pulsos suaves, sem loop eterno, `aria-current="step"`), upcoming (contorno) e error (×). O status também vai
// em texto escondido, não só em cor. `orientation="horizontal"` vira trilho com rolagem no celular.
// `variant="card"` põe o conteúdo num cartão (feed de atividade).

type Status = "done" | "current" | "upcoming" | "error"

const OrientationContext = React.createContext<"vertical" | "horizontal">("vertical")

const STATUS_TEXT: Record<Status, string> = {
  done: "concluída",
  current: "em andamento",
  upcoming: "pendente",
  error: "com problema",
}

function Timeline({
  className,
  orientation = "vertical",
  variant = "default",
  ...props
}: React.ComponentProps<"ol"> & { orientation?: "vertical" | "horizontal"; variant?: "default" | "card" }) {
  return (
    <OrientationContext.Provider value={orientation}>
      <ol
        data-slot="timeline"
        data-orientation={orientation}
        data-variant={variant}
        className={cn(
          "group/timeline",
          orientation === "vertical" ? "grid" : "flex snap-x overflow-x-auto pb-2 [scrollbar-width:thin]",
          className,
        )}
        {...props}
      />
      <style>{"@keyframes wc-timeline-pulse{0%{opacity:.6;scale:1}70%,100%{opacity:0;scale:1.6}}"}</style>
    </OrientationContext.Provider>
  )
}

function TimelineItem({
  className,
  status = "done",
  icon,
  children,
  ...props
}: React.ComponentProps<"li"> & { status?: Status; icon?: React.ReactNode }) {
  const orientation = React.useContext(OrientationContext)
  const marker = (
    <span
      aria-hidden
      data-slot="timeline-marker"
      className={cn(
        "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-card [&_svg]:size-3.5",
        status === "done" && "border-primary bg-primary text-primary-foreground",
        status === "current" && "border-primary text-brand ring-4 ring-primary/15",
        status === "upcoming" && "border-control-border text-muted-foreground",
        status === "error" && "border-danger-solid bg-danger-solid text-danger-solid-fg",
      )}
    >
      {icon ??
        (status === "done" ? (
          <CheckIcon strokeWidth={3} />
        ) : status === "error" ? (
          <XIcon strokeWidth={3} />
        ) : status === "current" ? (
          <span className="size-2 rounded-full bg-primary" />
        ) : null)}
      {status === "current" && (
        <span className="absolute -inset-1 animate-[wc-timeline-pulse_2s_var(--wc-motion-ease-out)_3] rounded-full border border-primary motion-reduce:hidden" />
      )}
    </span>
  )
  // Linha até o próximo item: cheia quando este já passou.
  const line = (
    <span
      aria-hidden
      data-slot="timeline-line"
      className={cn(
        "absolute group-last/item:hidden",
        orientation === "vertical" ? "top-7 bottom-1 left-[11px] w-0.5" : "top-[11px] right-1 left-7 h-0.5",
        status === "done" ? "bg-primary" : "bg-border",
      )}
    />
  )
  return (
    <li
      data-slot="timeline-item"
      data-status={status}
      aria-current={status === "current" ? "step" : undefined}
      className={cn(
        "group/item relative flex",
        orientation === "vertical" ? "gap-3 pb-6 last:pb-0" : "min-w-44 shrink-0 snap-start flex-col gap-2 pr-4",
        className,
      )}
      {...props}
    >
      {marker}
      {line}
      <div
        data-slot="timeline-content"
        className={cn(
          "grid min-w-0 flex-1 content-start gap-0.5",
          orientation === "vertical" && "pt-0.5",
          "group-data-[variant=card]/timeline:rounded-lg group-data-[variant=card]/timeline:border group-data-[variant=card]/timeline:bg-card group-data-[variant=card]/timeline:p-3 group-data-[variant=card]/timeline:shadow-wc-xs",
          status === "upcoming" && "[&_[data-slot=timeline-title]]:text-muted-foreground",
        )}
      >
        {children}
        <span className="sr-only">({STATUS_TEXT[status]})</span>
      </div>
    </li>
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="timeline-title" className={cn("text-sm leading-6 font-medium", className)} {...props} />
}

function TimelineDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="timeline-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function TimelineTime({ className, ...props }: React.ComponentProps<"time">) {
  return <time data-slot="timeline-time" className={cn("text-xs text-muted-foreground tabular-nums", className)} {...props} />
}

export { Timeline, TimelineItem, TimelineTitle, TimelineDescription, TimelineTime }
