"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { animateSpring } from "@/lib/gesture"
import { GooFilter, useGooId } from "@/lib/goo"
import { glass } from "@/lib/glass"

// WebCode (sem equivalente no shadcn): tab bar flutuante do iOS 26 em vidro regular do tema (ADR 0014).
// Lente sólida desliza com mola até o item ativo e cresce ao toque; `minimizeOnScroll` esconde os rótulos
// ao rolar para baixo e volta ao subir. É navegação (nav + aria-current), não abas: cada item leva a uma
// tela. Contraste: rótulos em fg sobre vidro regular (≥ 4.5:1 sobre qualquer fundo) e o item ativo em
// cor da marca sobre a lente (superfície, ≥ 4.5:1). Alvo de toque ≥ 44px; safe-area com `fixed`.
// Estilos (`variant`): `pill` lente sob o item · `circles` só ícones em círculo · `minimal` ativo na cor da marca
// com ponto embaixo · `line` traço que desliza sob o ativo · `expanding` só ícones, o ativo abre o rótulo numa pílula.
// Estilos de vitrine (1.45.0, a partir de "6 glass menus"): `neon` lente com aro na cor da marca e uma lente-fantasma
// que segue o mouse · `bounce` o ícone ativo sobe num círculo acima da barra e quica · `wave` a borda da barra é um
// traço neon que forma uma onda sobre o ativo e anda com a mola do tema · `spotlight` feixe de luz desce do topo sobre o ativo.
// `gooey` (1.48.0): barra sólida e líquida (@webcode/goo); uma gota sobe da barra sob o ativo e escorre até o próximo,
// com uma segunda gota atrasada que estica a ponte (bottom nav de PWA). Sem vidro: o filtro não funde backdrop. Floating button
// = `TabBarItem raised`; Liquid Glass = `pill`. Com movimento reduzido nada quica nem desliza (troca direta).

type LensRect = { x: number; w: number; h: number }

type TabBarVariant = "pill" | "circles" | "minimal" | "line" | "expanding" | "neon" | "bounce" | "wave" | "spotlight" | "gooey"

const WAVE_H = 14

/** Contorno da barra com a onda sobre o item ativo (caixa W × (H + WAVE_H)). Mesmos comandos sempre: o `d` interpola. */
function wavePath(W: number, H: number, cx: number) {
  const r = H / 2
  const b = Math.min(44, Math.max(24, W / 9))
  const x = Math.min(Math.max(cx, r + b), W - r - b)
  const h = WAVE_H
  const k = b * 0.45
  return `M ${r} ${h} L ${x - b} ${h} C ${x - k} ${h} ${x - k} 0.5 ${x} 0.5 C ${x + k} 0.5 ${x + k} ${h} ${x + b} ${h} L ${W - r} ${h} A ${r} ${r} 0 0 1 ${W - r} ${h + H} L ${r} ${h + H} A ${r} ${r} 0 0 1 ${r} ${h} Z`
}

const TabBarContext = React.createContext<{ minimized: boolean; variant: TabBarVariant }>({ minimized: false, variant: "pill" })

function useLens(ref: React.RefObject<HTMLElement | null>) {
  const [rect, setRect] = React.useState<LensRect | null>(null)
  React.useLayoutEffect(() => {
    const list = ref.current
    if (!list) return
    const update = () => {
      const active = list.querySelector<HTMLElement>('[data-slot="tab-bar-item"][data-active="true"]')
      setRect(active ? { x: active.offsetLeft, w: active.offsetWidth, h: active.offsetHeight } : null)
    }
    update()
    const mutations = new MutationObserver(update)
    mutations.observe(list, { subtree: true, attributes: true, attributeFilter: ["data-active"] })
    const resize = new ResizeObserver(update)
    resize.observe(list)
    for (const el of list.children) resize.observe(el)
    return () => {
      mutations.disconnect()
      resize.disconnect()
    }
  }, [ref])
  return rect
}

