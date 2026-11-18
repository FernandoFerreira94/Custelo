"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { glassBleed } from "@/lib/glass"

// WebCode (sem equivalente no shadcn): barra de navegação do iOS. Título grande abaixo da barra que, ao rolar,
// passa para o centro da barra; a barra fica transparente no topo e ganha vidro do tema (ADR 0014) quando há
// conteúdo por baixo (scroll edge appearance). Um único h1 (o grande; sem `large`, o da barra), a cópia é
// aria-hidden e a ordem de foco não muda. IntersectionObserver no elemento que rola (sem JS na rolagem).
// Movimento reduzido: troca sem deslizar.

function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p)
    if (/(auto|scroll|overlay)/.test(overflowY)) return p
  }
  return null
}

function NavigationBar({
  className,
  title,
  large = false,
  leading,
  trailing,
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  title: string
  /** Título grande (34pt) abaixo da barra, que recolhe para ela ao rolar. */
  large?: boolean
  /** Lado esquerdo: voltar, fechar. */
  leading?: React.ReactNode
  /** Lado direito: ações (até duas). */
  trailing?: React.ReactNode
  /** Abaixo do título grande (busca, filtros); rola junto com ele. */
  children?: React.ReactNode
}) {
  const barRef = React.useRef<HTMLElement>(null)
  const edgeRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLHeadingElement>(null)
  const [scrolled, setScrolled] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(!large)

  React.useEffect(() => {
    const bar = barRef.current
    const edge = edgeRef.current
    if (!bar || !edge) return
    const root = scrollParent(bar)
    const rootMargin = `-${bar.offsetHeight}px 0px 0px 0px`
    const edgeObs = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { root, rootMargin })
    edgeObs.observe(edge)
    let titleObs: IntersectionObserver | undefined
    if (large && titleRef.current) {
      titleObs = new IntersectionObserver(([e]) => setCollapsed(e.intersectionRatio < 0.5), { root, rootMargin, threshold: [0, 0.5, 1] })
      titleObs.observe(titleRef.current)
    }
    return () => {
      edgeObs.disconnect()
      titleObs?.disconnect()
    }
  }, [large])

  const InlineTitle = large ? "span" : "h1"

  return (
    <>
      <header
        ref={barRef}
        data-slot="navigation-bar"
        data-scrolled={scrolled || undefined}
        data-collapsed={collapsed || undefined}
        className={cn(
          "group/navigation-bar sticky top-0 z-30 grid min-h-(--wc-mobile-control-sm) grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-transparent px-2 pt-[env(safe-area-inset-top)]",
          "transition-[background-color,border-color] duration-(--wc-motion-duration-base) ease-wc-out motion-reduce:transition-none",
          "data-scrolled:border-glass-border data-scrolled:bg-glass-bg",
          className,
        )}
        {...props}
      >
        {/* Vidro que antecipa: o desfoque pega a cor do conteúdo antes de ele passar por baixo da barra. */}
        <span aria-hidden data-slot="glass-bleed" className={cn(glassBleed(), "hidden group-data-scrolled/navigation-bar:block")} />
        <div data-slot="navigation-bar-leading" className="flex min-w-0 items-center justify-start gap-1">
          {leading}
        </div>
        <InlineTitle
          aria-hidden={large || undefined}
          className={cn(
            "max-w-[50vw] truncate text-base font-semibold text-foreground",
            "transition-[opacity,translate] duration-(--wc-motion-duration-fast) ease-wc-out motion-reduce:transition-none",
            "translate-y-[calc(4px*var(--wc-motion-distance,1))] opacity-0 group-data-collapsed/navigation-bar:translate-y-0 group-data-collapsed/navigation-bar:opacity-100",
          )}
        >
          {title}
        </InlineTitle>
        <div data-slot="navigation-bar-trailing" className="flex min-w-0 items-center justify-end gap-1">
          {trailing}
        </div>
      </header>
      <div ref={edgeRef} aria-hidden className="h-px -mb-px" />
      {large && (
        <div data-slot="navigation-bar-large" className="grid gap-3 px-4 pt-1 pb-3">
          <h1
            ref={titleRef}
            className="font-display text-(length:--wc-mobile-text-large-title) leading-tight font-bold tracking-tight text-foreground"
          >
            {title}
          </h1>
          {children}
        </div>
      )}
    </>
  )
}

export { NavigationBar }
