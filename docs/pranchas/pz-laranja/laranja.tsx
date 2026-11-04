"use client"

import * as React from "react"
import { AlertTriangleIcon, CheckCircle2Icon, PackagePlusIcon, QrCodeIcon, XCircleIcon } from "lucide-react"

import { PALETAS, vars } from "../pz-dash/painel"
import { PzMarca, PzSimbolo } from "../pz-marca/marca"
import { Badge } from "@/registry/webcode/ui/badge"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"

// Teste de paleta (03/11/2026): Névoa + laranja-brasa da referência (navy, brasa, prata, grafite).
// Hex só nas definições de paleta; o resto usa var(--wc-*).

const NEVOA = PALETAS[0].vars

// Variante "só na ação principal": botão padrão continua navy; o laranja vem por classe nas ações escolhidas.
const DESTAQUE: Record<string, string> = {
  ...NEVOA,
  "--pz-brasa": "#D23B26",
  "--pz-brasa-hover": "#B9321F",
  "--pz-brasa-soft": "#FBE6E2",
  "--pz-prata": "#C9CED6",
  "--pz-grafite": "#2A2D33",
  "--wc-danger": "#B4123F",
  "--wc-danger-solid": "#B4123F",
  "--wc-danger-soft": "#FCE8EE",
}


function Marca({ fundo, escuro = false, mono = false, cor, className = "" }: { fundo: string; escuro?: boolean; mono?: boolean; cor?: string; className?: string }) {
  return (
    <div className={`grid min-h-40 place-items-center rounded-3xl border p-6 ${className}`} style={{ background: fundo, color: cor }}>
      {mono ? (
        <span className="inline-flex items-center gap-3">
          <PzSimbolo className="size-14" mono />
          <span className="font-display text-3xl font-extrabold tracking-tight">PacoteZap</span>
        </span>
      ) : (
        <PzMarca escuro={escuro} simbolo="size-14" texto="text-3xl" className="gap-3" />
      )}
    </div>
  )
}

function Icone({ fundo, rotulo, escuro = false, mono = false, cor }: { fundo: string; rotulo: string; escuro?: boolean; mono?: boolean; cor?: string }) {
  return (
    <figure className="m-0 grid justify-items-center gap-2">
      <span aria-hidden className="grid size-20 place-items-center rounded-[1.4rem] shadow-wc-md" style={{ background: fundo, color: cor }}>
        <PzSimbolo className="size-14" escuro={escuro} mono={mono} />
      </span>
      <figcaption className="text-xs text-muted-foreground">{rotulo}</figcaption>
    </figure>
  )
}

function Amostra({ cor, nome, uso }: { cor: string; nome: string; uso: string }) {
  return (
    <div className="grid gap-2">
      <span aria-hidden className="h-20 rounded-2xl border" style={{ background: cor }} />
      <span className="text-sm font-semibold">{nome}</span>
      <span className="text-xs text-muted-foreground">{uso}</span>
    </div>
  )
}

function Logos() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-2">
          <p className="text-sm font-semibold">Fundo claro</p>
          <Marca fundo="var(--wc-surface)" />
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-semibold">Sobre navy (raio em brasa clara)</p>
          <Marca fundo="var(--wc-fg)" escuro className="border-transparent" />
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-semibold">Uma cor (grafite)</p>
          <Marca fundo="var(--wc-surface)" mono cor="var(--pz-grafite)" />
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-8 rounded-3xl border bg-card p-6">
        <Icone fundo="var(--wc-fg)" escuro rotulo="Ícone do app" />
        <Icone fundo="var(--wc-surface)" rotulo="Fundo claro" />
        <Icone fundo="var(--pz-grafite)" mono cor="var(--wc-surface)" rotulo="Monocromático" />
        <Icone fundo="var(--pz-prata)" mono cor="var(--wc-fg)" rotulo="Prata" />
        <Icone fundo="var(--pz-brasa)" mono cor="var(--wc-surface)" rotulo="Sobre brasa" />
      </div>
    </div>
  )
}

function Uso() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Decidido em 03/11</CardTitle>
          <CardDescription>Botão grande e card de destaque em navy; botão pequeno de ação em brasa.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button size="lg" shape="pill"><PackagePlusIcon aria-hidden />Registrar encomenda</Button>
            <Button size="lg" shape="pill" variant="outline"><QrCodeIcon aria-hidden />Ler QR</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button shape="pill">Salvar</Button>
            <Button shape="pill" variant="outline">Cancelar</Button>
          </div>
          <p className="text-sm text-muted-foreground">A logo final: pino-caixa na cor do texto, raio e “Zap” em brasa (brasa clara sobre navy, porque brasa sobre navy dá 2,9:1).</p>
        </CardContent>
      </Card>
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Erro precisa mudar de vermelho</CardTitle>
          <CardDescription>Com a marca laranja-avermelhada, o erro vira carmim, sempre com ícone e texto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="danger"><XCircleIcon aria-hidden />Aviso falhou</Badge>
            <Badge variant="warning"><AlertTriangleIcon aria-hidden />Passou do prazo</Badge>
            <Badge variant="success"><CheckCircle2Icon aria-hidden />Retirada</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button shape="pill">Ação da marca</Button>
            <Button shape="pill" variant="destructive">Cancelar registro</Button>
          </div>
          <p className="text-sm text-muted-foreground">Lado a lado: o laranja convida, o carmim alerta. Se ficarem parecidos, o porteiro confunde.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function Laranja() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(DESTAQUE)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Teste · 03/11/2026 · Névoa + Brasa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Paleta Névoa + Brasa</h1>
          <p className="max-w-[70ch] text-muted-foreground">Navy, laranja-brasa, prata e grafite, como na referência. O fundo Névoa e os cartões brancos continuam.</p>
        </header>

        <section className="grid gap-4">
          <h2 className="font-display text-3xl font-bold">Cores</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Amostra cor="var(--wc-fg)" nome="Navy" uso="Texto, menu, botões comuns" />
            <Amostra cor="var(--pz-brasa)" nome="Brasa" uso="Logo e ação principal" />
            <Amostra cor="var(--wc-bg)" nome="Névoa" uso="Fundo" />
            <Amostra cor="var(--pz-prata)" nome="Prata" uso="Bordas, ícone neutro" />
            <Amostra cor="var(--pz-grafite)" nome="Grafite" uso="Monocromático, impressão" />
            <Amostra cor="var(--wc-danger)" nome="Carmim" uso="Erro (antes era vermelho)" />
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="font-display text-3xl font-bold">Logo</h2>
          <Logos />
        </section>

        <section className="grid gap-4">
          <h2 className="font-display text-3xl font-bold">Onde a brasa entra</h2>
          <Uso />
        </section>

      </div>
    </div>
  )
}
