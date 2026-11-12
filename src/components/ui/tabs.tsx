"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { glass } from "@/lib/glass"

// Base shadcn/ui (MIT). WebCode: indicador desliza entre as abas com mola (segmented control do iOS)
// nas quatro variantes (default = segmented, line = sublinhado, pill = cápsula preenchida, glass = trilho de
// vidro espesso com lente que cresce ao toque, estilo iOS 26). Sem JS ou antes de hidratar, a aba ativa pinta
// o próprio fundo (sem salto).
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center text-muted-foreground group-data-[orientation=horizontal]/tabs:h-(--wc-density-control-md) group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "rounded-lg bg-muted p-1",
        line: "gap-1 bg-transparent group-data-[orientation=horizontal]/tabs:border-b group-data-[orientation=vertical]/tabs:border-r",
        pill: "gap-1 bg-transparent",
        glass: cn(glass("thick"), "rounded-full p-1 shadow-wc-md"),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type IndicatorRect = { x: number; y: number; w: number; h: number; vertical: boolean }

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [rect, setRect] = React.useState<IndicatorRect | null>(null)

  React.useLayoutEffect(() => {
    const list = ref.current
    if (!list) return
    const update = () => {
      const active = list.querySelector<HTMLElement>(
        ':scope > [data-slot="tabs-trigger"][data-state="active"]'
      )
      setRect(
        active
          ? {
              x: active.offsetLeft,
              y: active.offsetTop,
              w: active.offsetWidth,
              h: active.offsetHeight,
              vertical: list.getAttribute("aria-orientation") === "vertical",
            }
          : null
      )
    }
    update()
    const mutations = new MutationObserver(update)
    mutations.observe(list, { subtree: true, attributes: true, attributeFilter: ["data-state"] })
    const resize = new ResizeObserver(update)
    resize.observe(list)
    return () => {
      mutations.disconnect()
      resize.disconnect()
    }
  }, [])

  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      data-indicator={rect ? "ready" : undefined}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {rect && (
        <span
          aria-hidden
          data-slot="tabs-indicator"
          className={cn(
            "pointer-events-none absolute",
            "transition-[translate,width,height] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none",
            variant === "default" && "top-0 left-0 rounded-md bg-card shadow-wc-xs",
            variant === "pill" && "top-0 left-0 rounded-full bg-primary",
            // Lente: superfície elevada sólida (contraste ≥ 7:1) que cresce com mola ao pressionar o trilho.
            variant === "glass" &&
              "top-0 left-0 rounded-full bg-popover shadow-wc-xs inset-shadow-[0_1px_0_0_var(--wc-glass-highlight)] transition-[translate,width,height,scale] group-active/tabs-list:scale-[1.05] motion-reduce:group-active/tabs-list:scale-100",
            variant === "line" && (rect.vertical ? "top-0 -right-px w-0.5 bg-foreground" : "-bottom-px left-0 h-0.5 bg-foreground")
          )}
          style={
            variant === "line"
              ? rect.vertical
                ? { translate: `0 ${rect.y}px`, height: rect.h }
                : { translate: `${rect.x}px 0`, width: rect.w }
              : { translate: `${rect.x}px ${rect.y}px`, width: rect.w, height: rect.h }
          }
        />
      )}
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap text-muted-foreground",
        "transition-colors duration-(--wc-motion-duration-fast) outline-none hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
        "group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start",
        // Sem indicador (antes de hidratar), a aba ativa pinta o próprio fundo.
        "group-[[data-variant=default]:not([data-indicator])]/tabs-list:data-[state=active]:bg-card group-[[data-variant=default]:not([data-indicator])]/tabs-list:data-[state=active]:shadow-wc-xs",
        "group-[[data-variant=line]:not([data-indicator])]/tabs-list:data-[state=active]:shadow-[inset_0_-2px_0_var(--foreground)]",
        "group-data-[variant=glass]/tabs-list:rounded-full group-[[data-variant=glass]:not([data-indicator])]/tabs-list:data-[state=active]:bg-popover",
        "group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:data-[state=active]:text-primary-foreground group-data-[variant=pill]/tabs-list:data-[state=active]:hover:text-primary-foreground group-[[data-variant=pill]:not([data-indicator])]/tabs-list:data-[state=active]:bg-primary",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
        "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-(--wc-motion-duration-base)",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
