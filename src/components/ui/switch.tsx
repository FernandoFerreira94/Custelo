"use client"

import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Base shadcn/ui (MIT). WebCode: proporção e mola do iOS, knob estica ao pressionar,
// trilho desligado com contorno 3:1 (WCAG 1.4.11), tamanho lg = 51×31 do iOS, `icons` = ✓/× dentro do botão
// (rótulos On/Off da acessibilidade do iOS: o estado não depende só da cor). `thumb="lens"` (iOS 26, ADR 0022):
// ao pressionar, o botão cresce além do trilho e vira uma lente de vidro que deixa a cor do trilho aparecer.
function Switch({
  className,
  size = "default",
  icons = false,
  thumb = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default" | "lg"
  /** Ícone ✓ (ligado) e × (desligado) no botão: o estado não depende só da cor. */
  icons?: boolean
  /** `lens`: ao pressionar, o botão vira lente de vidro maior que o trilho (iOS 26). */
  thumb?: "default" | "lens"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-thumb={thumb}
      className={cn(
        "peer group/switch relative inline-flex h-(--sw-h) w-(--sw-w) shrink-0 items-center rounded-full p-0.5 outline-none",
        "data-[size=sm]:[--sw-h:20px] data-[size=sm]:[--sw-thumb:16px] data-[size=sm]:[--sw-w:34px]",
        "data-[size=default]:[--sw-h:24px] data-[size=default]:[--sw-thumb:20px] data-[size=default]:[--sw-w:42px]",
        "data-[size=lg]:[--sw-h:31px] data-[size=lg]:[--sw-thumb:27px] data-[size=lg]:[--sw-w:51px]",
        "transition-[background-color,box-shadow] duration-(--wc-motion-duration-base) ease-wc-out",
        "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary data-[state=unchecked]:inset-ring data-[state=unchecked]:inset-ring-control-border enabled:hover:data-[state=unchecked]:inset-ring-[color-mix(in_oklab,var(--wc-control-border),var(--foreground)_35%)]",
        "pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:h-11 pointer-coarse:after:w-full pointer-coarse:after:-translate-1/2",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-(--sw-thumb) w-(--sw-thumb) rounded-full bg-(--wc-color-white) shadow-[0_2px_6px_rgb(0_0_0/0.18),0_0_0_0.5px_rgb(0_0_0/0.06)]",
          "transition-[translate,width] duration-(--wc-motion-spring-snappy-duration) ease-(--wc-motion-spring-snappy) motion-reduce:duration-0",
          "data-[state=checked]:translate-x-[calc(var(--sw-w)-var(--sw-thumb)-4px)]",
          "group-active/switch:w-[calc(var(--sw-thumb)*1.22)]",
          "group-active/switch:data-[state=checked]:translate-x-[calc(var(--sw-w)-var(--sw-thumb)*1.22-4px)]",
          thumb === "lens" &&
            "transition-[translate,width,scale,background-color,box-shadow] group-active/switch:scale-[1.35] group-active/switch:bg-[color-mix(in_oklab,var(--wc-color-white)_28%,transparent)] group-active/switch:backdrop-blur-[2px] group-active/switch:backdrop-saturate-150 group-active/switch:shadow-[0_4px_14px_rgb(0_0_0/0.18),inset_0_0_0_0.5px_rgb(255_255_255/0.7),inset_1px_1px_0_0_rgb(255_255_255/0.9)] motion-reduce:group-active/switch:scale-100",
          icons && "grid place-items-center"
        )}
      >
        {icons && (
          <>
            <CheckIcon aria-hidden className="hidden size-[60%] stroke-3 text-primary group-data-[state=checked]/switch:block" />
            <XIcon aria-hidden className="hidden size-[60%] stroke-3 text-muted-foreground group-data-[state=unchecked]/switch:block" />
          </>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
