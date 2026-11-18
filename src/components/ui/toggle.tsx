"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Base shadcn/ui (MIT). WebCode: ligado = acento suave (contraste de texto 4.5:1), contorno com bg-card,
// pressão com escala, alturas 32/40/48 do token de controle e alvo de 44px em toque.
const toggleVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap select-none",
    "transition-[background-color,color,border-color,scale] duration-(--wc-motion-duration-fast) ease-wc-out active:scale-[0.97] motion-reduce:active:scale-100",
    "hover:bg-muted hover:text-foreground data-[state=on]:bg-accent-soft data-[state=on]:text-brand",
    "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 pointer-coarse:after:-translate-1/2",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-border bg-card shadow-wc-xs data-[state=on]:border-brand/40",
      },
      size: {
        default: "h-(--wc-density-control-md) min-w-(--wc-density-control-md) px-2.5",
        sm: "h-(--wc-density-control-sm) min-w-(--wc-density-control-sm) px-2",
        lg: "h-(--wc-density-control-lg) min-w-(--wc-density-control-lg) px-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} {...props} />
}

export { Toggle, toggleVariants }
