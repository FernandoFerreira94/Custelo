"use client"

import * as React from "react"

import { Entrada } from "../pz-entrada/entrada"
import { Painel, PALETAS, vars } from "../pz-dash/painel"
import { Pranchas } from "../pranchas/pranchas"
import { Telas } from "../pz-telas/telas"
import { Fluxo } from "../pz-fluxo/fluxo"
import { Gestao } from "../pz-gestao/gestao"
import { Estruturas } from "../pz-estrutura/estrutura"
import { Formularios } from "../pz-forms/forms"
import { Estados } from "../pz-estados/estados"
import { Escala } from "../pz-escala/escala"
import { Importar } from "../pz-importar/importar"
import { Plataforma } from "../pz-plataforma/plataforma"
import { Laranja } from "../pz-laranja/laranja"
import { Escuro } from "../pz-escuro/escuro"
import { Configuracoes } from "../pz-config/config"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/webcode/ui/tabs"

// Todas as pranchas do PacoteZap num artefato só (03/11/2026). Cada aba vem do seu arquivo de origem;
// a aba aberta fica no endereço (#entrada, #portaria, #painel, #cadastros).


// Sombra de "flutuar" (pedido do Fernando, 03/11): botão, campo e card descolam ~1 cm do fundo.
// Cor da sombra sai do token de texto (navy), sem hex.
const FLUTUAR = `
[data-wc-theme="custelo"] {
  --pz-brasa: #D23B26;
  --pz-brasa-hover: #B9321F;
  --pz-brasa-fg: #FFFFFF;
  --pz-brasa-clara: #FF6B4F;
  --pz-brasa-soft: #FBE6E2;
  --pz-sombra-controle: 0 1px 1px color-mix(in oklab, var(--wc-fg) 10%, transparent), 0 3px 6px -1px color-mix(in oklab, var(--wc-fg) 12%, transparent), 0 10px 20px -8px color-mix(in oklab, var(--wc-fg) 30%, transparent);
  --pz-sombra-card: 0 1px 2px color-mix(in oklab, var(--wc-fg) 8%, transparent), 0 6px 12px -4px color-mix(in oklab, var(--wc-fg) 10%, transparent), 0 20px 40px -12px color-mix(in oklab, var(--wc-fg) 28%, transparent), 0 36px 64px -24px color-mix(in oklab, var(--wc-fg) 22%, transparent);
  --pz-sombra-card-dentro: 0 1px 2px color-mix(in oklab, var(--wc-fg) 8%, transparent), 0 4px 8px -2px color-mix(in oklab, var(--wc-fg) 10%, transparent), 0 14px 28px -12px color-mix(in oklab, var(--wc-fg) 26%, transparent);
  --pz-sombra-primaria: 0 1px 1px color-mix(in oklab, var(--wc-fg) 14%, transparent), 0 4px 8px -2px color-mix(in oklab, var(--wc-fg) 22%, transparent), 0 12px 24px -8px color-mix(in oklab, var(--wc-fg) 45%, transparent);
}
[data-wc-theme="custelo"] [data-slot="button"]:not([data-variant="ghost"]):not([data-variant="link"]),
[data-wc-theme="custelo"] [data-slot="input"],
[data-wc-theme="custelo"] [data-slot="input-document"],
[data-wc-theme="custelo"] [data-slot="input-phone"] input,
[data-wc-theme="custelo"] [data-slot="input-cep"] input,
[data-wc-theme="custelo"] [data-slot="native-select"],
[data-wc-theme="custelo"] [data-slot="textarea"],
[data-wc-theme="custelo"] [data-slot="select-trigger"] {
  box-shadow: var(--pz-sombra-controle);
}
[data-wc-theme="custelo"] [data-slot="button"][data-variant="default"],
[data-wc-theme="custelo"] [data-slot="button"][data-variant="destructive"] {
  box-shadow: var(--pz-sombra-primaria), inset 0 1px 0 color-mix(in oklab, var(--primary-foreground) 18%, transparent);
}
[data-wc-theme="custelo"] [data-slot="card"],
[data-wc-theme="custelo"] [data-slot="input"],
[data-wc-theme="custelo"] [data-slot="select-trigger"],
[data-wc-theme="custelo"] [data-slot="textarea"],
[data-wc-theme="custelo"] [data-slot="button"][data-variant="outline"] { border-color: color-mix(in oklab, var(--wc-fg) 7%, var(--wc-surface)); }
[data-wc-theme="custelo"] [aria-invalid="true"][data-slot] { border-color: var(--destructive); }
[data-wc-theme="custelo"] [data-slot="input"]:focus-visible,
[data-wc-theme="custelo"] [data-slot="textarea"]:focus-visible {
  box-shadow: var(--pz-sombra-controle), 0 0 0 3px color-mix(in oklab, var(--wc-focus, var(--wc-fg)) 25%, transparent);
}
[data-wc-theme="custelo"] [data-slot="card"],
[data-wc-theme="custelo"] .shadow-wc-md,
[data-wc-theme="custelo"] .rounded-3xl.bg-card.border { box-shadow: var(--pz-sombra-card); }
[data-wc-theme="custelo"] [data-slot="item"][data-variant="outline"],
[data-wc-theme="custelo"] [data-slot="radio-group-card"],
[data-wc-theme="custelo"] [data-slot="checkbox-card"] { box-shadow: var(--pz-sombra-controle); }
[data-wc-theme="custelo"] [data-slot="card"] [data-slot="card"],
[data-wc-theme="custelo"] .rounded-3xl.bg-card [data-slot="card"] { box-shadow: var(--pz-sombra-card-dentro); }
/* Paleta Brasa (03/11): botão principal pequeno de ação em brasa; grande (lg) e elevated continuam navy. */
[data-wc-theme="custelo"] [data-slot="button"][data-variant="default"]:not([data-size="lg"]) {
  background-color: var(--pz-brasa);
  color: var(--pz-brasa-fg);
  box-shadow: 0 1px 1px color-mix(in oklab, var(--pz-brasa) 30%, transparent), 0 4px 8px -2px color-mix(in oklab, var(--pz-brasa) 35%, transparent), 0 12px 24px -8px color-mix(in oklab, var(--pz-brasa) 45%, transparent), inset 0 1px 0 color-mix(in oklab, var(--pz-brasa-fg) 18%, transparent);
}
[data-wc-theme="custelo"] [data-slot="button"][data-variant="default"]:not([data-size="lg"]):hover { background-color: var(--pz-brasa-hover); }
[data-wc-theme="custelo"] [data-slot="button"][data-variant="default"]:not([data-size="lg"]):focus-visible { outline-color: var(--pz-brasa); }
@media (prefers-reduced-motion: no-preference) {
  [data-wc-theme="custelo"] [data-slot="button"]:not([data-variant="ghost"]):not([data-variant="link"]):not(:disabled) {
    transition: transform var(--wc-motion-duration-fast, 150ms) ease, box-shadow var(--wc-motion-duration-fast, 150ms) ease;
  }
  [data-wc-theme="custelo"] [data-slot="button"]:not([data-variant="ghost"]):not([data-variant="link"]):not(:disabled):hover {
    transform: translateY(-1px);
  }
}
`

