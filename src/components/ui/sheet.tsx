"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { glass, type Material } from "@/lib/glass"

// Base shadcn/ui (MIT). WebCode: entrada com a mola do tema (lenta), saída com ease-in suave (ADR 0011), scrim com leve desfoque, scrim do tema,
// safe-area no iOS, cantos arredondados no lado que encosta na tela, rótulo pt-BR,
// dismissible={false} contra perda de dados.
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-scrim duration-(--wc-motion-duration-slow) supports-backdrop-filter:backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

const SHEET_SIZES = { sm: "sm:max-w-sm", md: "sm:max-w-[30rem]", lg: "sm:max-w-[40rem]", xl: "sm:max-w-[50rem]" } as const

/** Tentativa de fechar bloqueada (dismissible=false): pulso curto de escala, como a folha do iOS. */
function nudge(el: HTMLElement | null) {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  el.animate([{ scale: "1" }, { scale: "1.02" }, { scale: "1" }], { duration: 240, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" })
}

function SheetContent({
  className,
  children,
  side = "right",
  size = "sm",
  showCloseButton = true,
  dismissible = true,
  inset = false,
  material = "solid",
  onInteractOutside,
  onEscapeKeyDown,
  ref,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  /** false: clique fora e Esc não fecham (edição com dados não salvos); só os botões fecham. */
  dismissible?: boolean
  side?: "top" | "right" | "bottom" | "left"
  /** Largura nas laterais (desktop): sm 384 · md 480 · lg 640 · xl 800. */
  size?: keyof typeof SHEET_SIZES
  showCloseButton?: boolean
  /** Painel flutuante: afastado das bordas, com cantos arredondados e sombra (estilo Linear/Arc). */
  inset?: boolean
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
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        data-inset={inset || undefined}
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
          "fixed z-50 flex flex-col gap-4 bg-popover text-popover-foreground shadow-wc-lg outline-none",
          "data-[state=open]:animate-in data-[state=open]:duration-(--wc-motion-default-spring-duration) data-[state=open]:ease-wc-spring",
          "data-[state=closed]:animate-out data-[state=closed]:duration-(--wc-motion-duration-base) data-[state=closed]:ease-wc-in-soft",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l pr-[env(safe-area-inset-right)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r pl-[env(safe-area-inset-left)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          side === "top" &&
            "inset-x-0 top-0 h-auto rounded-b-xl border-b pt-[env(safe-area-inset-top)] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto max-h-[90dvh] rounded-t-xl border-t pb-[env(safe-area-inset-bottom)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          (side === "left" || side === "right") && SHEET_SIZES[size],
          inset && "rounded-xl border shadow-wc-xl",
          inset && (side === "right" || side === "left") && "inset-y-3 h-auto",
          inset && side === "right" && "right-3",
          inset && side === "left" && "left-3",
          inset && (side === "top" || side === "bottom") && "inset-x-3",
          inset && side === "top" && "top-3",
          inset && side === "bottom" && "bottom-3",
          material === "glass" && glass("thick"),
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close className="absolute top-3 right-3 grid size-(--wc-density-control-sm) place-items-center rounded-full pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-11 pointer-coarse:after:-translate-1/2 text-muted-foreground transition-colors duration-(--wc-motion-duration-fast) outline-none hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none">
            <XIcon className="size-4" />
            <span className="sr-only">Fechar</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4 pr-12", className)}
      {...props}
    />
  )
}

/** Área rolável entre cabeçalho e rodapé: as ações continuam à vista em listas longas. */
function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  SheetBody,
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
