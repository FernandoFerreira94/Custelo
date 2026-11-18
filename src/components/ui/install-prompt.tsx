"use client"

import * as React from "react"
import { CheckIcon, DownloadIcon, SquarePlusIcon, ShareIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Novo (o shadcn não tem): convite para instalar o PWA. Sem dependência.
// Chrome/Edge/Android: guarda o `beforeinstallprompt` e o botão Instalar abre o diálogo do sistema.
// Safari do iPhone/iPad (não tem esse evento): mostra o caminho "Compartilhar ⬆ → Adicionar à Tela de Início".
// Safari 17+ no Mac (também sem evento): "Arquivo → Adicionar ao Dock".
// `InstallButton`: o mesmo fluxo num botão (topo do site, menu de conta), com o passo a passo num diálogo.
// Some quando o app já está instalado (display-mode standalone) e quando a pessoa fecha (lembra por `snoozeDays`).
// Mostre depois de um momento de valor (pedido feito, 2ª visita), nunca na primeira tela.
// iOS 16.4+: push só funciona com o PWA instalado; diga isso no texto se notificação for importante.

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }
/** `android` = qualquer navegador com diálogo do sistema (Chrome/Edge no Android e no desktop). */
export type InstallPlatform = "android" | "ios" | "safari-mac" | "installed" | "unsupported"

let deferred: BeforeInstallPromptEvent | null = null
const subs = new Set<() => void>()
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    subs.forEach((f) => f())
  })
  window.addEventListener("appinstalled", () => {
    deferred = null
    subs.forEach((f) => f())
  })
}

function detect(): InstallPlatform {
  if (typeof window === "undefined") return "unsupported"
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true
  if (standalone) return "installed"
  if (deferred) return "android"
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent))
  if (ios) return "ios"
  const ua = navigator.userAgent
  const safariMac = /Macintosh/.test(ua) && /Version\/(1[7-9]|[2-9]\d)/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua)
  return safariMac ? "safari-mac" : "unsupported"
}

/** Plataforma de instalação e `install()` (true se aceitou). */
export function useInstallPrompt() {
  const [platform, setPlatform] = React.useState<InstallPlatform>("unsupported")
  React.useEffect(() => {
    const update = () => setPlatform(detect())
    update()
    subs.add(update)
    return () => {
      subs.delete(update)
    }
  }, [])
  const install = React.useCallback(async () => {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    setPlatform(detect())
    return outcome === "accepted"
  }, [])
  return { platform, install }
}

const SNOOZE_KEY = "wc-install-snooze"

