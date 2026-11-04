"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { glass, type Material } from "@/lib/glass"
import { Button } from "@/components/ui/button"

// Base shadcn/ui (MIT). WebCode: tamanhos, corpo rolável com cabeçalho/rodapé fixos (DialogBody),
// scrim com leve desfoque, entrada com mola e saída curta (animation scale/slide/fade), rótulos em pt-BR, dismissible={false} contra perda de dados, mobile="sheet" (vira folha presa embaixo no celular, alcance do polegar).
function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-scrim duration-(--wc-motion-duration-base) data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

/** Entrada com a mola do tema (lenta e viva), saída curta com ease-out (ADR 0011). Movimento reduzido vira só fade (CSS do tema). */
const DIALOG_ANIMATIONS = {
  scale:
    "data-[state=open]:ease-wc-spring data-[state=open]:duration-(--wc-motion-default-spring-duration) data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:ease-wc-out data-[state=closed]:duration-(--wc-motion-duration-fast) data-[state=closed]:zoom-out-95",
  slide:
    "data-[state=open]:ease-wc-spring data-[state=open]:duration-(--wc-motion-default-spring-duration) data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:ease-wc-out data-[state=closed]:duration-(--wc-motion-duration-fast) data-[state=closed]:slide-out-to-bottom-4",
  fade: "data-[state=open]:ease-wc-out data-[state=open]:duration-(--wc-motion-duration-base) data-[state=closed]:ease-wc-out data-[state=closed]:duration-(--wc-motion-duration-fast)",
} as const

const DIALOG_SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[calc(100%-4rem)] sm:h-[calc(100dvh-4rem)]",
} as const

/** Tentativa de fechar bloqueada (dismissible=false): pulso curto de escala, como a folha do iOS. */
function nudge(el: HTMLElement | null) {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  el.animate([{ scale: "1" }, { scale: "1.02" }, { scale: "1" }], { duration: 240, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" })
}

function DialogContent({
  className,
  children,
  size = "md",
  mobile = "center",
  animation = "scale",
  material = "solid",
  showCloseButton = true,
  dismissible = true,
  onInteractOutside,
  onEscapeKeyDown,
  ref,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: keyof typeof DIALOG_SIZES
  /** false: clique fora e Esc não fecham (formulário com dados não salvos); só os botões fecham. */
  dismissible?: boolean
  /** "sheet": abaixo de 640px a janela sobe de baixo, em largura total, com safe-area do iOS.
   *  "fullscreen": abaixo de 640px cobre a tela toda (fullScreenCover do iOS: editor, câmera, fluxo que
   *  não deve ser dispensado por engano), com safe-area em cima e embaixo; no desktop segue `size`. */
  mobile?: "center" | "sheet" | "fullscreen"
  /** scale: cresce e sobe 8px (padrão) · slide: sobe de baixo · fade: só opacidade. */
  animation?: keyof typeof DIALOG_ANIMATIONS
  showCloseButton?: boolean
  /** `glass`: vidro espesso do tema (ADR 0014), o conteúdo de trás aparece desfocado. */
  material?: Material
}) {
  const inner = React.useRef<HTMLDivElement | null>(null)
  const setRef = (el: HTMLDivElement | null) => {
    inner.current = el
    if (typeof ref === "function") ref(el)
    else if (ref) ref.current = el
  }
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-size={size}
        data-mobile={mobile}
        data-animation={animation}
        data-material={material}
        ref={setRef}
        onInteractOutside={(e) => {
          onInteractOutside?.(e)
          if (!dismissible) {
            e.preventDefault()
            nudge(inner.current)
          }
        }}
        onEscapeKeyDown={(e) => {
          onEscapeKeyDown?.(e)
          if (!dismissible) {
            e.preventDefault()
            nudge(inner.current)
          }
        }}
        className={cn(
          "fixed top-[50%] left-[50%] z-50 flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col gap-4 overflow-y-auto rounded-xl border bg-popover p-6 text-popover-foreground shadow-wc-xl outline-none",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
          DIALOG_ANIMATIONS[animation],
          DIALOG_SIZES[size],
          mobile === "sheet" &&
            "max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-h-[90dvh] max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-sm:ease-wc-spring max-sm:data-[state=open]:duration-(--wc-motion-default-spring-duration) max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=closed]:zoom-out-100 max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=open]:zoom-in-100",
          mobile === "fullscreen" &&
            "max-sm:inset-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0 max-sm:pt-[calc(1.5rem+env(safe-area-inset-top))] max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-sm:shadow-none max-sm:ease-wc-spring max-sm:data-[state=open]:duration-(--wc-motion-default-spring-duration) max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=closed]:zoom-out-100 max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=open]:zoom-in-100 max-sm:[&>[data-slot=dialog-close]]:top-[calc(0.75rem+env(safe-area-inset-top))] max-sm:[&>[data-slot=dialog-footer]]:mt-auto",
          material === "glass" && glass("thick"),
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-3 right-3 grid size-(--wc-density-control-sm) place-items-center rounded-full pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-11 pointer-coarse:after:-translate-1/2 text-muted-foreground transition-colors duration-(--wc-motion-duration-fast) outline-none hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex shrink-0 flex-col gap-2 pr-8 text-center sm:text-left", className)}
      {...props}
    />
  )
}

/** Área rolável entre cabeçalho e rodapé: conteúdo longo não empurra as ações para fora da tela. */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("-mx-6 min-h-0 flex-1 overflow-y-auto overscroll-contain px-6", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Fechar</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-tight font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
