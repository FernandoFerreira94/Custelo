"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { glass, glassVariant } from "@/lib/glass"

// WebCode (sem equivalente no shadcn): faixa de aviso no topo da página ou de uma seção
// (manutenção, plano vencendo, novidade). Fechável com animação de altura; quem decide se volta é o app (onDismiss).
// `appearance="glass"` (ADR 0022): cápsula de vidro flutuando sobre o conteúdo (estilo notificação do iOS); o texto
// vira `foreground` e só o ícone leva a cor do status.
const bannerVariants = cva(
  "flex w-full items-center gap-3 px-4 py-2.5 text-sm has-[>svg]:pl-4 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        brand: "bg-primary text-primary-foreground",
        info: "bg-accent-soft text-foreground [&>svg]:text-brand",
        success: "bg-success-soft text-foreground [&>svg]:text-success",
        warning: "bg-warning-soft text-foreground [&>svg]:text-warning",
        danger: "bg-danger-soft text-foreground [&>svg]:text-danger",
      },
      appearance: {
        bar: "",
        floating: "rounded-lg border shadow-wc-md",
        glass: `${glass("regular")} rounded-full text-foreground shadow-wc-md`,
      },
    },
    // Na cápsula de vidro, a cor do status também entra no vidro (glassVariant status, ADR 0023): matiz sem perder
    // a luminância, texto ≥ 4.5:1 sobre qualquer fundo (conferido no build).
    compoundVariants: [
      { appearance: "glass", variant: "brand", className: "[&>svg]:text-brand" },
      { appearance: "glass", variant: "info", className: glassVariant({ status: "brand" }) },
      { appearance: "glass", variant: "success", className: glassVariant({ status: "success" }) },
      { appearance: "glass", variant: "warning", className: glassVariant({ status: "warning" }) },
      { appearance: "glass", variant: "danger", className: glassVariant({ status: "danger" }) },
    ],
    defaultVariants: { variant: "info", appearance: "bar" },
  }
)

function Banner({
  className,
  variant,
  appearance = "bar",
  onDismiss,
  dismissLabel = "Fechar aviso",
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bannerVariants> & {
    /** Mostra o botão de fechar. O banner some com animação e depois chama onDismiss. */
    onDismiss?: () => void
    dismissLabel?: string
  }) {
  const [closing, setClosing] = React.useState(false)
  const dismiss = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return onDismiss?.()
    setClosing(true)
  }
  return (
    <div
      data-slot="banner-wrapper"
      data-closing={closing || undefined}
      onTransitionEnd={(e) => e.target === e.currentTarget && e.propertyName === "opacity" && closing && onDismiss?.()}
      className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-(--wc-motion-duration-base) ease-wc-in-out data-closing:grid-rows-[0fr] data-closing:opacity-0"
    >
      <div className="overflow-hidden">
        <div data-slot="banner" role="region" aria-label={props["aria-label"] ?? "Aviso"} data-appearance={appearance} className={cn(bannerVariants({ variant, appearance }), className)} {...props}>
          {children}
          {onDismiss && (
            <button
              type="button"
              onClick={dismiss}
              className="-my-1 -mr-2 ml-auto grid size-(--wc-density-control-sm) shrink-0 place-items-center rounded-full opacity-80 transition-[opacity,background-color] duration-(--wc-motion-duration-fast) outline-none hover:bg-current/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-current"
            >
              <XIcon className="size-4" aria-hidden />
              <span className="sr-only">{dismissLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function BannerContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="banner-content" className={cn("flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1", className)} {...props} />
}

function BannerTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="banner-title" className={cn("font-medium", className)} {...props} />
}

function BannerDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="banner-description" className={cn(className)} {...props} />
}

/** Link ou botão de ação; herda a cor do banner. */
function BannerAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="banner-action" className={cn("flex shrink-0 items-center gap-2", className)} {...props} />
}

export { Banner, BannerAction, BannerContent, BannerDescription, BannerTitle, bannerVariants }