function InstallPrompt({
  appName,
  icon,
  description = "Abre mais rápido, funciona com sinal fraco e fica na tela inicial.",
  platform: platformProp,
  snoozeDays = 14,
  onInstalled,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "children"> & {
  appName: string
  /** Ícone do app (img 48px com raio). */
  icon?: React.ReactNode
  description?: string
  /** Força a plataforma (demo/testes). Padrão: detecta. */
  platform?: Exclude<InstallPlatform, "unsupported" | "installed">
  /** Fechar esconde por N dias. */
  snoozeDays?: number
  onInstalled?: () => void
}) {
  const { platform: detected, install } = useInstallPrompt()
  const platform = platformProp ?? detected
  const [snoozed, setSnoozed] = React.useState(true)

  React.useEffect(() => {
    try {
      const until = Number(localStorage.getItem(SNOOZE_KEY) ?? 0)
      setSnoozed(!platformProp && until > Date.now())
    } catch {
      setSnoozed(false)
    }
  }, [platformProp])

  if (snoozed || platform === "installed" || platform === "unsupported") return null

  const close = () => {
    setSnoozed(true)
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + snoozeDays * 864e5))
    } catch {}
  }

  return (
    <section
      aria-label={`Instalar ${appName}`}
      data-slot="install-prompt"
      data-platform={platform}
      className={cn(
        "relative grid gap-3 rounded-2xl border bg-card p-4 pr-11 text-card-foreground shadow-wc",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-(--wc-motion-duration-slow)",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && <span aria-hidden className="size-12 shrink-0 overflow-hidden rounded-[0.8rem] shadow-wc-xs">{icon}</span>}
        <div className="min-w-0">
          <h2 className="font-semibold">Instale o {appName}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {platform === "android" ? (
        <button
          type="button"
          onClick={async () => {
            if (await install()) onInstalled?.()
          }}
          className="min-h-(--wc-density-control-md) rounded-xl bg-primary px-4 font-semibold text-primary-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
        >
          Instalar app
        </button>
      ) : (
        <InstallSteps platform={platform} />
      )}
      <button
        type="button"
        aria-label="Agora não"
        onClick={close}
        className="absolute top-2 right-2 grid size-(--wc-density-control-sm) place-items-center rounded-full pointer-coarse:after:absolute pointer-coarse:after:-inset-1.5 text-muted-foreground outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
      >
        <XIcon aria-hidden className="size-4" />
      </button>
    </section>
  )
}

/** Passo a passo para quem não tem diálogo do sistema: Safari do iPhone/iPad e Safari 17+ no Mac. */
function InstallSteps({ platform, className, ...props }: React.ComponentProps<"ol"> & { platform: "ios" | "safari-mac" }) {
  const mac = platform === "safari-mac"
  return (
    <ol data-slot="install-steps" className={cn("grid gap-2 text-sm", className)} {...props}>
      <li className="flex items-center gap-2">
        <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-brand">
          <ShareIcon className="size-4" />
        </span>
        <span>
          {mac ? "Clique em " : "Toque em "}
          <strong>Compartilhar</strong> {mac ? "na barra do Safari (ou menu Arquivo)" : "na barra do Safari"}
        </span>
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
          <SquarePlusIcon className="size-4" />
        </span>
        <span>
          Escolha <strong>{mac ? "Adicionar ao Dock" : "Adicionar à Tela de Início"}</strong>
        </span>
      </li>
    </ol>
  )
}

/**
 * Botão "Instalar app" para topo, menu ou página de ajuda: abre o diálogo do sistema onde existe
 * (Chrome/Edge, Android e desktop) e o passo a passo num diálogo no iPhone/iPad e no Safari do Mac.
 * Some quando já está instalado ou o navegador não instala. Aceita as props do Button.
 */
function InstallButton({
  appName = "o app",
  platform: platformProp,
  onInstalled,
  onClick,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  appName?: string
  /** Força a plataforma (demo/testes). Padrão: detecta. */
  platform?: Exclude<InstallPlatform, "unsupported" | "installed">
  onInstalled?: () => void
}) {
  const { platform: detected, install } = useInstallPrompt()
  const platform = platformProp ?? detected
  const [help, setHelp] = React.useState(false)
  if (platform === "installed" || platform === "unsupported") return null
  return (
    <>
      <Button
        data-slot="install-button"
        data-platform={platform}
        aria-haspopup={platform === "android" ? undefined : "dialog"}
        onClick={async (e) => {
          onClick?.(e)
          if (e.defaultPrevented) return
          if (platform !== "android") return setHelp(true)
          if (await install()) onInstalled?.()
        }}
        {...props}
      >
        {children ?? (
          <>
            <DownloadIcon aria-hidden />
            Instalar app
          </>
        )}
      </Button>
      {platform !== "android" && (
        <Dialog open={help} onOpenChange={setHelp}>
          <DialogContent size="sm" mobile="sheet">
            <DialogHeader>
              <DialogTitle>Instalar {appName}</DialogTitle>
              <DialogDescription>
                {platform === "ios" ? "No iPhone e no iPad a instalação é pelo Safari." : "No Mac, o Safari instala o site como app no Dock."}
              </DialogDescription>
            </DialogHeader>
            <InstallSteps platform={platform} />
            <DialogFooter>
              <Button onClick={() => setHelp(false)}>
                <CheckIcon aria-hidden />
                Entendi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export { InstallButton, InstallPrompt, InstallSteps }
