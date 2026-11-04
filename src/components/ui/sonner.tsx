"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { cn } from "@/lib/utils"

// Base shadcn/ui (MIT). WebCode: sem next-themes — as cores vêm dos tokens, então o toast acompanha
// tema e modo (data-mode, .dark ou sistema) sozinho. Ícone em círculo suave na cor do status,
// título forte + descrição em muted, botões de ação (Desfazer) e cancelar com 32px e foco visível,
// fechar no canto direito, centralizado embaixo por padrão (alcance do polegar, não cobre o header)
// e pilha expandida no hover. Com richColors, fundo e texto usam os pares soft do tema (4.5:1).
// `material="glass"`: toast neutro em vidro espesso (ADR 0014); os coloridos (richColors) seguem sólidos.
const Toaster = ({
  position = "bottom-center",
  gap = 10,
  material = "solid",
  ...props
}: ToasterProps & { material?: "solid" | "glass" }) => {
  const isGlass = material === "glass"
  return (
    <Sonner
      theme="system"
      className="toaster group"
      data-material={material}
      position={position}
      gap={gap}
      containerAriaLabel="Notificações"
      icons={{
        success: <CircleCheckIcon />,
        info: <InfoIcon />,
        warning: <TriangleAlertIcon />,
        error: <OctagonXIcon />,
        loading: <Loader2Icon className="animate-spin" />,
        close: <XIcon className="size-3.5" />,
      }}
      style={
        {
          "--normal-bg": isGlass ? "var(--wc-glass-bg-thick)" : "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": isGlass ? "var(--wc-glass-border)" : "var(--border)",
          "--success-bg": "var(--wc-success-soft)",
          "--success-text": "var(--wc-success)",
          "--success-border": "var(--border)",
          "--warning-bg": "var(--wc-warning-soft)",
          "--warning-text": "var(--wc-warning)",
          "--warning-border": "var(--border)",
          "--error-bg": "var(--wc-danger-soft)",
          "--error-text": "var(--wc-danger)",
          "--error-border": "var(--border)",
          "--info-bg": "var(--wc-accent-soft)",
          "--info-text": "var(--wc-accent)",
          "--info-border": "var(--border)",
          "--border-radius": "var(--wc-radius-xl)",
          "--width": "400px",
          fontFamily: "var(--wc-font-body)",
        } as React.CSSProperties
      }
      toastOptions={{
        closeButtonAriaLabel: "Fechar",
        classNames: {
          toast: cn(
            "items-center! gap-3! p-3.5! shadow-wc-md! has-[[data-close-button]]:pr-11!",
            isGlass &&
              "not-data-[rich-colors=true]:backdrop-blur-glass-thick not-data-[rich-colors=true]:backdrop-saturate-(--wc-glass-saturate) not-data-[rich-colors=true]:inset-shadow-[1px_1px_0_0_var(--wc-glass-highlight)]"
          ),
          icon: "m-0! size-8! shrink-0 justify-center! rounded-full bg-muted text-muted-foreground [&_svg]:size-4!",
          content: "min-h-8 justify-center gap-0.5!",
          title: "text-sm! leading-snug! font-semibold!",
          description: "text-sm! leading-snug! text-muted-foreground! in-data-[rich-colors=true]:text-current!",
          actionButton:
            "h-(--wc-density-control-sm)! rounded-md! bg-primary! px-3! text-sm! font-medium! text-primary-foreground! transition-colors! hover:bg-primary/90! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-solid! focus-visible:outline-ring! focus-visible:shadow-none!",
          cancelButton:
            "h-(--wc-density-control-sm)! rounded-md! bg-muted! px-3! text-sm! font-medium! text-foreground! transition-colors! hover:bg-accent! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-solid! focus-visible:outline-ring! focus-visible:shadow-none!",
          closeButton:
            "top-2.5! right-2.5! left-auto! size-(--wc-density-control-xs)! transform-none! border-0! bg-transparent! text-muted-foreground! hover:bg-accent! hover:text-foreground! focus-visible:outline-2! focus-visible:outline-solid! focus-visible:outline-ring! focus-visible:shadow-none!",
          success: "[&_[data-icon]]:bg-success-soft [&_[data-icon]]:text-success",
          warning: "[&_[data-icon]]:bg-warning-soft [&_[data-icon]]:text-warning",
          error: "[&_[data-icon]]:bg-danger-soft [&_[data-icon]]:text-danger",
          info: "[&_[data-icon]]:bg-accent-soft [&_[data-icon]]:text-brand",
          loading: "[&_[data-icon]]:bg-accent-soft [&_[data-icon]]:text-brand",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
