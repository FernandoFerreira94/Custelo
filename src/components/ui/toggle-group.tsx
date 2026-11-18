"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { glass } from "@/lib/glass"
import { toggleVariants } from "@/components/ui/toggle"

// Base shadcn/ui (MIT). WebCode: variante "segmented" (controle segmentado do iOS: trilho cinza e item
// ativo em bg-card com sombra; em `type="single"` a pílula desliza com mola entre os itens), variante
// "glass" (o mesmo sobre vidro espesso, ADR 0014, com a pílula crescendo ao toque), itens colados com borda
// única no outline e spacing opcional.
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & { spacing?: number; segmented?: boolean; glass?: boolean }
>({
  size: "default",
  variant: "default",
})

type ThumbRect = { x: number; y: number; w: number; h: number }

/** Mede o item ligado para a pílula deslizante (só em `type="single"`). */
function useThumb(enabled: boolean) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [rect, setRect] = React.useState<ThumbRect | null>(null)
  React.useLayoutEffect(() => {
    const root = ref.current
    if (!enabled || !root) return setRect(null)
    const update = () => {
      const on = root.querySelector<HTMLElement>(':scope > [data-slot="toggle-group-item"][data-state="on"]')
      setRect(on ? { x: on.offsetLeft, y: on.offsetTop, w: on.offsetWidth, h: on.offsetHeight } : null)
    }
    update()
    const mutations = new MutationObserver(update)
    mutations.observe(root, { subtree: true, attributes: true, attributeFilter: ["data-state"] })
    const resize = new ResizeObserver(update)
    resize.observe(root)
    return () => {
      mutations.disconnect()
      resize.disconnect()
    }
  }, [enabled])
  return { ref, rect }
}

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  Omit<VariantProps<typeof toggleVariants>, "variant"> & {
    variant?: "default" | "outline" | "segmented" | "glass"
    /** Espaço entre itens (× 4px). 0 = itens colados. */
    spacing?: number
  }) {
  const isGlass = variant === "glass"
  const segmented = variant === "segmented" || isGlass
  const { ref, rect } = useThumb(segmented && props.type === "single")
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-thumb={rect ? "ready" : undefined}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[calc(var(--gap)*0.25rem)] rounded-md",
        variant === "outline" && spacing === 0 && "shadow-wc-xs",
        segmented && "relative gap-0.5 rounded-lg bg-muted p-0.5",
        isGlass && cn(glass("thick"), "rounded-full p-1 shadow-wc-md"),
        className
      )}
      {...props}
    >
      {rect && (
        <span
          aria-hidden
          data-slot="toggle-group-thumb"
          className={cn(
            "pointer-events-none absolute top-0 left-0 bg-card shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)]",
            "transition-[translate,width,height,scale] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none",
            isGlass
              ? "rounded-full bg-popover inset-shadow-[0_1px_0_0_var(--wc-glass-highlight)] group-active/toggle-group:scale-[1.05] motion-reduce:group-active/toggle-group:scale-100"
              : "rounded-md"
          )}
          style={{ translate: `${rect.x}px ${rect.y}px`, width: rect.w, height: rect.h }}
        />
      )}
      <ToggleGroupContext.Provider value={{ variant: segmented ? "default" : variant, size, spacing, segmented, glass: isGlass }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const ctx = React.useContext(ToggleGroupContext)
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants({ variant: ctx.variant || variant, size: ctx.size || size }),
        "w-auto min-w-0 shrink-0 focus:z-10 focus-visible:z-10",
        ctx.spacing === 0 && !ctx.segmented &&
          "rounded-none shadow-none first:rounded-l-md last:rounded-r-md data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        ctx.segmented &&
          "relative z-10 rounded-md text-muted-foreground hover:bg-transparent data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)]",
        // Com a pílula medida, o item ligado não pinta fundo próprio (quem aparece é a pílula deslizando).
        ctx.segmented &&
          "group-data-[thumb=ready]/toggle-group:data-[state=on]:bg-transparent group-data-[thumb=ready]/toggle-group:data-[state=on]:shadow-none",
        ctx.glass && "rounded-full",
        className
      )}
      data-variant={ctx.variant || variant}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
