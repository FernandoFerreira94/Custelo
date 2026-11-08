"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// WebCode (sem equivalente no shadcn): campo de etiquetas (tags, e-mails, palavras-chave). Enter ou vírgula
// confirmam; colar "a, b; c" cria várias de uma vez; Backspace no campo vazio marca a última e o segundo
// apaga (não apaga por acidente); setas ←/→ andam entre as etiquetas. Repetida não entra: a existente
// pisca. `validate` devolve a mensagem pt-BR do erro. Cada mudança é anunciada (aria-live).
// Mesmo visual do Input (bg-card, borda 3:1, hover, halo de foco, erro) e altura pela densidade do tema.

type TagsInputProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  /** Máximo de etiquetas. */
  max?: number
  /** Devolve uma mensagem de erro para recusar a etiqueta (ex.: e-mail inválido). */
  validate?: (tag: string) => string | undefined
  /** Teclas além do Enter que confirmam (padrão: vírgula). */
  delimiters?: string[]
  disabled?: boolean
  /** Nome para envio em formulário (um input escondido por etiqueta). */
  name?: string
  id?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  "aria-label"?: string
}

function TagsInput({
  value: valueProp,
  defaultValue = [],
  onValueChange,
  placeholder = "Digite e tecle Enter",
  max,
  validate,
  delimiters = [","],
  disabled = false,
  name,
  id,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": describedBy,
  "aria-label": ariaLabel,
  ...props
}: TagsInputProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const tags = valueProp ?? inner
  const [draft, setDraft] = React.useState("")
  const [error, setError] = React.useState<string>()
  const [armed, setArmed] = React.useState(false)
  const [flash, setFlash] = React.useState<number | null>(null)
  const [live, setLive] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const chipsRef = React.useRef<HTMLUListElement>(null)
  const errorId = React.useId()
  const full = max !== undefined && tags.length >= max

  const commit = (next: string[], message: string) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
    setLive(message)
  }

  const add = (raw: string) => {
    const parts = raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!parts.length) return true
    setError(undefined)
    const next = [...tags]
    for (const part of parts) {
      if (max !== undefined && next.length >= max) {
        setError(`Máximo de ${max} etiquetas.`)
        break
      }
      const dup = next.findIndex((t) => t.toLocaleLowerCase("pt-BR") === part.toLocaleLowerCase("pt-BR"))
      if (dup >= 0) {
        setFlash(dup)
        setError(`“${part}” já está na lista.`)
        continue
      }
      const msg = validate?.(part)
      if (msg) {
        commitIfChanged(next)
        setError(msg)
        setDraft(part)
        return false
      }
      next.push(part)
    }
    commitIfChanged(next)
    return true
  }

  const commitIfChanged = (next: string[]) => {
    if (next.length === tags.length) return
    const added = next.slice(tags.length)
    commit(next, `${added.join(", ")} adicionad${added.length > 1 ? "as" : "a"}. ${next.length} no total.`)
  }

  const remove = (i: number, focusAfter = true) => {
    const removed = tags[i]
    commit(
      tags.filter((_, j) => j !== i),
      `${removed} removida. ${tags.length - 1} no total.`,
    )
    setArmed(false)
    if (focusAfter) inputRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === "Enter" || delimiters.includes(e.key)) {
      if (!draft.trim()) return
      e.preventDefault()
      if (add(draft)) setDraft("")
      return
    }
    if (e.key === "Backspace" && !draft && tags.length) {
      e.preventDefault()
      if (armed) remove(tags.length - 1)
      else setArmed(true)
      return
    }
    if (e.key === "ArrowLeft" && !draft && tags.length) {
      e.preventDefault()
      chipsRef.current?.querySelectorAll<HTMLButtonElement>("[data-slot=tags-input-remove]")[tags.length - 1]?.focus()
      return
    }
    setArmed(false)
  }

  const onChipKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const buttons = chipsRef.current?.querySelectorAll<HTMLButtonElement>("[data-slot=tags-input-remove]")
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      buttons?.[Math.max(0, i - 1)]?.focus()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      if (i === tags.length - 1) inputRef.current?.focus()
      else buttons?.[i + 1]?.focus()
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault()
      remove(i, false)
      const target = i > 0 ? buttons?.[i - 1] : null
      requestAnimationFrame(() => (target ?? inputRef.current)?.focus())
    }
  }

  React.useEffect(() => {
    if (flash === null) return
    const t = window.setTimeout(() => setFlash(null), 600)
    return () => window.clearTimeout(t)
  }, [flash])

  const invalid = ariaInvalid || !!error

  return (
    <div data-slot="tags-input-field" className={cn("grid gap-1.5", className)} {...props}>
      <div
        data-slot="tags-input"
        data-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        onClick={(e) => e.target === e.currentTarget && inputRef.current?.focus()}
        className={cn(
          "flex min-h-(--wc-density-control-md) w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border border-input contrast-more:border-control-border bg-card px-2 py-1.5 shadow-wc-xs",
          "transition-[border-color,box-shadow] duration-(--wc-motion-duration-fast) ease-wc-out",
          "hover:not-focus-within:not-aria-invalid:not-data-disabled:border-[color-mix(in_oklab,var(--input),var(--foreground)_35%)]",
          "focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        )}
      >
        {tags.length > 0 && (
          <ul ref={chipsRef} aria-label="Etiquetas" className="contents">
            {tags.map((tag, i) => (
              <li
                key={tag}
                data-slot="tags-input-tag"
                data-armed={(armed && i === tags.length - 1) || undefined}
                data-flash={flash === i || undefined}
                className={cn(
                  "inline-flex h-(--wc-density-control-xs) max-w-full animate-in items-center gap-1 rounded-sm border bg-secondary py-0 pr-0.5 pl-2 text-sm text-secondary-foreground zoom-in-90 fade-in-0 duration-(--wc-motion-duration-fast)",
                  "transition-[background-color,border-color,color] data-armed:border-ring data-armed:bg-accent-soft data-armed:text-brand",
                  "data-flash:animate-[wc-tag-flash_600ms_var(--wc-motion-ease-out)] motion-reduce:animate-none",
                )}
              >
                <span className="truncate">{tag}</span>
                <button
                  type="button"
                  data-slot="tags-input-remove"
                  disabled={disabled}
                  aria-label={`Remover ${tag}`}
                  onClick={() => remove(i)}
                  onKeyDown={(e) => onChipKeyDown(e, i)}
                  className={cn(
                    "relative inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
                    "focus-visible:outline-2 focus-visible:outline-solid",
                    "pointer-coarse:after:absolute pointer-coarse:after:-inset-2.5",
                  )}
                >
                  <XIcon className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={inputRef}
          id={id}
          value={draft}
          disabled={disabled || full}
          placeholder={full ? `Limite de ${max}` : tags.length ? undefined : placeholder}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={cn(describedBy, error && errorId) || undefined}
          enterKeyHint="enter"
          onChange={(e) => {
            const v = e.target.value
            // Colou ou digitou um separador no meio (celular não manda keydown de vírgula confiável).
            if (/[,;\n]/.test(v)) {
              const lastSep = Math.max(v.lastIndexOf(","), v.lastIndexOf(";"), v.lastIndexOf("\n"))
              if (add(v.slice(0, lastSep))) setDraft(v.slice(lastSep + 1).trimStart())
              return
            }
            setDraft(v)
            setArmed(false)
            if (error) setError(undefined)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => {
            setArmed(false)
            if (draft.trim() && add(draft)) setDraft("")
          }}
          className="h-(--wc-density-control-xs) min-w-24 flex-1 bg-transparent px-1 text-base outline-none focus-visible:outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
        />
      </div>
      {error && (
        <p id={errorId} data-slot="tags-input-error" className="text-sm text-danger">
          {error}
        </p>
      )}
      <span className="sr-only" aria-live="polite">
        {live}
      </span>
      {name && tags.map((t) => <input key={t} type="hidden" name={name} value={t} />)}
      <style>{"@keyframes wc-tag-flash{0%,100%{background:var(--secondary)}30%{background:var(--wc-warning-soft)}}"}</style>
    </div>
  )
}

export { TagsInput }
