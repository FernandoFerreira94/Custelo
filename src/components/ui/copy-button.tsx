"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// WebCode: copia texto (Pix copia e cola, chave de API, cupom) com troca de ícone animada (escala + blur
// curto), anúncio "Copiado" para leitor de tela e volta ao estado normal em 2s. Fallback para navegador sem
// Clipboard API. Aceita as variantes e tamanhos do Button.
function CopyButton({
  value,
  label = "Copiar",
  copiedLabel = "Copiado",
  showLabel = false,
  onCopied,
  className,
  variant = "outline",
  size,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "value" | "onClick"> & {
  value: string
  label?: string
  copiedLabel?: string
  showLabel?: boolean
  onCopied?: () => void
}) {
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = value
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      ta.remove()
    }
    setCopied(true)
    onCopied?.()
  }
  const icon = "col-start-1 row-start-1 transition-[opacity,scale,filter] duration-(--wc-motion-duration-fast) ease-wc-out motion-reduce:transition-none"
  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (showLabel ? "default" : "icon")}
      onClick={copy}
      aria-label={showLabel ? undefined : copied ? copiedLabel : label}
      data-copied={copied || undefined}
      className={cn(className)}
      {...props}
    >
      <span className="grid [&>svg]:size-4">
        <CopyIcon className={cn(icon, copied && "scale-50 opacity-0 blur-[2px]")} />
        <CheckIcon className={cn(icon, "text-success", !copied && "scale-50 opacity-0 blur-[2px]")} />
      </span>
      {showLabel && <span>{copied ? copiedLabel : label}</span>}
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  )
}

export { CopyButton }