function useMinimizeOnScroll(enabled: boolean, container?: React.RefObject<HTMLElement | null>) {
  const [minimized, setMinimized] = React.useState(false)
  React.useEffect(() => {
    if (!enabled) return setMinimized(false)
    const target: HTMLElement | Window = container?.current ?? window
    const read = () => (target instanceof Window ? target.scrollY : target.scrollTop)
    let last = read()
    const onScroll = () => {
      const y = read()
      // Folga de 8px: tremidas do dedo não alternam o estado; perto do topo sempre expande.
      if (y < 24) setMinimized(false)
      else if (y > last + 8) setMinimized(true)
      else if (y < last - 8) setMinimized(false)
      else return
      last = y
    }
    target.addEventListener("scroll", onScroll, { passive: true })
    return () => target.removeEventListener("scroll", onScroll)
  }, [enabled, container])
  return minimized
}

function TabBar({
  className,
  children,
  fixed = false,
  minimizeOnScroll = false,
  scrollContainer,
  variant = "pill",
  accessory,
  "aria-label": ariaLabel = "Navegação principal",
  ...props
}: React.ComponentProps<"nav"> & {
  /** Presa embaixo da tela, centralizada, acima da safe-area do iOS. */
  fixed?: boolean
  /** Esconde os rótulos ao rolar para baixo (iOS 26) e mostra ao subir. */
  minimizeOnScroll?: boolean
  /** Elemento que rola (padrão: a janela). */
  scrollContainer?: React.RefObject<HTMLElement | null>
  /** `circles`: só ícones em círculo, ativo preenchido · `minimal`: ponto sob o ativo · `line`: traço que desliza · `expanding`: só o ativo mostra o rótulo. */
  variant?: TabBarVariant
  /** Faixa logo acima da barra (mini player, ação fixa), em vidro regular. */
  accessory?: React.ReactNode
}) {
  const circles = variant === "circles"
  const lens = variant === "pill" || variant === "expanding" || variant === "neon"
  const wave = variant === "wave"
  const gooey = variant === "gooey"
  const gooId = useGooId("wc-tab-goo")
  const listRef = React.useRef<HTMLDivElement>(null)
  const rect = useLens(listRef)
  const [ghost, setGhost] = React.useState<LensRect | null>(null)
  const [box, setBox] = React.useState<{ w: number; h: number } | null>(null)
  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!wave || !list) return
    const read = () => setBox({ w: list.offsetWidth, h: list.offsetHeight })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(list)
    return () => ro.disconnect()
  }, [wave])
  // Neon: lente-fantasma segue o mouse (só ponteiro fino; no toque a lente real já responde).
  const onGhost = variant === "neon"
    ? {
        onPointerOver: (e: React.PointerEvent) => {
          if (e.pointerType !== "mouse") return
          const item = (e.target as HTMLElement).closest<HTMLElement>('[data-slot="tab-bar-item"]')
          setGhost(item ? { x: item.offsetLeft, w: item.offsetWidth, h: item.offsetHeight } : null)
        },
        onPointerLeave: () => setGhost(null),
      }
    : {}
  // Wave: o centro da onda anda com a mola do tema (o vidro usa máscara, que o CSS não interpola).
  const target = rect ? rect.x + rect.w / 2 : null
  const [waveX, setWaveX] = React.useState<number | null>(null)
  const waveRef = React.useRef<number | null>(null)
  React.useEffect(() => {
    if (!wave || target == null) return
    const from = waveRef.current
    const apply = (x: number) => {
      waveRef.current = x
      setWaveX(x)
    }
    if (from == null) return apply(target)
    return animateSpring({ from, to: target, onUpdate: apply })
  }, [wave, target])
  const wavePathD = wave && box && waveX != null ? wavePath(box.w, box.h, waveX) : null
  const waveMask = wavePathD && box
    ? `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${box.w}' height='${box.h + WAVE_H}'><path d='${wavePathD}'/></svg>`)}")`
    : undefined
  const minimized = useMinimizeOnScroll(minimizeOnScroll, scrollContainer)

  return (
    <nav
      data-slot="tab-bar"
      data-minimized={minimized || undefined}
      aria-label={ariaLabel}
      className={cn(
        "group/tab-bar flex flex-wrap items-end justify-center gap-2",
        fixed && "fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 px-4",
        className,
      )}
      {...props}
    >
      <TabBarContext.Provider value={{ minimized, variant }}>
        {accessory && (
          <div data-slot="tab-bar-accessory" className={cn(glass("regular"), "order-first flex min-h-(--wc-mobile-control-md) basis-full items-center rounded-full px-4 py-1 shadow-wc-md")}>
            {accessory}
          </div>
        )}
        <div
          ref={listRef}
          data-slot="tab-bar-list"
          data-lens={rect ? "ready" : undefined}
          data-variant={variant}
          {...onGhost}
          className={cn(
            (wave && wavePathD) || gooey ? "" : glass("regular"),
            "group/tab-bar-list relative flex items-stretch gap-0.5 rounded-full p-1",
            (wave && wavePathD) || gooey ? "" : "shadow-wc-lg",
            gooey && "mt-6 text-popover-foreground drop-shadow-[0_6px_14px_rgb(0_0_0/0.18)]",
            circles && "items-center gap-1.5",
            variant === "neon" && "ring-1 ring-[color-mix(in_oklab,var(--color-brand)_35%,transparent)]",
            variant === "bounce" && "mt-10",
            wave && "mt-3.5",
            "transition-[padding] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none",
          )}
        >
          {wave && wavePathD && box && (
            <>
              {/* Vidro recortado no contorno com a onda + traço neon por cima (o mesmo caminho). Máscara, não
                  clip-path: o Chromium não recorta o backdrop-filter pelo clip-path. */}
              <span
                aria-hidden
                data-slot="tab-bar-wave-glass"
                className={cn(glass("regular"), "pointer-events-none absolute left-0 rounded-none border-0 inset-shadow-none mask-size-[100%_100%] mask-no-repeat")}
                style={{ top: -WAVE_H, width: box.w, height: box.h + WAVE_H, maskImage: waveMask, WebkitMaskImage: waveMask }}
              />
              <svg
                aria-hidden
                data-slot="tab-bar-wave"
                className="pointer-events-none absolute left-0 overflow-visible text-brand drop-shadow-[0_0_6px_color-mix(in_oklab,var(--color-brand)_70%,transparent)]"
                style={{ top: -WAVE_H, width: box.w, height: box.h + WAVE_H }}
                viewBox={`0 0 ${box.w} ${box.h + WAVE_H}`}
              >
                <path d={wavePathD} fill="none" stroke="currentColor" strokeWidth={1.5} />
              </svg>
            </>
          )}
          {gooey && (
            <>
              <GooFilter id={gooId} blur={7} contrast={20} />
              {/* Camada líquida: barra + gota do ativo (sobe acima da barra) + gota atrasada que estica a ponte. */}
              <span aria-hidden data-slot="tab-bar-goo" className="pointer-events-none absolute inset-0" style={{ filter: `url(#${gooId})` }}>
                <span className="absolute inset-0 rounded-full bg-popover" />
                {rect && (
                  <>
                    <span
                      className="absolute top-0 left-0 rounded-full bg-popover transition-[translate] duration-[calc(var(--wc-motion-spring-smooth-duration,420ms)*1.6)] ease-(--wc-motion-spring-smooth) motion-reduce:transition-none"
                      style={{ translate: `${rect.x + rect.w / 2 - rect.h * 0.4}px ${-rect.h * 0.18}px`, width: rect.h * 0.8, height: rect.h * 0.8 }}
                    />
                    <span
                      data-slot="tab-bar-drop"
                      className="absolute top-0 left-0 rounded-full bg-popover transition-[translate] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none"
                      style={{ translate: `${rect.x + rect.w / 2 - rect.h * 0.5}px ${-rect.h * 0.42}px`, width: rect.h, height: rect.h }}
                    />
                  </>
                )}
              </span>
              {rect && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-0 left-0 rounded-full bg-primary shadow-wc-xs transition-[translate] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none"
                  style={{ translate: `${rect.x + rect.w / 2 - rect.h * 0.36}px ${-rect.h * 0.28}px`, width: rect.h * 0.72, height: rect.h * 0.72 }}
                />
              )}
            </>
          )}
          {rect && variant === "spotlight" && (
            <span
              aria-hidden
              data-slot="tab-bar-spotlight"
              className="pointer-events-none absolute top-0 left-0 transition-[translate,width] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none"
              style={{ translate: `${rect.x}px 0`, width: rect.w, height: "100%" }}
            >
              <span className="absolute inset-x-0 top-0 bottom-1 bg-linear-to-b from-[color-mix(in_oklab,var(--color-brand)_32%,transparent)] to-transparent [clip-path:polygon(32%_0,68%_0,100%_100%,0_100%)]" />
              <span className="absolute top-0 left-1/2 h-0.5 w-2/5 -translate-x-1/2 rounded-full bg-brand shadow-[0_0_10px_1px_var(--color-brand)]" />
            </span>
          )}
          {ghost && variant === "neon" && (
            <span
              aria-hidden
              data-slot="tab-bar-ghost"
              className="pointer-events-none absolute top-1 left-0 rounded-full bg-[color-mix(in_oklab,var(--color-brand)_10%,transparent)] transition-[translate,width] duration-(--wc-motion-duration-fast) ease-wc-out motion-reduce:transition-none"
              style={{ translate: `${ghost.x}px 0`, width: ghost.w, height: ghost.h }}
            />
          )}
          {rect && variant === "line" && (
            <span
              aria-hidden
              data-slot="tab-bar-line"
              className="pointer-events-none absolute bottom-1 left-0 h-0.5 rounded-full bg-brand transition-[translate,width] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none"
              style={{ translate: `${rect.x + rect.w * 0.3}px 0`, width: rect.w * 0.4 }}
            />
          )}
          {rect && lens && (
            <span
              aria-hidden
              data-slot="tab-bar-lens"
              className={cn(
                "pointer-events-none absolute top-1 left-0 rounded-full bg-popover shadow-wc-xs inset-shadow-[0_1px_0_0_var(--wc-glass-highlight)]",
                "transition-[translate,width,height,scale] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth)",
                "group-active/tab-bar-list:scale-[1.06] motion-reduce:transition-none motion-reduce:group-active/tab-bar-list:scale-100",
                variant === "neon" && "ring-1 ring-brand shadow-[0_0_16px_-2px_var(--color-brand)]",
              )}
              style={{ translate: `${rect.x}px 0`, width: rect.w, height: rect.h }}
            />
          )}
          {React.Children.toArray(children).filter((c) => !isAction(c))}
        </div>
        {React.Children.toArray(children).filter(isAction)}
      </TabBarContext.Provider>
    </nav>
  )
}

