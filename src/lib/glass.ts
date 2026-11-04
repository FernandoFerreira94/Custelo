import * as React from "react"

// Material de vidro do tema (ADR 0014), no estilo dos materiais do iOS: o fundo desfocado e saturado
// aparece através da superfície, com borda fina e brilho especular (luz em cima à esquerda, reflexo
// fraco embaixo à direita).
//
// Três espessuras, cada uma com contraste garantido pelo build sobre QUALQUER fundo (pior caso preto
// e branco), então funciona igual sem backdrop-filter:
// - thin:    ícones e texto grande (3:1). Botões flutuantes sobre foto, setas de carrossel.
// - regular: texto (4.5:1). Barras, tab bar, botões, cards.
// - thick:   texto secundário (4.5:1). Menus, popovers, sheets, diálogos, toasts.
//
// Transparência reduzida (prefers-reduced-transparency) vira superfície sólida pelos tokens.
// Desempenho: cada vidro é uma camada de blur. Não ponha vidro dentro de vidro (o de dentro usa
// fundo transparente) e evite mais de ~3 camadas visíveis ao mesmo tempo.

export type GlassMaterial = "thin" | "regular" | "thick"

const MATERIAL: Record<GlassMaterial, string> = {
  thin: "bg-glass-bg-thin backdrop-blur-glass",
  regular: "bg-glass-bg backdrop-blur-glass",
  thick: "bg-glass-bg-thick backdrop-blur-glass-thick",
}

// Borda e camadas leem variáveis com padrão igual ao visual de sempre, então `glassVariant()` muda o efeito
// no próprio elemento ou em qualquer ancestral (o mais próximo vence), sem prop nova nos componentes (ADR 0023).
// --wc-glass-rim (1px) espessura do brilho de borda · --wc-glass-glow (0) brilho interno contornando a peça ·
// --wc-glass-shade (0) sombra fina na base, a espessura da lente (fica no padding).
const EDGE =
  "border border-glass-border backdrop-saturate-(--wc-glass-saturate) inset-shadow-[var(--wc-glass-rim,1px)_var(--wc-glass-rim,1px)_0_0_var(--wc-glass-highlight),calc(var(--wc-glass-rim,1px)*-1)_calc(var(--wc-glass-rim,1px)*-1)_0_0_color-mix(in_oklab,var(--wc-glass-highlight)_40%,transparent),0_0_var(--wc-glass-glow,0px)_0_color-mix(in_oklab,var(--wc-glass-highlight)_55%,transparent),0_calc(var(--wc-glass-shade,0px)*-1)_var(--wc-glass-shade,0px)_calc(var(--wc-glass-shade,0px)*-0.5)_color-mix(in_oklab,var(--wc-fg)_12%,transparent)]"

// Camadas de fundo, de cima para baixo: brilho suave no topo (a "lente" refletindo a luz de cima; só clareia);
// cor de status (`status`, color-mix com o fundo da página, transparente sem a variável); textura (`acrylic`).
const LAYERS =
  "bg-[image:linear-gradient(to_bottom,color-mix(in_oklab,var(--wc-glass-highlight)_18%,transparent),transparent_60%),linear-gradient(color-mix(in_oklab,var(--wc-glass-status,transparent)_18%,var(--wc-bg)_var(--wc-glass-status-bg,0%)),color-mix(in_oklab,var(--wc-glass-status,transparent)_18%,var(--wc-bg)_var(--wc-glass-status-bg,0%))),var(--wc-glass-texture,linear-gradient(transparent,transparent))]"

/** Classes do material de vidro: fundo, blur, saturação, borda e brilho. Some com `cn()` para sobrescrever. */
export function glass(material: GlassMaterial = "regular", variant?: GlassVariant) {
  return `${MATERIAL[material]} ${EDGE} ${LAYERS}${variant ? ` ${glassVariant(variant)}` : ""}`
}

// ---------- Efeitos e cor de status (ADR 0023) ----------

/**
 * Efeito do vidro (referências: Liquid Glass do iOS 26, Acrylic do Fluent 2):
 * - frost (padrão): fosco e uniforme.
 * - liquid: borda especular de 1,5px, brilho interno contornando a peça e sombra fina na base (lente com
 *   volume). Para controles flutuantes. Não muda a espessura, então o contraste é o mesmo.
 * - acrylic: ruído fino (até 14% de alfa) sobre o desfoque, para painéis grandes (sidebar, sheet).
 */
