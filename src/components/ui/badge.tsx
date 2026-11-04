import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { glass, glassTint } from "@/lib/glass"

// Base shadcn/ui (MIT). WebCode: variantes de status com fundo suave (contraste 4.5:1 verificado no build)
// e `dot` para status ao vivo sem depender só da cor do texto; tamanhos sm/default/lg, forma `square` (tag)
// e `onRemove` (chip removível com botão de 44px no toque). `glass`/`glass-tinted` (ADR 0022): selo sobre foto
// (capa de produto, card de mídia); vidro fino só com texto ≥ 3:1, por isso o selo usa o regular.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,background-color,box-shadow] duration-(--wc-motion-duration-fast) outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      size: {
        sm: "h-5 px-1.5 text-[0.6875rem]",
        default: "",
        lg: "px-2.5 py-1 text-sm",
      },
      shape: {
        pill: "",
        square: "rounded-md",
      },
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        destructive:
          "bg-destructive-solid text-destructive-solid-foreground [a&]:hover:bg-destructive-solid/90",
        outline: "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-brand underline-offset-4 [a&]:hover:underline",
        soft: "bg-accent text-accent-foreground",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        glass: `${glass("regular")} text-foreground`,
        "glass-tinted": glassTint("accent"),
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "pill",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  shape = "pill",
  asChild = false,
  dot = false,
  onRemove,
  removeLabel,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    /** Ponto na cor do texto antes do rótulo (status). Ignorado com asChild. */
    dot?: boolean
    /** Chip removível: botão × depois do rótulo (filtros, tags selecionadas). Ignorado com asChild. */
    onRemove?: () => void
    /** Rótulo do botão de remover (padrão "Remover" + texto do chip quando é string). */
    removeLabel?: string
  }) {
  const Comp = asChild ? Slot.Root : "span"
  const removable = !!onRemove && !asChild

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size, shape }), removable && "pr-0.5", className)}
      {...props}
    >
      {dot && !asChild && (
        <span aria-hidden data-slot="badge-dot" className="size-1.5 shrink-0 rounded-full bg-current" />
      )}
      {children}
      {removable && (
        <button
          type="button"
          data-slot="badge-remove"
          aria-label={removeLabel ?? (typeof children === "string" ? `Remover ${children}` : "Remover")}
          onClick={onRemove}
          className="relative -mr-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-(--wc-motion-duration-fast) hover:bg-current/15 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-11 pointer-coarse:after:-translate-1/2"
        >
          <XIcon className="size-3" aria-hidden />
        </button>
      )}
    </Comp>
  )
}

export { Badge, badgeVariants }
