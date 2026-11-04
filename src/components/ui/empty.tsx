import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Base shadcn/ui Empty (MIT), mesma API. WebCode: título é heading de verdade (`as`, padrão h3),
// mídia com tom por situação (primeira vez, sem resultado, erro), e o composto `EmptyState`
// com a estrutura fixa do padrão: mídia, título, uma frase, ação principal e secundária.
function Empty({
  className,
  size = "default",
  bordered = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** `sm`: compacto para dentro de tabela, card ou painel lateral. */
  size?: "default" | "sm"
  /** Borda tracejada (área vazia que aceita conteúdo: lista, upload). */
  bordered?: boolean
}) {
  return (
    <div
      data-slot="empty"
      data-size={size}
      className={cn(
        "group/empty flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg text-center text-balance",
        size === "sm" ? "gap-3 p-4 md:p-6" : "gap-6 p-6 md:p-12",
        bordered && "border border-dashed",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2 text-center", className)}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-12 rounded-xl bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6 group-data-[size=sm]/empty:mb-0 group-data-[size=sm]/empty:size-9 group-data-[size=sm]/empty:rounded-lg group-data-[size=sm]/empty:[&_svg:not([class*='size-'])]:size-4.5",
      },
      tone: {
        default: "",
        brand: "bg-accent text-brand",
        danger: "bg-danger-soft text-danger",
      },
    },
    defaultVariants: { variant: "default", tone: "default" },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  tone = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      aria-hidden
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, tone: variant === "icon" ? tone : "default" }), className)}
      {...props}
    />
  )
}

function EmptyTitle({
  className,
  as: Tag = "h3",
  ...props
}: React.ComponentProps<"h3"> & { as?: "h2" | "h3" | "h4" | "div" }) {
  return (
    <Tag
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight text-foreground group-data-[size=sm]/empty:text-base", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-3 text-sm text-balance sm:flex-row sm:justify-center", className)}
      {...props}
    />
  )
}

const TONE = { "first-use": "brand", "no-results": "default", error: "danger" } as const

/**
 * Composto pronto. `variant`: primeira vez (ensina e convida), sem resultado (oferece saída)
 * ou erro (explica e deixa tentar de novo; role=alert quando aparece depois de uma ação).
 */
function EmptyState({
  variant = "first-use",
  icon,
  title,
  description,
  action,
  secondaryAction,
  headingLevel = "h3",
  announce = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Empty>, "title"> & {
  variant?: "first-use" | "no-results" | "error"
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  headingLevel?: "h2" | "h3" | "h4"
  /** Anuncia ao leitor de tela (use quando o erro aparece depois de uma ação). */
  announce?: boolean
}) {
  return (
    <Empty
      data-variant={variant}
      role={announce ? (variant === "error" ? "alert" : "status") : undefined}
      className={className}
      {...props}
    >
      <EmptyHeader>
        {icon && (
          <EmptyMedia variant="icon" tone={TONE[variant]}>
            {icon}
          </EmptyMedia>
        )}
        <EmptyTitle as={headingLevel}>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {(action || secondaryAction) && (
        <EmptyContent>
          {action}
          {secondaryAction}
        </EmptyContent>
      )}
    </Empty>
  )
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia, EmptyState }