export type GlassEffect = "frost" | "liquid" | "acrylic"

/**
 * Cor de status sutil (aviso, chip, painel informativo): a cor misturada com o fundo da página (18% + 30%)
 * mantém a luminância do vidro, então o texto continua ≥ 4.5:1 sobre qualquer fundo; o texto secundário dentro
 * sobe para 60% muted + 40% fg. Diferente de `glassTint`, que é a AÇÃO principal com a cor sólida.
 */
export type GlassStatus = "brand" | "success" | "warning" | "danger"

export type GlassVariant = { effect?: GlassEffect; status?: GlassStatus }

const EFFECT: Record<GlassEffect, string> = {
  frost: "",
  liquid: "[--wc-glass-rim:1.5px] [--wc-glass-glow:14px] [--wc-glass-shade:12px]",
  acrylic:
    "[--wc-glass-texture:url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%22.85%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%2F%3E%3CfeColorMatrix%20values%3D%220%200%200%200%20.5%200%200%200%200%20.5%200%200%200%200%20.5%200%200%200%20.14%200%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22%2F%3E%3C%2Fsvg%3E)]",
}

// A cor só liga com color-mix disponível: o polyfill do Tailwind trocaria o color-mix pela cor pura (opaca).
const STATUS_ON = "supports-[color:color-mix(in_lab,red,red)]:[--wc-glass-status-bg:30%] [--muted-foreground:color-mix(in_oklab,var(--wc-fg-muted)_60%,var(--wc-fg))]"
const STATUS: Record<GlassStatus, string> = {
  brand: `supports-[color:color-mix(in_lab,red,red)]:[--wc-glass-status:var(--wc-accent-solid)] ${STATUS_ON}`,
  success: `supports-[color:color-mix(in_lab,red,red)]:[--wc-glass-status:var(--wc-success)] ${STATUS_ON}`,
  warning: `supports-[color:color-mix(in_lab,red,red)]:[--wc-glass-status:var(--wc-warning)] ${STATUS_ON}`,
  danger: `supports-[color:color-mix(in_lab,red,red)]:[--wc-glass-status:var(--wc-danger)] ${STATUS_ON}`,
}

/**
 * Efeito e cor de status do vidro. Ponha no próprio componente de vidro (`className`) ou num ancestral para
 * valer para todos os vidros dentro; o mais próximo vence. Em conteúdo de Portal, no `className` do Content.
 *
 *   <Button variant="glass" className={glassVariant({ effect: "liquid" })}>
 *   <aside className={glassVariant({ effect: "acrylic" })}>…</aside>
 */
export function glassVariant({ effect = "frost", status }: GlassVariant = {}) {
  return [EFFECT[effect], status ? STATUS[status] : ""].filter(Boolean).join(" ")
}

/**
 * Vidro que antecipa (barras fixas no topo ou na base): o desfoque fica numa camada filha com o dobro da altura
 * da barra e máscara na metade, então a cor do conteúdo que vem chegando aparece no vidro antes de passar por
 * baixo (técnica "next-level frosted glass", Josh Comeau). A barra fica com fundo e borda; contraste igual.
 * Use num `<span aria-hidden>` dentro da barra, que precisa ser posicionada e sem `backdrop-filter` própria.
 */
export function glassBleed(edge: "top" | "bottom" = "top") {
  return edge === "top"
    ? "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[200%] backdrop-blur-glass backdrop-saturate-(--wc-glass-saturate) [mask-image:linear-gradient(to_bottom,black_50%,transparent_50%)]"
    : "pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[200%] backdrop-blur-glass backdrop-saturate-(--wc-glass-saturate) [mask-image:linear-gradient(to_top,black_50%,transparent_50%)]"
}

/** Vidro interativo (botão, segmento): engrossa no hover e no toque, como o vidro do iOS ao ser pressionado. */
export const glassInteractive =
  "hover:bg-glass-bg-thick active:bg-glass-bg-thick active:inset-shadow-[1px_1px_0_0_var(--wc-glass-highlight),-1px_-1px_0_0_var(--wc-glass-highlight)]"

