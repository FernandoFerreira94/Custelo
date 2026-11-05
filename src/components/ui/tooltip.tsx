"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { glass } from "@/lib/glass"

// Base shadcn/ui (MIT). WebCode: atraso de 300ms (o shadcn usa 0 e dispara tooltip ao passar o mouse
// de raspão); depois do primeiro, os vizinhos abrem na hora (skipDelay). Coloque um TooltipProvider na raiz.
// `variant="light"` (superfície do popover, borda e sombra md: tooltips com mais texto) e `shortcut` (tecla ao lado).
function TooltipProvider({
  delayDuration = 300,
  skipDelayDuration = 300,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  )
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 4,
  collisionPadding = 8,
  variant = "default",
  shortcut,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  /** `light`: superfície clara com borda (texto mais longo, dentro de editores). `glass`: vidro espesso (ADR 0014), sem seta. */
  variant?: "default" | "light" | "glass"
  /** Atalho mostrado depois do texto ("⌘B"). */
  shortcut?: string
}) {
  const light = variant === "light"
  const isGlass = variant === "glass"
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-variant={variant}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-sm px-2.5 py-1.5 text-xs text-balance",
          light && "border bg-popover text-popover-foreground shadow-wc-md",
          isGlass && cn(glass("thick"), "text-foreground shadow-wc-md"),
          !light && !isGlass && "bg-foreground text-background",
          shortcut && "inline-flex items-center gap-2",
          "animate-in fade-in-0 zoom-in-97 duration-(--wc-motion-duration-fast) ease-wc-out data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-(--wc-motion-duration-instant)",
          className
        )}
        {...props}
      >
        {children}
        {shortcut && (
          <kbd className={cn("rounded-xs px-1 font-mono text-[0.6875rem]", light || isGlass ? "bg-muted text-muted-foreground" : "bg-background/20")}>{shortcut}</kbd>
        )}
        {!isGlass && (
          <TooltipPrimitive.Arrow
            className={cn(
              "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
              light ? "border-r border-b bg-popover fill-popover" : "bg-foreground fill-foreground"
            )}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
