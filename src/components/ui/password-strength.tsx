"use client"

import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Inspirado no PasswordInput com medidor do Mantine e nos exemplos do HeroUI (MIT; reimplementado). Use junto do
// `InputPassword` (aponte `aria-describedby` para o `id` deste componente). WebCode: medidor de 4 segmentos com cor
// E rótulo ("Fraca" a "Forte"), checklist de regras com ícone e texto lido ("atendido"/"pendente"), senhas
// comuns e sequências derrubam a nota, anúncio educado só quando o nível muda e nada aparece com o campo vazio.
export type PasswordRule = { id: string; label: string; test: (value: string) => boolean }

const COMMON = ["123456", "12345678", "123456789", "senha", "senha123", "password", "qwerty", "abc123", "111111", "000000", "brasil", "admin", "102030"]

export const defaultPasswordRules: PasswordRule[] = [
  { id: "length", label: "Pelo menos 8 caracteres", test: (v) => v.length >= 8 },
  { id: "case", label: "Letras maiúsculas e minúsculas", test: (v) => /[a-zà-ÿ]/.test(v) && /[A-ZÀ-Ý]/.test(v) },
  { id: "number", label: "Um número", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "Um símbolo (!, @, #…)", test: (v) => /[^\p{L}\p{N}\s]/u.test(v) },
]

const LEVELS = [
  { label: "Muito fraca", bar: "bg-danger", text: "text-danger" },
  { label: "Fraca", bar: "bg-danger", text: "text-danger" },
  { label: "Média", bar: "bg-warning", text: "text-warning" },
  { label: "Boa", bar: "bg-success", text: "text-success" },
  { label: "Forte", bar: "bg-success", text: "text-success" },
] as const

/** Nota de 0 a 4: regras atendidas, bônus por tamanho, penalidade por senha comum ou repetitiva. */
export function scorePassword(value: string, rules: PasswordRule[] = defaultPasswordRules) {
  if (!value) return 0
  const lower = value.toLowerCase()
  if (COMMON.some((c) => lower.includes(c)) || /^(.)\1+$/.test(value)) return 0
  const passed = rules.filter((r) => r.test(value)).length
  let score = Math.round((passed / rules.length) * 3)
  if (value.length >= 12 && passed === rules.length) score = 4
  if (value.length < 6) score = Math.min(score, 1)
  return score
}

function PasswordStrength({
  value,
  rules = defaultPasswordRules,
  showRules = true,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  value: string
  rules?: PasswordRule[]
  showRules?: boolean
}) {
  const score = scorePassword(value, rules)
  const level = LEVELS[score]
  const empty = !value
  return (
    <div data-slot="password-strength" data-score={empty ? undefined : score} className={cn("grid gap-2 text-xs", className)} {...props}>
      <div className="flex items-center gap-3">
        <div aria-hidden className="grid flex-1 grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full bg-foreground/10 transition-colors duration-(--wc-motion-duration-base) ease-wc-out",
                !empty && i < Math.max(1, score) && level.bar
              )}
            />
          ))}
        </div>
        <span aria-live="polite" className={cn("min-w-20 text-right font-medium", empty ? "text-muted-foreground" : level.text)}>
          {empty ? "" : `Senha ${level.label.toLowerCase()}`}
        </span>
      </div>
      {showRules && (
        <ul className="grid gap-1">
          {rules.map((r) => {
            const ok = !empty && r.test(value)
            return (
              <li key={r.id} data-ok={ok || undefined} className={cn("flex items-center gap-1.5 text-muted-foreground", ok && "text-success")}>
                {ok ? <CheckIcon aria-hidden className="size-3.5" /> : <XIcon aria-hidden className="size-3.5 opacity-60" />}
                <span>{r.label}</span>
                <span className="sr-only">{ok ? " (atendido)" : " (pendente)"}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { PasswordStrength }
