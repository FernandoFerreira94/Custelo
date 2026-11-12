"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Base shadcn/ui (MIT). WebCode: estado indeterminado visível (checked="indeterminate"),
// marca entra com escala curta e o traço do ✓ se desenha (stroke-dashoffset com @starting-style, sem JS; Emil
// Kowalski), alvo de toque ≥ 44px em ponteiro grosso, tamanhos sm/default/lg.
// `CheckboxCard` (Geist Choicebox múltiplo, Radix Themes CheckboxCards): o cartão inteiro marca e desmarca
// (adicionais, permissões, interesses), com título e descrição ligados por aria-labelledby/aria-describedby.
const SIZES = { sm: "size-4 rounded-[4px] [&_svg]:size-3", default: "size-4.5 rounded-[5px]", lg: "size-6 rounded-md [&_svg]:size-4" } as const

function Checkbox({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & { size?: keyof typeof SIZES }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size}
      className={cn(
        "peer group/checkbox relative shrink-0 border border-control-border bg-card shadow-wc-xs outline-none",
        SIZES[size],
        "transition-[background-color,border-color,box-shadow] duration-(--wc-motion-duration-fast) ease-wc-out",
        "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive enabled:hover:not-aria-invalid:data-[state=unchecked]:border-[color-mix(in_oklab,var(--wc-control-border),var(--foreground)_35%)]",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        "pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-11 pointer-coarse:after:-translate-1/2",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current data-[state=checked]:animate-in data-[state=checked]:zoom-in-50 data-[state=checked]:duration-(--wc-motion-duration-fast) data-[state=indeterminate]:animate-in data-[state=indeterminate]:zoom-in-50 data-[state=indeterminate]:duration-(--wc-motion-duration-fast)"
      >
        <CheckIcon className="hidden size-3.5 stroke-3 group-data-[state=checked]/checkbox:block [&_path]:[stroke-dasharray:24] [&_path]:[stroke-dashoffset:0] [&_path]:transition-[stroke-dashoffset] [&_path]:duration-(--wc-motion-duration-base) [&_path]:ease-wc-out starting:[&_path]:[stroke-dashoffset:24] motion-reduce:[&_path]:transition-none" />
        <MinusIcon className="hidden size-3.5 stroke-3 group-data-[state=indeterminate]/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

const CardIds = React.createContext<{ title: string; description: string } | null>(null)

function CheckboxCard({
  className,
  indicator = "start",
  children,
  ...props
}: Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "children"> & {
  children?: React.ReactNode
  /** `start`: caixinha antes do texto. `none`: só a borda marca (tiles com ícone). */
  indicator?: "start" | "none"
}) {
  const id = React.useId()
  const ids = React.useMemo(() => ({ title: `${id}-t`, description: `${id}-d` }), [id])
  return (
    <CardIds.Provider value={ids}>
      <CheckboxPrimitive.Root
        data-slot="checkbox-card"
        aria-labelledby={ids.title}
        aria-describedby={ids.description}
        className={cn(
          "group/checkbox-card relative flex w-full min-w-0 items-start gap-3 rounded-lg border border-border bg-card p-4 text-left text-sm shadow-wc-xs outline-none",
          "transition-[border-color,box-shadow,background-color,scale] duration-(--wc-motion-duration-fast) ease-wc-out active:scale-[0.99] motion-reduce:active:scale-100",
          "enabled:hover:data-[state=unchecked]:border-[color-mix(in_oklab,var(--wc-border),var(--foreground)_25%)]",
          "data-[state=checked]:border-primary data-[state=checked]:inset-ring-1 data-[state=checked]:inset-ring-primary",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
          indicator === "none" && "flex-col",
          className
        )}
        {...props}
      >
        {indicator === "start" && (
          <span
            aria-hidden
            data-slot="checkbox-card-indicator"
            className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-[5px] border border-control-border bg-card text-primary-foreground transition-colors duration-(--wc-motion-duration-fast) group-data-[state=checked]/checkbox-card:border-primary group-data-[state=checked]/checkbox-card:bg-primary"
          >
            <CheckIcon className="size-3.5 stroke-3 opacity-0 group-data-[state=checked]/checkbox-card:opacity-100 [&_path]:[stroke-dasharray:24] [&_path]:[stroke-dashoffset:24] group-data-[state=checked]/checkbox-card:[&_path]:[stroke-dashoffset:0] [&_path]:transition-[stroke-dashoffset] [&_path]:duration-(--wc-motion-duration-base) [&_path]:ease-wc-out motion-reduce:[&_path]:transition-none" />
          </span>
        )}
        {children}
      </CheckboxPrimitive.Root>
    </CardIds.Provider>
  )
}

function CheckboxCardContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="checkbox-card-content" className={cn("grid min-w-0 flex-1 gap-0.5", className)} {...props} />
}

function CheckboxCardTitle({ className, ...props }: React.ComponentProps<"span">) {
  const ids = React.useContext(CardIds)
  return <span id={ids?.title} data-slot="checkbox-card-title" className={cn("font-medium text-foreground", className)} {...props} />
}

function CheckboxCardDescription({ className, ...props }: React.ComponentProps<"span">) {
  const ids = React.useContext(CardIds)
  return <span id={ids?.description} data-slot="checkbox-card-description" className={cn("text-muted-foreground", className)} {...props} />
}

export { Checkbox, CheckboxCard, CheckboxCardContent, CheckboxCardTitle, CheckboxCardDescription }
