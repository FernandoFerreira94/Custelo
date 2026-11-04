import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { glass } from "@/lib/glass";

// Base shadcn/ui (MIT). WebCode: variantes de status (info, success, warning, danger) com fundo suave
// e contraste verificado (descrição em fg: o fg-muted não passa em todos os fundos suaves), AlertAction para ação ou fechar no canto, role="alert" só onde interrompe.
// `appearance`: soft (fundo suave), outline (superfície do card, borda na cor) e bar (barra de 3px à esquerda, estilo Linear).
// `glass` (ADR 0022): vidro espesso sobre foto/mapa; o texto vira `foreground` (contraste garantido pelo build) e só o
// ícone leva a cor do status.
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 has-data-[slot=alert-action]:pr-12 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "border-danger/30 bg-danger-soft text-danger *:data-[slot=alert-description]:text-danger",
        info: "border-brand/25 bg-accent-soft text-foreground *:data-[slot=alert-description]:text-foreground [&>svg]:text-brand",
        success:
          "border-success/30 bg-success-soft text-foreground *:data-[slot=alert-description]:text-foreground [&>svg]:text-success",
        warning:
          "border-warning/35 bg-warning-soft text-foreground *:data-[slot=alert-description]:text-foreground [&>svg]:text-warning",
        danger:
          "border-danger/30 bg-danger-soft text-foreground *:data-[slot=alert-description]:text-foreground [&>svg]:text-danger",
      },
      appearance: {
        soft: "",
        outline: "bg-card",
        bar: "rounded-l-sm border-l-[3px] bg-card",
        glass: `${glass("thick")} rounded-2xl text-foreground shadow-wc-md *:data-[slot=alert-description]:text-muted-foreground`,
      },
    },
    compoundVariants: [
      { appearance: "bar", variant: "info", className: "border-l-brand" },
      { appearance: "bar", variant: "success", className: "border-l-success" },
      { appearance: "bar", variant: "warning", className: "border-l-warning" },
      { appearance: "bar", variant: "danger", className: "border-l-danger" },
      {
        appearance: "bar",
        variant: "destructive",
        className: "border-l-danger",
      },
      {
        appearance: "bar",
        variant: "default",
        className: "border-l-foreground/60",
      },
      {
        appearance: "glass",
        variant: "destructive",
        className: "[&>svg]:text-danger",
      },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "soft",
    },
  },
);

function Alert({
  className,
  variant,
  appearance = "soft",
  role,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  // Erro e aviso interrompem o leitor de tela; informação e sucesso entram na fila (status).
  const urgent =
    variant === "destructive" || variant === "danger" || variant === "warning";
  return (
    <div
      data-slot="alert"
      data-variant={variant ?? "default"}
      data-appearance={appearance}
      role={role ?? (urgent ? "alert" : "status")}
      className={cn(alertVariants({ variant, appearance }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

/** Ação no canto superior direito (fechar, desfazer). Botões pequenos: use Button size="icon-sm" ou "sm". */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "absolute top-2 right-2 flex items-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants };
