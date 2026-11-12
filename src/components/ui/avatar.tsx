"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Base shadcn/ui (MIT). WebCode: tamanhos sm/default/lg/xl, imagem entra com fade (sem piscar), fallback com
// iniciais em acento suave, status (online/ausente/ocupado) com anel da superfície e AvatarGroup
// sobreposto com contador "+N", forma `square` (apps, marcas) e `ring` (selecionado/história).
const SIZES = { sm: "size-7 text-[0.625rem]", default: "size-9 text-xs", lg: "size-12 text-sm", xl: "size-16 text-base" } as const

function Avatar({
  className,
  size = "default",
  shape = "circle",
  ring = false,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: keyof typeof SIZES
  shape?: "circle" | "square"
  /** Anel na cor da marca com folga da superfície (item selecionado, "tem novidade"). */
  ring?: boolean
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      className={cn(
        "group/avatar relative flex shrink-0 select-none",
        shape === "square" ? "rounded-lg" : "rounded-full",
        ring && "ring-2 ring-brand ring-offset-2 ring-offset-card",
        SIZES[size],
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full animate-in rounded-full object-cover fade-in-0 duration-(--wc-motion-duration-base) group-data-[shape=square]/avatar:rounded-lg", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-full bg-accent-soft font-semibold text-brand group-data-[shape=square]/avatar:rounded-lg", className)}
      {...props}
    />
  )
}

const STATUS = { online: "bg-success", ausente: "bg-warning", ocupado: "bg-danger", offline: "bg-muted-foreground" } as const
const STATUS_LABEL = { online: "Online", ausente: "Ausente", ocupado: "Ocupado", offline: "Offline" } as const

/** Bolinha de status no canto inferior. Leva rótulo para leitor de tela. */
function AvatarStatus({ status, className, ...props }: React.ComponentProps<"span"> & { status: keyof typeof STATUS }) {
  return (
    <span
      data-slot="avatar-status"
      role="img"
      aria-label={STATUS_LABEL[status]}
      className={cn(
        "absolute right-0 bottom-0 size-[28%] min-h-2 min-w-2 rounded-full ring-2 ring-card",
        STATUS[status],
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({
  className,
  max,
  children,
  ...props
}: React.ComponentProps<"div"> & { /** Mostra só os primeiros N e um "+resto". */ max?: number }) {
  const items = React.Children.toArray(children)
  const shown = max ? items.slice(0, max) : items
  const rest = items.length - shown.length
  return (
    <div
      data-slot="avatar-group"
      className={cn("flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-card", className)}
      {...props}
    >
      {shown}
      {rest > 0 && (
        <span
          data-slot="avatar"
          aria-label={`Mais ${rest}`}
          className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
        >
          +{rest}
        </span>
      )}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarStatus, AvatarGroup }