/**
 * Pressão com mola do tema: só a escala usa a mola (o vidro "afunda" e volta com elasticidade); cor e
 * brilho mudam rápido, sem ultrapassar. Some com movimento reduzido.
 */
export const springPress =
  "[transition:scale_var(--wc-motion-spring-snappy-duration)_var(--wc-motion-spring-snappy),background-color_var(--wc-motion-duration-fast)_var(--wc-motion-ease-out),box-shadow_var(--wc-motion-duration-fast)_var(--wc-motion-ease-out),opacity_var(--wc-motion-duration-fast)_var(--wc-motion-ease-out)]! active:not-aria-busy:scale-[0.96] motion-reduce:active:scale-100"

// ---------- Variações Liquid Glass (ADR 0022) ----------

/**
 * Vidro tingido ("prominent" do iOS 26): a cor sólida do acento (ou do perigo) por cima do vidro espesso, para a
 * AÇÃO PRINCIPAL sobre foto, mapa ou vídeo. A opacidade da tinta é `--wc-glass-tint`, calculada pelo build por
 * tema e modo: a menor (72%–100%) em que o texto sólido mantém 4.5:1 sobre preto e branco. No hover e no toque
 * vira 100% (o vidro "engrossa"). Um por tela: tinta em tudo apaga a hierarquia.
 */
export type GlassTone = "accent" | "danger"

const TINT_EDGE =
  "border border-[color-mix(in_oklab,var(--wc-glass-highlight)_45%,transparent)] backdrop-blur-glass backdrop-saturate-(--wc-glass-saturate) inset-shadow-[0_1px_0_0_color-mix(in_oklab,var(--wc-color-white)_30%,transparent)] hover:[--wc-glass-tint:100%] active:[--wc-glass-tint:100%]"

const TINT: Record<GlassTone, string> = {
  accent: `bg-glass-bg-thick bg-[image:linear-gradient(color-mix(in_oklab,var(--wc-accent-solid)_var(--wc-glass-tint,100%),transparent),color-mix(in_oklab,var(--wc-accent-solid)_var(--wc-glass-tint,100%),transparent))] text-primary-foreground ${TINT_EDGE}`,
  danger: `bg-glass-bg-thick bg-[image:linear-gradient(color-mix(in_oklab,var(--wc-danger-solid)_var(--wc-glass-tint,100%),transparent),color-mix(in_oklab,var(--wc-danger-solid)_var(--wc-glass-tint,100%),transparent))] text-destructive-solid-foreground ${TINT_EDGE}`,
}

/** Classes do vidro tingido (ação principal sobre mídia). Texto sólido do tom com 4.5:1 garantido pelo build. */
export function glassTint(tone: GlassTone = "accent") {
  return TINT[tone]
}

/**
 * Luz que segue o ponteiro (Liquid Glass ilumina a partir do toque): brilho radial na cor `glass-highlight`
 * por baixo do conteúdo. Só clareia no modo claro (texto escuro ganha contraste) e é quase nulo no escuro
 * (highlight de 6%), então não mexe no contraste garantido. Só aparece com mouse; use com `useGlassLight()`.
 */
export const glassLight =
  "isolate before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-[radial-gradient(circle_5rem_at_var(--wc-glass-x,50%)_var(--wc-glass-y,0%),var(--wc-glass-highlight),transparent)] before:opacity-0 before:transition-opacity before:duration-(--wc-motion-duration-base) hover:before:opacity-100"

/** Liga a luz do ponteiro: grava a posição em `--wc-glass-x/y` direto no estilo (sem re-render). */
export function useGlassLight<T extends HTMLElement = HTMLElement>(onPointerMove?: React.PointerEventHandler<T>) {
  return React.useCallback(
    (e: React.PointerEvent<T>) => {
      onPointerMove?.(e)
      if (e.pointerType !== "mouse") return
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      el.style.setProperty("--wc-glass-x", `${Math.round(e.clientX - r.left)}px`)
      el.style.setProperty("--wc-glass-y", `${Math.round(e.clientY - r.top)}px`)
    },
    [onPointerMove]
  )
}

/** Material de menus, popovers e painéis: `solid` (superfície do tema) ou `glass` (vidro espesso). */
export type Material = "solid" | "glass"
