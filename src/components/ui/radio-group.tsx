"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Base shadcn/ui (MIT). WebCode: ponto cresce com mola curta, alvo de toque ≥ 44px em ponteiro grosso.
// `RadioGroupCard` (Radix Themes RadioCards, Geist Choicebox, Polaris ChoiceList): o cartão inteiro é a opção
// (plano, frete, forma de pagamento), com título e descrição ligados por aria-labelledby/aria-describedby (o leitor
// não lê o cartão inteiro como nome) e o ponto no canto (`indicator="start"`, padrão) ou só a borda (`"none"`).
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "relative aspect-square size-4.5 shrink-0 rounded-full border border-control-border bg-card shadow-wc-xs outline-none",
        "transition-[border-color,box-shadow] duration-(--wc-motion-duration-fast) ease-wc-out",
        "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive enabled:hover:not-aria-invalid:data-[state=unchecked]:border-[color-mix(in_oklab,var(--wc-control-border),var(--foreground)_35%)]",
        "data-[state=checked]:border-primary",
        "pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-11 pointer-coarse:after:-translate-1/2",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        <span className="size-2.5 rounded-full bg-primary animate-in zoom-in-0 duration-(--wc-motion-spring-snappy-duration) ease-(--wc-motion-spring-snappy)" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

const CardIds = React.createContext<{ title: string; description: string } | null>(null)

function RadioGroupCard({
  className,
  indicator = "start",
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  /** `start`: ponto antes do texto. `none`: só a borda marca a escolha (tiles com ícone). */
  indicator?: "start" | "none"
}) {
  const id = React.useId()
  const ids = React.useMemo(() => ({ title: `${id}-t`, description: `${id}-d` }), [id])
  return (
    <CardIds.Provider value={ids}>
      <RadioGroupPrimitive.Item
        data-slot="radio-group-card"
        aria-labelledby={ids.title}
        aria-describedby={ids.description}
        className={cn(
          "group/radio-card relative flex w-full min-w-0 items-start gap-3 rounded-lg border border-border bg-card p-4 text-left text-sm shadow-wc-xs outline-none",
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
            data-slot="radio-group-card-indicator"
            className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full border border-control-border bg-card transition-colors duration-(--wc-motion-duration-fast) group-data-[state=checked]/radio-card:border-primary"
          >
            <span className="size-2.5 scale-0 rounded-full bg-primary transition-[scale] duration-(--wc-motion-spring-snappy-duration) ease-(--wc-motion-spring-snappy) group-data-[state=checked]/radio-card:scale-100 motion-reduce:transition-none" />
          </span>
        )}
        {children}
      </RadioGroupPrimitive.Item>
    </CardIds.Provider>
  )
}

/** Texto do cartão: título + descrição (spans, porque o cartão é um botão). */
function RadioGroupCardContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="radio-group-card-content" className={cn("grid min-w-0 flex-1 gap-0.5", className)} {...props} />
}

function RadioGroupCardTitle({ className, ...props }: React.ComponentProps<"span">) {
  const ids = React.useContext(CardIds)
  return <span id={ids?.title} data-slot="radio-group-card-title" className={cn("font-medium text-foreground", className)} {...props} />
}

function RadioGroupCardDescription({ className, ...props }: React.ComponentProps<"span">) {
  const ids = React.useContext(CardIds)
  return <span id={ids?.description} data-slot="radio-group-card-description" className={cn("text-muted-foreground", className)} {...props} />
}

export { RadioGroup, RadioGroupItem, RadioGroupCard, RadioGroupCardContent, RadioGroupCardTitle, RadioGroupCardDescription }