const isAction = (c: React.ReactNode) => React.isValidElement(c) && c.type === TabBarAction

function TabBarItem({
  className,
  active = false,
  icon,
  label,
  badge,
  asChild = false,
  raised = false,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  /** Botão central maior que sai da barra (ação mais frequente). Não entra na lente. */
  raised?: boolean
  /** Tela atual: lente por baixo, cor da marca e aria-current="page". */
  active?: boolean
  icon: React.ReactNode
  label: string
  /** Contador (ex.: 3 notificações). Acima de 99 vira "99+". */
  badge?: number
  /** Renderiza o filho (ex.: <Link>) com o visual do item. */
  asChild?: boolean
}) {
  const { minimized: min, variant } = React.useContext(TabBarContext)
  const circles = variant === "circles"
  const minimized = min || circles || raised || (variant === "expanding" && !active)
  const Comp = asChild ? Slot.Root : "button"
  const count = badge && badge > 0 ? (badge > 99 ? "99+" : String(badge)) : null
  const lifted = variant === "bounce" && active && !raised
  const content = (
    <>
      <span
        key={lifted ? "lifted" : "rest"}
        data-slot={lifted ? "tab-bar-lifted" : undefined}
        className={cn(
          "relative grid place-items-center [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
          // Bounce: o ícone sai da barra num círculo de vidro sólido e quica uma vez ao ativar.
          lifted &&
            "absolute -top-12 left-1/2 size-(--wc-mobile-control-sm) -translate-x-1/2 rounded-full bg-popover text-brand shadow-wc-md ring-1 ring-border animate-[wc-tab-bounce_var(--wc-motion-spring-bouncy-duration,520ms)_var(--wc-motion-ease-out,ease-out)] motion-reduce:animate-none",
          variant === "wave" && active && !raised && "-translate-y-1.5 transition-[translate] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none",
          // Gooey: o ícone ativo sobe para dentro da gota, branco sobre a cor primária.
          variant === "gooey" && !raised && "transition-[translate,color] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none",
          variant === "gooey" && active && !raised && "-translate-y-[calc(var(--wc-mobile-control-md)*0.28)] text-primary-foreground",
        )}
      >
        {icon}
        {count && (
          <span
            aria-hidden
            className="absolute -top-1 left-[calc(50%+6px)] min-w-4 rounded-full bg-destructive-solid px-1 text-center text-[0.625rem] leading-4 font-semibold text-destructive-solid-foreground tabular-nums"
          >
            {count}
          </span>
        )}
      </span>
      {lifted && <span aria-hidden className="size-6" />}
      <span
        className={cn(
          "grid transition-[grid-template-rows,grid-template-columns,opacity] duration-(--wc-motion-spring-smooth-duration) ease-(--wc-motion-spring-smooth) motion-reduce:transition-none",
          variant === "expanding"
            ? active
              ? "grid-cols-[1fr] opacity-100"
              : "grid-cols-[0fr] opacity-0"
            : minimized
              ? "grid-rows-[0fr] opacity-0"
              : "grid-rows-[1fr] opacity-100",
        )}
      >
        <span className={cn("overflow-hidden leading-tight font-medium", variant === "expanding" ? "text-sm whitespace-nowrap" : "text-[0.6875rem]")}>{label}</span>
      </span>
      {(variant === "minimal" || variant === "bounce") && !raised && (
        <span aria-hidden data-slot="tab-bar-dot" className={cn("size-1 rounded-full bg-brand transition-[opacity,scale] duration-(--wc-motion-duration-fast)", active ? "opacity-100" : "scale-0 opacity-0")} />
      )}
      {count && <span className="sr-only">, {badge} novos</span>}
      {variant === "bounce" && <style>{"@keyframes wc-tab-bounce{0%{translate:-50% 60%;scale:.6}55%{translate:-50% -14%;scale:1.05}75%{translate:-50% 4%}100%{translate:-50% 0;scale:1}}"}</style>}
    </>
  )
  return (
    <Comp
      data-slot={raised ? "tab-bar-raised" : "tab-bar-item"}
      data-active={active}
      aria-current={active ? "page" : undefined}
      type={asChild ? undefined : "button"}
      className={cn(
        "relative z-10 flex min-h-(--wc-mobile-control-sm) min-w-16 flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 text-foreground select-none",
        circles && "size-(--wc-mobile-control-sm) min-w-0 p-0 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
        variant === "line" && "pb-2.5",
        variant === "spotlight" && "data-[active=true]:text-foreground",
        variant === "expanding" && "min-w-0 flex-row gap-0 px-3.5 data-[active=true]:gap-1.5 data-[active=true]:pr-4",
        raised && "-mt-5 size-(--wc-mobile-control-lg) min-w-0 self-start bg-primary p-0 text-primary-foreground shadow-wc-lg hover:bg-primary/90 data-[active=true]:text-primary-foreground",
        "transition-[color,scale] duration-(--wc-motion-duration-fast) ease-wc-out active:scale-[0.94] motion-reduce:active:scale-100",
        "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
        "data-[active=true]:text-brand",
        // Antes de medir a lente (sem JS), o item ativo pinta o próprio fundo.
        (variant === "pill" || variant === "expanding") && !raised && "group-[:not([data-lens])]/tab-bar-list:data-[active=true]:bg-popover",
        className,
      )}
      {...props}
    >
      {asChild && React.isValidElement<{ children?: React.ReactNode }>(children)
        ? React.cloneElement(children, undefined, content)
        : content}
    </Comp>
  )
}

/** Botão redondo separado da barra (busca, novo), como no iOS 26. */
function TabBarAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="tab-bar-action"
      type="button"
      className={cn(
        glass("regular"),
        "grid size-(--wc-mobile-control-lg) shrink-0 place-items-center rounded-full text-foreground shadow-wc-lg",
        "transition-[scale,background-color] duration-(--wc-motion-duration-fast) ease-wc-out hover:bg-glass-bg-thick active:scale-[0.94] motion-reduce:active:scale-100",
        "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    />
  )
}

export { TabBar, TabBarItem, TabBarAction }
