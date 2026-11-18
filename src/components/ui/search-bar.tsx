"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { glass, glassInteractive, springPress, type Material } from "@/lib/glass"
import { BorderBeam } from "@/components/ui/border-beam"

// Novo (o shadcn não tem): barra de busca do iOS (UISearchBar). Sem dependência.
// Campo em pílula com lupa, botão limpar (X) quando há texto e "Cancelar" que entra deslizando ao focar.
// Cancelar/Esc limpa, tira o foco e fecha o teclado; Enter busca e também fecha o teclado (enterkeyhint="search").
// `data-active` no contêiner deixa a tela reagir (esconder o título grande, mostrar escopos/recentes).
// RN/Expo: `headerSearchBarOptions` do native-stack (UISearchController).
// `material="glass"` (iOS 26, ADR 0022): pílula de vidro espesso flutuando sobre o conteúdo, e Cancelar vira um
// botão circular de vidro com × (o rótulo continua no aria-label).

function SearchBar({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSearch,
  onCancel,
  onActiveChange,
  cancel = "focus",
  cancelLabel = "Cancelar",
  placeholder = "Buscar",
  className,
  inputClassName,
  material = "solid",
  "aria-label": ariaLabel = "Buscar",
  beam = "never",
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "type"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Enter no teclado. */
  onSearch?: (value: string) => void
  /** Tocou em Cancelar ou apertou Esc (o texto já foi limpo). */
  onCancel?: () => void
  /** Ficou ativa (foco ou texto) ou deixou de ficar. */
  onActiveChange?: (active: boolean) => void
  /** Quando mostrar o botão Cancelar. `focus` como no iOS; `never` em barra fixa de filtro. */
  cancel?: "focus" | "always" | "never"
  cancelLabel?: string
  inputClassName?: string
  /** `glass`: pílula de vidro flutuante e Cancelar em círculo de vidro (iOS 26). */
  material?: Material
  /** Feixe aurora na borda (busca com IA): `focus` só ativa, `always` sempre. Padrão `never`. */
  beam?: "never" | "focus" | "always"
}) {
  const isGlass = material === "glass"
  const ref = React.useRef<HTMLInputElement>(null)
  const [inner, setInner] = React.useState(defaultValue)
  const [focused, setFocused] = React.useState(false)
  const value = valueProp ?? inner
  const active = focused || value.length > 0

  const setValue = (next: string) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }

  const prev = React.useRef(active)
  React.useEffect(() => {
    if (prev.current !== active) onActiveChange?.(active)
    prev.current = active
  }, [active, onActiveChange])

  const doCancel = () => {
    setValue("")
    setFocused(false)
    ref.current?.blur()
    onCancel?.()
  }

  const showCancel = cancel === "always" || (cancel === "focus" && active)

  return (
    <form
      role="search"
      data-slot="search-bar"
      data-active={active || undefined}
      data-material={material}
      className={cn("flex w-full items-center", className)}
      onSubmit={(e) => {
        e.preventDefault()
        ref.current?.blur()
        onSearch?.(value)
      }}
    >
      <div className={cn("relative min-w-0 flex-1", isGlass ? "rounded-full" : "rounded-[calc(var(--wc-density-control-md)/2.8)]")}>
        {(beam === "always" || (beam === "focus" && active)) && <BorderBeam variant="aurora" className="z-1" />}
        <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 z-1 size-4.5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e)
            if (e.key === "Escape" && !e.defaultPrevented) {
              e.preventDefault()
              doCancel()
            }
          }}
          data-slot="search-bar-input"
          className={cn(
            // 16px evita o zoom do iOS ao focar; fundo preenchido (sem borda) como o campo do sistema.
            "h-(--wc-density-control-md) w-full min-w-0 pr-9 pl-8.5 text-base text-foreground outline-none",
            isGlass ? cn(glass("thick"), "rounded-full shadow-wc-md") : "rounded-[calc(var(--wc-density-control-md)/2.8)] bg-foreground/8",
            "placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
            "transition-shadow duration-(--wc-motion-duration-fast) ease-wc-out focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-solid focus-visible:outline-ring",
            inputClassName
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            aria-label="Limpar busca"
            data-slot="search-bar-clear"
            onPointerDown={(e) => e.preventDefault()} // mantém o foco (e o teclado) no campo
            onClick={() => {
              setValue("")
              ref.current?.focus()
            }}
            className="absolute top-1/2 right-0.5 grid size-(--wc-density-control-md) -translate-y-1/2 place-items-center rounded-full pointer-coarse:after:absolute pointer-coarse:after:-inset-0.5 text-muted-foreground outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
          >
            <span className="grid size-4.5 place-items-center rounded-full bg-muted-foreground text-background">
              <XIcon aria-hidden className="size-3" strokeWidth={3} />
            </span>
          </button>
        )}
      </div>
      {cancel !== "never" && (
        <div
          inert={!showCancel}
          className={cn(
            "grid overflow-hidden transition-[grid-template-columns,opacity] duration-(--wc-motion-duration-base) ease-wc-out motion-reduce:transition-none",
            showCancel ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0"
          )}
        >
          {isGlass ? (
            <span className="min-w-0 pl-2">
              <button
                type="button"
                data-slot="search-bar-cancel"
                aria-label={cancelLabel}
                onClick={doCancel}
                className={cn(
                  glass("regular"),
                  glassInteractive,
                  springPress,
                  "grid size-(--wc-density-control-md) place-items-center rounded-full text-foreground shadow-wc-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
                )}
              >
                <XIcon aria-hidden className="size-4.5" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              data-slot="search-bar-cancel"
              onClick={doCancel}
              className="min-h-(--wc-mobile-control-sm) min-w-0 pl-3 text-base whitespace-nowrap text-brand outline-none focus-visible:underline"
            >
              {cancelLabel}
            </button>
          )}
        </div>
      )}
    </form>
  )
}

export { SearchBar }
