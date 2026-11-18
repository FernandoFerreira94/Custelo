"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

// Base shadcn/ui (MIT). WebCode: `bg-card` na variante outline, altura mínima de toque (44px) em ponteiro grosso,
// hover/foco quando vira link (`asChild`), mídia `icon` em quadrado tingido pelo tema e textos com truncamento
// seguro (min-w-0). Para a lista agrupada estilo Ajustes do iOS, use o `list-group`.
const InGroup = React.createContext(false)

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <InGroup.Provider value>
      <div role="list" data-slot="item-group" className={cn("group/item-group flex flex-col", className)} {...props} />
    </InGroup.Provider>
  )
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="item-separator" orientation="horizontal" className={cn("my-0", className)} {...props} />
}

const itemVariants = cva(
  [
    "group/item flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none",
    "transition-colors duration-(--wc-motion-duration-fast) ease-wc-out",
    "[a]:hover:bg-accent [a]:hover:text-accent-foreground [button]:hover:bg-accent",
    "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
    "pointer-coarse:min-h-11",
  ],
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border bg-card",
        muted: "bg-muted",
      },
      size: {
        default: "gap-4 p-4",
        sm: "gap-2.5 px-4 py-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  // listitem só dentro do ItemGroup (role=list); solto, fica neutro para não quebrar a árvore de acessibilidade.
  const inGroup = React.useContext(InGroup)
  const node = (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      role={inGroup && !asChild ? "listitem" : undefined}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
  // Link/botão como item: o papel listitem fica num invólucro `contents` para o link manter a semântica.
  return inGroup && asChild ? (
    <div role="listitem" className="contents">
      {node}
    </div>
  ) : (
    node
  )
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-8 rounded-sm border bg-primary/10 text-primary [&_svg:not([class*='size-'])]:size-4",
        image: "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function ItemMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return <div data-slot="item-media" data-variant={variant} className={cn(itemMediaVariants({ variant, className }))} {...props} />
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-content" className={cn("flex min-w-0 flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", className)} {...props} />
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-title" className={cn("flex w-fit min-w-0 items-center gap-2 text-sm leading-snug font-medium text-foreground", className)} {...props} />
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-sm leading-normal font-normal text-balance text-muted-foreground",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-actions" className={cn("flex items-center gap-2", className)} {...props} />
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-header" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-footer" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />
}

export { Item, ItemMedia, ItemContent, ItemActions, ItemGroup, ItemSeparator, ItemTitle, ItemDescription, ItemHeader, ItemFooter }
