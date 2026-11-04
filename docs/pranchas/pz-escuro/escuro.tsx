"use client"

import * as React from "react"

import { Celular, DashA, MobC, Moldura, vars } from "../pz-dash/painel"

// Modo escuro (04/11/2026): mesmos valores do .dark no globals.css do PacoteZap (ADR-021).
// Hex só aqui, na definição da paleta; o resto usa var(--wc-*).
const ESCURO: Record<string, string> = {
  "--wc-bg": "#0A1B33", "--wc-sunken": "#071427", "--wc-surface": "#10294A", "--wc-surface-raised": "#143159",
  "--wc-fg": "#EEF1F5", "--wc-fg-muted": "#A9B8CC", "--wc-fg-subtle": "#8597AE",
  "--wc-border": "#1F3A60", "--wc-border-strong": "#2C4A75", "--wc-control-border": "#6F86A6",
  "--wc-accent": "#8CC3CF", "--wc-accent-hover": "#A6D3DC", "--wc-accent-solid": "#8CC3CF", "--wc-accent-solid-fg": "#0A1B33",
  "--wc-accent-soft": "#163A5C", "--wc-accent-soft-hover": "#1A3963", "--wc-focus": "#8CC3CF",
  "--wc-danger": "#FF8FA6", "--wc-danger-solid": "#B4123F", "--wc-danger-soft": "#3A0F1D",
  "--wc-chart-1": "#8CC3CF", "--wc-chart-2": "#D9925A", "--wc-chart-3": "#3FB68A", "--wc-chart-4": "#E0B34A", "--wc-chart-5": "#D57AA6",
}

// No escuro a brasa vira a clara (contraste com navy) e a sombra passa a ser preta: sombra clara brilharia.
const BRASA_ESCURA = `
[data-wc-theme="custelo"][data-mode="dark"],
[data-mode="dark"] [data-wc-theme="custelo"] {
  --pz-brasa: #F4826D;
  --pz-brasa-hover: #F79A88;
  --pz-brasa-fg: #0A1B33;
  --pz-brasa-soft: #3A1E1A;
  --pz-sombra-controle: 0 1px 1px rgb(0 0 0 / .35), 0 3px 6px -1px rgb(0 0 0 / .35), 0 10px 20px -8px rgb(0 0 0 / .5);
  --pz-sombra-card: 0 1px 2px rgb(0 0 0 / .3), 0 6px 12px -4px rgb(0 0 0 / .35), 0 20px 40px -12px rgb(0 0 0 / .5);
  --pz-sombra-card-dentro: 0 1px 2px rgb(0 0 0 / .3), 0 4px 8px -2px rgb(0 0 0 / .35), 0 14px 28px -12px rgb(0 0 0 / .45);
  --pz-sombra-primaria: 0 1px 1px rgb(0 0 0 / .35), 0 4px 8px -2px rgb(0 0 0 / .4), 0 12px 24px -8px rgb(0 0 0 / .55);
}
`

function Amostra({ cor, nome, uso }: { cor: string; nome: string; uso: string }) {
  return (
    <div className="grid gap-2">
      <span aria-hidden className="h-16 rounded-2xl border" style={{ background: cor }} />
      <span className="text-sm font-semibold">{nome}</span>
      <span className="text-xs text-muted-foreground">{uso}</span>
    </div>
  )
}

export function Escuro() {
  return (
    <div data-wc-theme="custelo" data-mode="dark" style={vars(ESCURO)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <style>{BRASA_ESCURA}</style>
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-10">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Teste · 04/11/2026 · Névoa + Brasa no escuro</p>
          <h1 className="font-display text-5xl font-bold text-balance">Modo escuro</h1>
          <p className="max-w-[70ch] text-muted-foreground">
            Navy profundo no fundo, cartões um tom acima, Ocean claro na ação principal e brasa clara nas ações pequenas. Sombra preta, sem vidro.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" aria-label="Cores do modo escuro">
          <Amostra cor="var(--wc-bg)" nome="Fundo" uso="Navy profundo" />
          <Amostra cor="var(--wc-surface)" nome="Cartão" uso="Um tom acima do fundo" />
          <Amostra cor="var(--wc-accent-solid)" nome="Ocean claro" uso="Botão grande e foco" />
          <Amostra cor="var(--pz-brasa)" nome="Brasa clara" uso="Botão pequeno e marca" />
          <Amostra cor="var(--wc-fg)" nome="Texto" uso="Névoa" />
          <Amostra cor="var(--wc-danger)" nome="Erro" uso="Carmim claro" />
        </section>

        <Moldura id="DASH-A" titulo="Painel do gestor" nota="Mesmo painel do claro, no escuro.">
          <DashA />
        </Moldura>
        <Celular id="MOB-C" titulo="Portaria" nota="Tela inicial do porteiro no escuro.">
          <MobC />
        </Celular>
      </div>
    </div>
  )
}
