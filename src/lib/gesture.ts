export type Spring = { stiffness: number; damping: number; mass: number }

/** Igual a `--wc-motion-spring-*` (tokens/base/motion.tokens.json). */
export const SPRINGS = {
  snappy: { stiffness: 380, damping: 30, mass: 1 },
  smooth: { stiffness: 220, damping: 26, mass: 1 },
  bouncy: { stiffness: 300, damping: 16, mass: 1 },
} as const satisfies Record<string, Spring>

export type SpringName = keyof typeof SPRINGS

/** Mola padrão do tema (playful bouncy, clean-saas snappy...). Fora do navegador, smooth. */
export function themeSpring(): Spring {
  if (typeof document === "undefined") return SPRINGS.smooth
  const css = getComputedStyle(document.documentElement)
  const current = css.getPropertyValue("--wc-motion-default-spring").trim()
  const name = (Object.keys(SPRINGS) as SpringName[]).find((n) => css.getPropertyValue(`--wc-motion-spring-${n}`).trim() === current)
  return SPRINGS[name ?? "smooth"]
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

type SpringOptions = {
  from: number
  to: number
  /** Velocidade inicial em px/s (a do dedo ao soltar). */
  velocity?: number
  spring?: Spring
  onUpdate: (value: number, velocity: number) => void
  onComplete?: () => void
}

/**
 * Anima um número com mola física (integração semi-implícita em passos de 1ms).
 * Com movimento reduzido vai direto ao destino. Devolve uma função que cancela.
 */
export function animateSpring({ from, to, velocity = 0, spring = themeSpring(), onUpdate, onComplete }: SpringOptions) {
  if (prefersReducedMotion() || typeof requestAnimationFrame === "undefined") {
    onUpdate(to, 0)
    onComplete?.()
    return () => {}
  }
  const { stiffness: k, damping: c, mass: m } = spring
  let x = from
  let v = velocity
  let last = performance.now()
  let raf = 0
  const step = (now: number) => {
    let dt = Math.min(now - last, 64) // aba em segundo plano não dá salto
    last = now
    for (; dt > 0; dt -= 1) {
      const h = Math.min(dt, 1) / 1000
      v += ((-k * (x - to) - c * v) / m) * h
      x += v * h
    }
    if (Math.abs(x - to) < 0.3 && Math.abs(v) < 8) {
      onUpdate(to, 0)
      onComplete?.()
      return
    }
    onUpdate(x, v)
    raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}

/** Elástico do iOS: quanto mais passa do limite, menos anda (c = 0.55 como no UIScrollView). */
export function rubberband(overshoot: number, dimension: number, c = 0.55) {
  const sign = Math.sign(overshoot)
  const d = Math.abs(overshoot)
  return sign * (1 - 1 / ((d * c) / dimension + 1)) * dimension
}

/** Onde o gesto pararia se continuasse desacelerando (decaimento do iOS, 0.998/ms). Velocidade em px/s. */
export function project(value: number, velocity: number, decelerationRate = 0.998) {
  return value + ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/** Velocímetro de ponteiro: média ponderada dos últimos ~80ms, em px/s. */
export function createVelocityTracker() {
  let samples: { t: number; p: number }[] = []
  return {
    reset() {
      samples = []
    },
    add(p: number, t = performance.now()) {
      samples.push({ t, p })
      while (samples.length > 2 && t - samples[0].t > 80) samples.shift()
    },
    get() {
      if (samples.length < 2) return 0
      const a = samples[0]
      const b = samples[samples.length - 1]
      return b.t === a.t ? 0 : ((b.p - a.p) / (b.t - a.t)) * 1000
    },
  }
}

export type HapticKind = "selection" | "light" | "medium" | "heavy" | "success" | "warning" | "error"

const VIBRATION: Record<HapticKind, number | number[]> = {
  selection: 6,
  light: 10,
  medium: 16,
  heavy: 24,
  success: [10, 50, 14],
  warning: [16, 60, 16],
  error: [20, 40, 20, 40, 20],
}

let hapticsEnabled = true
let iosSwitch: HTMLLabelElement | null = null

/** Desliga/liga a resposta tátil (ex.: preferência do usuário no app). */
export function setHaptics(enabled: boolean) {
  hapticsEnabled = enabled
}

/**
 * Resposta tátil curta em marcos do gesto (passou do limite, ação disparou). Android/Chrome: `navigator.vibrate`.
 * Safari iOS 18+: não tem `vibrate`; o `<input type="checkbox" switch>` nativo dá um toque leve ao alternar.
 * Sem suporte, não faz nada. Nunca é o único retorno: sempre há mudança visual junto.
 * RN/Expo: `expo-haptics` (selectionAsync, impactAsync, notificationAsync).
 */
export function haptic(kind: HapticKind = "light") {
  if (!hapticsEnabled || typeof window === "undefined" || prefersReducedMotion()) return
  // Antes do primeiro toque o navegador bloqueia (e reclama no console): só depois de interação real.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(VIBRATION[kind])
    return
  }
  if (!/iP(hone|ad|od)/.test(navigator.userAgent) && !(navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent))) return
  if (!iosSwitch) {
    iosSwitch = document.createElement("label")
    iosSwitch.setAttribute("aria-hidden", "true")
    iosSwitch.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9px;top:0"
    const input = document.createElement("input")
    input.type = "checkbox"
    input.setAttribute("switch", "")
    input.tabIndex = -1
    iosSwitch.append(input)
    document.body.append(iosSwitch)
  }
  iosSwitch.click()
}