const ABAS = [
  { id: "entrada", label: "Entrada", conteudo: <Entrada /> },
  { id: "portaria", label: "Portaria", conteudo: <Pranchas /> },
  { id: "fluxo", label: "Receber e entregar", conteudo: <Fluxo /> },
  { id: "painel", label: "Painel", conteudo: <Painel paletas={[PALETAS[0]]} /> },
  { id: "cadastros", label: "Cadastros e avisos", conteudo: <Telas /> },
  { id: "estrutura", label: "Estrutura", conteudo: <Estruturas /> },
  { id: "gestao", label: "Gestão", conteudo: <Gestao /> },
  { id: "formularios", label: "Formulários", conteudo: <Formularios /> },
  { id: "estados", label: "Estados", conteudo: <Estados /> },
  { id: "importacao", label: "Importação e relatórios", conteudo: <Escala /> },
  { id: "importar", label: "Importar cadastros", conteudo: <Importar /> },
  { id: "config", label: "Configurações e organização", conteudo: <Configuracoes /> },
  { id: "plataforma", label: "Admin", conteudo: <Plataforma /> },
  { id: "laranja", label: "Paleta", conteudo: <Laranja /> },
  { id: "escuro", label: "Modo escuro", conteudo: <Escuro /> },
]

function lerHash() {
  if (typeof window === "undefined") return "entrada"
  const h = window.location.hash.slice(1)
  return ABAS.some((a) => a.id === h) ? h : "entrada"
}

export function Todas() {
  const [aba, setAba] = React.useState("entrada")
  const nevoa = vars(PALETAS[0].vars)

  React.useEffect(() => {
    setAba(lerHash())
    const onHash = () => setAba(lerHash())
    window.addEventListener("hashchange", onHash)
    // Diálogos abrem num portal no <body>: leva o tema e a paleta para lá.
    const b = document.body
    b.setAttribute("data-wc-theme", "custelo")
    b.setAttribute("data-mode", "light")
    for (const [k, v] of Object.entries(nevoa as Record<string, string>)) b.style.setProperty(k, v)
    return () => window.removeEventListener("hashchange", onHash)
  }, [nevoa])

  const trocar = (v: string) => {
    setAba(v)
    try {
      history.replaceState(null, "", `#${v}`)
    } catch {}
    window.scrollTo({ top: 0 })
  }

  return (
    <>
    <style>{FLUTUAR}</style>
    <Tabs value={aba} onValueChange={trocar} className="gap-0">
      <div data-wc-theme="custelo" data-mode="light" style={nevoa} className="sticky top-0 z-20 border-b bg-card px-4 py-2 sm:px-8">
        <div className="mx-auto flex max-w-[1320px] items-center gap-4 overflow-x-auto">
          <span className="shrink-0 font-semibold">PacoteZap</span>
          <TabsList>
            {ABAS.map((a) => (
              <TabsTrigger key={a.id} value={a.id}>
                {a.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
      {ABAS.map((a) => (
        <TabsContent key={a.id} value={a.id} className="mt-0">
          {a.conteudo}
        </TabsContent>
      ))}
    </Tabs>
    </>
  )
}
