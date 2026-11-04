import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { glass, glassInteractive, glassTint, springPress } from "@/lib/glass";
import { Spinner } from "@/components/ui/spinner";

// Base shadcn/ui (MIT). WebCode: pressão com escala, loading sem pular largura, variantes soft/glass,
// alvo de toque ≥ 44px em ponteiro grosso, foco com contorno sólido (WCAG 2.4.13), raio próprio (--wc-radius-button),
// altura pela densidade do tema (--wc-density-control-*), variantes `elevated` (relevo com brilho de topo e sombra
// do tema, sobe 1px no hover) e `destructive-soft` (perigo secundário), forma `pill`/`square`.
// `glass` usa o material de vidro do tema (ADR 0014): engrossa ao tocar e afunda com mola, como no iOS.
// `glass-prominent`/`glass-destructive` = vidro tingido do iOS 26 (ADR 0022): ação principal sobre foto ou mapa.
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-button text-sm font-medium whitespace-nowrap select-none",
    "transition-[background-color,color,border-color,box-shadow,scale,opacity] duration-(--wc-motion-duration-fast) ease-wc-out",
    "active:not-aria-busy:scale-[0.97] motion-reduce:active:scale-100",
    "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:not-aria-busy:opacity-50 aria-busy:cursor-progress",
    "aria-invalid:outline-2 aria-invalid:outline-solid aria-invalid:outline-destructive",
    "pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 pointer-coarse:after:-translate-1/2",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-wc-xs hover:bg-primary/90",
        destructive:
          "bg-destructive-solid text-destructive-solid-foreground shadow-wc-xs hover:bg-destructive-solid/90 focus-visible:outline-destructive",
        "destructive-soft":
          "bg-danger-soft text-danger hover:bg-danger-soft/70 focus-visible:outline-destructive",
        elevated:
          "bg-primary text-primary-foreground shadow-wc-xs inset-shadow-[0_1px_0_0_--alpha(var(--wc-color-white)/25%)] transition-[background-color,color,border-color,box-shadow,scale,opacity,translate] hover:-translate-y-px hover:bg-primary/90 hover:shadow-wc active:translate-y-0 active:shadow-wc-xs motion-reduce:hover:translate-y-0",
        outline:
          "border border-border bg-card shadow-wc-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        soft: "bg-accent text-accent-foreground hover:bg-accent/70",
        glass: `${glass("regular")} text-foreground ${glassInteractive} ${springPress}`,
        "glass-prominent": `${glassTint("accent")} ${springPress}`,
        "glass-destructive": `${glassTint("danger")} ${springPress} focus-visible:outline-destructive`,
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-brand underline-offset-4 hover:underline active:not-aria-busy:scale-100",
        // ADR-021: brasa só na ação pequena (filtro, "+", identificar).
        // Ação principal grande continua `default` (navy).
        brasa:
          "bg-brasa text-brasa-foreground shadow-[var(--shadow-brasa)] hover:bg-brasa-hover focus-visible:outline-brasa",
      },
      shape: {
        default: "",
        pill: "rounded-full",
        square: "rounded-md",
      },
      size: {
        default:
          "h-(--wc-density-control-md) px-4 has-[>svg,>[data-slot=button-label]>svg]:px-3",
        xs: "h-(--wc-density-control-xs) gap-1 px-2.5 text-xs has-[>svg,>[data-slot=button-label]>svg]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-(--wc-density-control-sm) gap-1.5 px-3 has-[>svg,>[data-slot=button-label]>svg]:px-2.5",
        lg: "h-(--wc-density-control-lg) px-6 text-base has-[>svg,>[data-slot=button-label]>svg]:px-5",
        icon: "size-(--wc-density-control-md)",
        "icon-xs":
          "size-(--wc-density-control-xs) [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-(--wc-density-control-sm)",
        "icon-lg": "size-(--wc-density-control-lg)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  shape = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Mostra spinner, mantém a largura e bloqueia cliques. Com asChild, só marca aria-busy. */
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled || loading}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <span
            data-slot="button-label"
            className="inline-flex items-center justify-center gap-[inherit] opacity-0"
          >
            {children}
          </span>
          <span className="absolute inset-0 grid place-items-center">
            <Spinner aria-hidden role={undefined} aria-label={undefined} />
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
