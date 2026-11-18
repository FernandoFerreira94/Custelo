"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// WebCode (inspirado no BorderBeam/ShineBorder da Magic UI, só CSS): um feixe de luz que percorre a borda
// do elemento pai (que precisa ser relative e ter overflow visível). Cor da marca por padrão; decorativo
// (aria-hidden); parado com movimento reduzido. Use em um único destaque por tela (plano em promoção, CTA).
//
// `variant="aurora"`: feixe em várias cores do tema (--wc-gradient-1..3) com um halo desfocado que vaza para
// dentro e para fora da borda, como nos campos de IA (prompt, Parar, busca). O halo é uma cópia do anel com
// `filter: blur` no invólucro (o filtro age depois da máscara, então o brilho sai macio dos dois lados).
// Use para dizer "a IA está aqui/trabalhando": no foco do campo, durante a resposta ou no botão Parar.
const AURORA = ["var(--wc-gradient-1)", "var(--wc-gradient-2)", "var(--wc-gradient-3)"]

function BorderBeam({
  className,
  duration,
  size,
  color = "var(--wc-accent)",
  colors,
  width = 1.5,
  variant = "line",
  glow,
  reverse = false,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  /** Segundos por volta (padrão 6; aurora 4). */
  duration?: number
  /** Comprimento do feixe em graus (padrão 90; aurora 140). */
  size?: number
  color?: string
  /** Cores do feixe em ordem (aurora). Padrão: --wc-gradient-1..3. */
  colors?: string[]
  width?: number
  /** `line`: um feixe fino de uma cor · `aurora`: várias cores com halo desfocado. */
  variant?: "line" | "aurora"
  /** Desfoque do halo em px (aurora; 0 desliga). Padrão 8. */
  glow?: number
  /** Gira no sentido anti-horário. */
  reverse?: boolean
}) {
  const aurora = variant === "aurora"
  const list = colors?.length ? colors : aurora ? AURORA : [color]
  const deg = size ?? (aurora ? 140 : 90)
  // Faixa: transparente → cores distribuídas no comprimento do feixe → transparente.
  const stops = list.map((c, i) => `${c} ${Math.round(((i + 1) / list.length) * deg * 0.92)}deg`).join(",")
  const gradient = `conic-gradient(from var(--wc-beam-angle),transparent 0deg,${stops},transparent ${deg}deg)`
  const vars = {
    "--beam-duration": `${duration ?? (aurora ? 4 : 6)}s`,
    "--beam-width": `${width}px`,
    "--beam-direction": reverse ? "reverse" : "normal",
  } as React.CSSProperties

  // O gradiente vai no `style` de cada anel: var(--wc-beam-angle) precisa resolver no elemento que anima.
  const ring = (extra?: string) => (
    <div
      style={{ background: gradient }}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] p-(--beam-width)",
        "[mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]",
        "motion-safe:animate-[wc-beam_var(--beam-duration)_linear_infinite] motion-safe:[animation-direction:var(--beam-direction)] motion-reduce:opacity-40",
        extra
      )}
    />
  )

  if (!aurora)
    return (
      <div
        aria-hidden
        data-slot="border-beam"
        data-variant="line"
        style={{ ...vars, background: gradient, ...style }}
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] p-(--beam-width)",
          "[mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]",
          "motion-safe:animate-[wc-beam_var(--beam-duration)_linear_infinite] motion-safe:[animation-direction:var(--beam-direction)] motion-reduce:opacity-40",
          className
        )}
        {...props}
      >
        <BeamKeyframes />
      </div>
    )

  const blur = glow ?? 8
  return (
    <div
      aria-hidden
      data-slot="border-beam"
      data-variant="aurora"
      style={{ ...vars, ...style }}
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      {...props}
    >
      {blur > 0 && (
        <div className="absolute inset-0 rounded-[inherit] opacity-70 motion-reduce:opacity-30" style={{ filter: `blur(${blur}px)` }}>
          {ring("p-[calc(var(--beam-width)*3)]")}
        </div>
      )}
      {ring()}
      <BeamKeyframes />
    </div>
  )
}

function BeamKeyframes() {
  return <style>{"@property --wc-beam-angle{syntax:'<angle>';inherits:false;initial-value:0deg}@keyframes wc-beam{to{--wc-beam-angle:360deg}}"}</style>
}

export { BorderBeam }
