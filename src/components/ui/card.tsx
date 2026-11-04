import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { glass } from "@/lib/glass";

// Base shadcn/ui (MIT). WebCode: variantes `interactive` (eleva no hover, foco visível quando
// contém link/botão), `elevated` (flutua: sombra md do tema, sem borda forte), `flat` (sem sombra, para
// painéis densos), brilho de 1px no topo (glass-highlight: some no claro, separa o card no escuro) e
// `glass` (vidro regular do tema com brilho especular, ADR 0014; vira sólido com transparência reduzida).
// Sombras pela escala do tema (ADR 0013).
const cardVariants = cva(
  "flex flex-col gap-6 rounded-lg border py-6 text-card-foreground",
  {
    variants: {
      variant: {
        default:
          "bg-card shadow-wc-xs inset-shadow-[0_1px_0_0_var(--wc-glass-highlight)]",
        elevated:
          "border-border/60 bg-card shadow-wc-md inset-shadow-[0_1px_0_0_var(--wc-glass-highlight)] transition-[translate,box-shadow] duration-(--wc-motion-duration-base) ease-wc-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        flat: "bg-card shadow-none",
        interactive:
          "relative bg-card shadow-wc-xs inset-shadow-[0_1px_0_0_var(--wc-glass-highlight)] transition-[translate,box-shadow,border-color] duration-(--wc-motion-duration-base) ease-wc-out hover:-translate-y-0.5 hover:border-(--wc-border-strong) hover:shadow-wc motion-reduce:hover:translate-y-0 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        glass: `${glass("regular")} shadow-wc`,
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Card({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-tight font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
};
