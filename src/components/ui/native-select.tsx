import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// <select> do sistema com o visual do Select: no iPhone abre a roda nativa, no Android a folha do sistema.
// Use quando a lista é curta e simples (parcelas, itens por página, UF); busca e ícones ficam com o Select/Combobox.
function NativeSelect({
  className,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & { size?: "sm" | "default" | "lg" }) {
  return (
    <div
      data-slot="native-select-wrapper"
      data-size={size}
      className={cn("group/native-select relative w-fit has-[select:disabled]:opacity-50", className)}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "w-full min-w-0 appearance-none rounded-md border border-input contrast-more:border-control-border bg-card py-0 pr-9 pl-3 text-base text-foreground tabular-nums shadow-wc-xs outline-none focus-visible:outline-hidden md:text-sm",
          "transition-[color,border-color,box-shadow] duration-(--wc-motion-duration-fast) ease-wc-out",
          "enabled:hover:not-focus-visible:not-aria-invalid:border-[color-mix(in_oklab,var(--input),var(--foreground)_35%)]",
          "focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed",
          "data-[size=sm]:h-(--wc-density-control-sm) data-[size=sm]:pl-2.5 data-[size=sm]:text-sm data-[size=default]:h-(--wc-density-control-md) data-[size=lg]:h-(--wc-density-control-lg)",
          // Opções herdam as cores do tema (o menu do sistema segue o color-scheme).
          "[&_option]:bg-card [&_option]:text-foreground"
        )}
        {...props}
      />
      <ChevronDownIcon
        aria-hidden
        data-slot="native-select-icon"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground opacity-80 group-data-[size=sm]/native-select:right-2.5"
      />
    </div>
  )
}

function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" className={cn(className)} {...props} />
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
