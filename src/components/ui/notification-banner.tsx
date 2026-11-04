"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { animateSpring, createVelocityTracker, haptic, project, rubberband } from "@/lib/gesture"
import { glass } from "@/lib/glass"

// Novo (o shadcn não tem): notificação in-app do iOS (o banner de push que desce do topo com o app aberto). Sem dependência.
// `notify({ title, body, app, icon, time, onPress })` + `<NotificationBannerHost />` (um por app).
// Desce com a mola do tema, some sozinho (5s; pausa com o dedo, o mouse ou o foco em cima); arrastar para cima dispensa
// (decide pela velocidade, como o iOS) e para baixo tem elástico. Tocar abre (`onPress`) e dispensa.
// O "×" é a alternativa ao gesto (WCAG 2.5.7). Texto anunciado em região `status` sempre montada.
// Para erro que exige ação use alerta; para confirmação curta, `hud`; para atividade contínua, `live-island`.
// RN/Expo: `expo-notifications` (banner do sistema) ou `react-native-notifier` para o in-app.

type Notice = {
  title: string
  body?: string
  /** Nome do app/remetente na primeira linha. */
  app?: string
  icon?: React.ReactNode
  /** "agora", "2 min". */
  time?: string
  onPress?: () => void
  /** ms; `Infinity` fica até dispensar. Padrão 5000. */
  duration?: number
}

let listener: ((n: Notice | null) => void) | null = null

function notify(n: Notice) {
  listener?.(n)
}
notify.dismiss = () => listener?.(null)

function NotificationBannerHost({ position = "fixed", className }: { position?: "fixed" | "absolute"; className?: string }) {
  const [notice, setNotice] = React.useState<(Notice & { key: number }) | null>(null)
  const [shown, setShown] = React.useState(false)
  const [announce, setAnnounce] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const y = React.useRef(0)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const stopAnim = React.useRef<() => void>(() => {})
  const paused = React.useRef(false)
  const drag = React.useRef<{ start: number; moved: boolean } | null>(null)
  const vt = React.useRef(createVelocityTracker())

  const paint = (v: number) => {
    y.current = v
    if (ref.current) ref.current.style.translate = `0 ${v}px`
  }
  const offscreen = () => -((ref.current?.offsetHeight ?? 80) + 24)

  const dismiss = React.useCallback((velocity = 0) => {
    clearTimeout(timer.current)
    stopAnim.current()
    stopAnim.current = animateSpring({ from: y.current, to: offscreen(), velocity, onUpdate: paint, onComplete: () => setShown(false) })
  }, [])

  const arm = React.useCallback(
    (ms: number | undefined) => {
      clearTimeout(timer.current)
      const total = ms ?? 5000
      if (Number.isFinite(total)) timer.current = setTimeout(() => !paused.current && dismiss(), total)
    },
    [dismiss]
  )

  React.useEffect(() => {
    let key = 0
    listener = (n) => {
      if (!n) return dismiss()
      setNotice({ ...n, key: ++key })
      setShown(true)
      setAnnounce(`${n.app ? n.app + ": " : ""}${n.title}${n.body ? ". " + n.body : ""}`)
      haptic("light")
    }
    return () => {
      listener = null
      clearTimeout(timer.current)
      stopAnim.current()
    }
  }, [dismiss])

  // Entrada: começa fora da tela e desce com mola.
  React.useLayoutEffect(() => {
    if (!notice || !shown) return
    stopAnim.current()
    paint(offscreen())
    stopAnim.current = animateSpring({ from: y.current, to: 0, onUpdate: paint })
    arm(notice.duration)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice?.key])

  const pause = () => {
    paused.current = true
    clearTimeout(timer.current)
  }
  const resume = () => {
    paused.current = false
    arm(notice?.duration)
  }

  return (
    <div
      data-slot="notification-banner-host"
      className={cn("pointer-events-none inset-x-0 top-0 z-[70] flex justify-center px-2 pt-[max(0.5rem,env(safe-area-inset-top))]", position, className)}
    >
      <p role="status" className="sr-only">{announce}</p>
      {notice && shown && (
        <div
          ref={ref}
          key={notice.key}
          data-slot="notification-banner"
          onPointerEnter={pause}
          onPointerLeave={() => !drag.current && resume()}
          onFocus={pause}
          onBlur={resume}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("[data-slot=notification-banner-close]")) return
            pause()
            stopAnim.current()
            drag.current = { start: e.clientY - y.current, moved: false }
            vt.current.reset()
            vt.current.add(e.clientY)
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            const d = drag.current
            if (!d) return
            const raw = e.clientY - d.start
            if (Math.abs(raw) > 6) d.moved = true
            vt.current.add(e.clientY)
            paint(raw > 0 ? rubberband(raw, 200) : raw)
          }}
          onPointerUp={() => {
            const d = drag.current
            drag.current = null
            if (!d) return
            const v = vt.current.get()
            if (d.moved && project(y.current, v) < -40) return dismiss(v)
            stopAnim.current = animateSpring({ from: y.current, to: 0, velocity: v, onUpdate: paint })
            resume()
            if (d.moved) return
            // Toque simples: abre.
            notice.onPress?.()
            dismiss()
          }}
          onPointerCancel={() => {
            drag.current = null
            stopAnim.current = animateSpring({ from: y.current, to: 0, onUpdate: paint })
            resume()
          }}
          className={cn(
            glass("thick"),
            "pointer-events-auto relative flex w-full max-w-md touch-none items-start gap-3 rounded-[1.4rem] p-3 pr-10 text-left shadow-wc-lg select-none",
            notice.onPress && "cursor-pointer"
          )}
        >
          {notice.icon && (
            <span aria-hidden className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-[0.6rem] bg-primary text-primary-foreground [&_svg]:size-5">
              {notice.icon}
            </span>
          )}
          <button
            type="button"
            data-slot="notification-banner-open"
            tabIndex={notice.onPress ? 0 : -1}
            aria-label={notice.onPress ? `Abrir: ${notice.title}` : undefined}
            onClick={(e) => {
              // Teclado (Enter/Espaço); o toque já foi tratado no pointerup.
              if (e.detail !== 0) return
              notice.onPress?.()
              dismiss()
            }}
            className="grid min-w-0 flex-1 gap-0.5 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-ring"
          >
            <span className="flex items-baseline justify-between gap-2 text-(length:--wc-mobile-text-footnote) text-muted-foreground">
              <span className="truncate font-medium uppercase">{notice.app}</span>
              {notice.time && <span className="shrink-0">{notice.time}</span>}
            </span>
            <span className="truncate font-semibold text-foreground">{notice.title}</span>
            {notice.body && <span className="line-clamp-2 text-sm text-foreground">{notice.body}</span>}
          </button>
          <button
            type="button"
            data-slot="notification-banner-close"
            aria-label="Dispensar notificação"
            onClick={() => dismiss()}
            className="absolute top-1 right-1 grid size-(--wc-density-control-sm) place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
          >
            <XIcon aria-hidden className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export { NotificationBannerHost, notify }
export type { Notice as NotificationNotice }
