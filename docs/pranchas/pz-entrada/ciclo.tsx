"use client"

import * as React from "react"
import { CameraIcon, CheckCheckIcon, CheckCircle2Icon, CheckIcon, ClockIcon, MessageCircleIcon, PackageIcon, PenLineIcon, ScanLineIcon } from "lucide-react"

import { Badge } from "@/registry/webcode/ui/badge"

// Animações do painel azul do login no computador (04/11/2026): o ciclo do pacote
// Chegou → Conferida → Avisada → Retirada, em 3 variações. Só CSS (transform/opacity),
// ciclo de 10 s, 2,5 s por fase. Com movimento reduzido fica parado e legível.

const FASES = [
  { id: "chegou", titulo: "Chegou", linha: "B-304 · Mercado Livre", hora: "11:42", Icone: CameraIcon, selo: "Recebida", tom: "soft" as const },
  { id: "conferida", titulo: "Conferida", linha: "Mariana Souza · B-304", hora: "11:42", Icone: ScanLineIcon, selo: "Conferida", tom: "soft" as const },
  { id: "avisada", titulo: "Avisada", linha: "WhatsApp entregue", hora: "11:43", Icone: MessageCircleIcon, selo: "Avisada", tom: "success" as const },
  { id: "retirada", titulo: "Retirada", linha: "Assinou na portaria", hora: "18:05", Icone: PenLineIcon, selo: "Retirada", tom: "success" as const },
]

// Fase i fica visível de i*25% a i*25%+25% do ciclo: mesma keyframe com atraso negativo.
const ATRASO = ["0s", "-7.5s", "-5s", "-2.5s"]

// Linha do tempo: cada linha entra na sua fase e fica até o fim do ciclo.
const linhas = [0, 1, 2, 3]
  .map((i) => {
    const a = i * 25
    return `@keyframes pz-lin${i}{0%,${a}%{opacity:0;transform:translateX(-10px)}${a + 4}%,94%{opacity:1;transform:none}100%{opacity:0}}`
  })
  .join("")

export const CICLO_CSS = `
@keyframes pz-quarto{0%{opacity:0;transform:translateY(10px)}4%,21%{opacity:1;transform:none}25%,100%{opacity:0;transform:translateY(-10px)}}
@keyframes pz-luz{0%{opacity:0;transform:scale(.6)}4%,21%{opacity:1;transform:none}25%,100%{opacity:0;transform:scale(.6)}}
@keyframes pz-varre{0%,25%{opacity:0;transform:translateY(0)}27%{opacity:1}48%{opacity:1;transform:translateY(72px)}50%,100%{opacity:0;transform:translateY(72px)}}
@keyframes pz-pulo{0%,50%{transform:scale(1)}53%{transform:scale(1.06)}56%,100%{transform:scale(1)}}
@keyframes pz-viagem{0%,21%{transform:translateX(0)}25%,46%{transform:translateX(var(--pz-passo))}50%,71%{transform:translateX(calc(var(--pz-passo)*2))}75%,94%{transform:translateX(calc(var(--pz-passo)*3));opacity:1}98%{opacity:0;transform:translateX(calc(var(--pz-passo)*3))}100%{opacity:0;transform:translateX(0)}}
@keyframes pz-trilha{0%{transform:scaleX(0)}21%{transform:scaleX(0)}25%,46%{transform:scaleX(.3333)}50%,71%{transform:scaleX(.6666)}75%,94%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
${linhas}
.pz-fase{animation:pz-quarto 10s ease-in-out infinite both}
.pz-luz{animation:pz-luz 10s ease-in-out infinite both}
.pz-varre{animation:pz-varre 10s linear infinite both}
.pz-pulo{animation:pz-pulo 10s ease-out infinite both}
.pz-viagem{animation:pz-viagem 10s cubic-bezier(.6,0,.2,1) infinite both}
.pz-trilha{transform-origin:left;animation:pz-trilha 10s cubic-bezier(.6,0,.2,1) infinite both}
${[0, 1, 2, 3].map((i) => `.pz-lin${i}{animation:pz-lin${i} 10s ease-out infinite both}`).join("")}
@media (prefers-reduced-motion: reduce){
  .pz-fase,.pz-luz,.pz-varre,.pz-pulo,.pz-viagem,.pz-trilha,.pz-lin0,.pz-lin1,.pz-lin2,.pz-lin3{animation:none}
  .pz-fase,.pz-luz,.pz-varre{opacity:0}
  .pz-fase[data-fase="0"],.pz-luz[data-fase="0"]{opacity:1}
  .pz-trilha{transform:scaleX(0)}
}
`

const VIDRO_NAO = { background: "color-mix(in oklab, var(--primary-foreground) 12%, var(--primary))" }
const BORDA = { borderColor: "color-mix(in oklab, var(--primary-foreground) 22%, var(--primary))" }

/* ---------- A · um cartão que muda de estado ---------- */

export function CicloCartao() {
  return (
    <div aria-hidden className="relative h-52 w-full max-w-md">
      <div className="absolute inset-x-10 top-0 h-24 rounded-2xl" style={VIDRO_NAO} />
      <div className="absolute inset-x-5 top-5 h-24 rounded-2xl" style={{ background: "color-mix(in oklab, var(--primary-foreground) 24%, var(--primary))" }} />
      <div className="pz-pulo absolute inset-x-0 top-10 h-[104px] overflow-hidden rounded-2xl bg-card text-card-foreground shadow-wc-lg">
        <span className="pz-varre absolute inset-x-0 top-0 h-0.5 bg-brand" />
        {FASES.map((f, i) => (
          <div key={f.id} data-fase={i} className="pz-fase absolute inset-0 flex items-center gap-3 p-4" style={{ animationDelay: ATRASO[i] }}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-brand">
              <f.Icone className="size-6" />
            </span>
            <div className="grid min-w-0 flex-1 justify-items-start gap-1.5">
              <p className="font-mono text-lg font-semibold whitespace-nowrap">B-304 · C2</p>
              <Badge variant={f.tom}>
                {i > 1 ? <CheckCircle2Icon /> : <PackageIcon />}
                {f.selo} {f.hora}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2">
        {FASES.map((f, i) => (
          <span key={f.id} className="relative h-1.5 w-8 rounded-full" style={VIDRO_NAO}>
            <span data-fase={i} className="pz-luz absolute inset-0 rounded-full bg-primary-foreground" style={{ animationDelay: ATRASO[i] }} />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- B · linha do tempo que se completa ---------- */

export function CicloLinha() {
  return (
    <div aria-hidden className="w-full max-w-md rounded-2xl bg-card p-5 text-card-foreground shadow-wc-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-lg font-semibold">B-304 · C2</p>
        <span className="text-sm text-muted-foreground">Mercado Livre</span>
      </div>
      <ol className="relative grid gap-3">
        <span className="absolute top-3 bottom-3 left-[15px] w-0.5 bg-border" />
        {FASES.map((f, i) => (
          <li key={f.id} className={`pz-lin${i} relative flex items-center gap-3`}>
            <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <CheckIcon className="size-4" />
            </span>
            <span className="flex-1 font-semibold">{f.titulo}</span>
            <span className="font-mono text-sm text-muted-foreground">{f.hora}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ---------- C · o pacote viaja pelas estações ---------- */

// Mesmas cores e textos de estado da fila (EstadoBadge do painel): cor + ícone + texto.
const ESTADO_C = [
  { selo: "Recebida", linha: "Foto da etiqueta salva", hora: "11:42", variant: "soft" as const, luz: "bg-accent text-accent-foreground", Icone: PackageIcon },
  { selo: "Aguardando aviso", linha: "Unidade e morador conferidos", hora: "11:42", variant: "warning" as const, luz: "bg-warning-soft text-warning", Icone: ClockIcon },
  { selo: "Pronta p/ retirada", linha: "Mariana avisada no WhatsApp", hora: "11:43", variant: "success" as const, luz: "bg-success-soft text-success", Icone: CheckCircle2Icon },
  { selo: "Retirada", linha: "Assinou na portaria", hora: "18:05", variant: "secondary" as const, luz: "bg-secondary text-secondary-foreground", Icone: CheckCheckIcon },
]

export function CicloEstacoes() {
  return (
    <div aria-hidden className="grid w-full max-w-md gap-5" style={{ ["--pz-passo" as string]: "100%" }}>
      <div className="relative h-[92px] overflow-hidden rounded-2xl bg-card text-card-foreground shadow-wc-lg">
        {ESTADO_C.map((e, i) => (
          <div key={e.selo} data-fase={i} className="pz-fase absolute inset-0 grid content-center gap-2 px-4" style={{ animationDelay: ATRASO[i] }}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-lg font-semibold whitespace-nowrap">B-304 · C2</p>
              <Badge variant={e.variant}>
                <e.Icone />
                {e.selo}
              </Badge>
            </div>
            <p className="flex justify-between gap-3 text-sm text-muted-foreground">
              <span className="truncate">{e.linha}</span>
              <span className="font-mono">{e.hora}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="relative h-12">
        <div className="pz-viagem absolute top-0 left-0 flex h-12 w-1/4 items-center justify-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-card text-brand shadow-wc-lg">
            <PackageIcon className="size-6" />
          </span>
        </div>
      </div>
      <div className="relative mx-[12.5%] -mt-2 h-0.5 rounded-full" style={VIDRO_NAO}>
        <span className="pz-trilha absolute inset-0 rounded-full bg-primary-foreground" />
      </div>
      <div className="grid grid-cols-4">
        {FASES.map((f, i) => (
          <div key={f.id} className="grid justify-items-center gap-2 text-center">
            <span className="relative grid size-11 place-items-center rounded-full border" style={BORDA}>
              <f.Icone className="size-5" />
              <span data-fase={i} className={`pz-luz absolute inset-0 grid place-items-center rounded-full ${ESTADO_C[i].luz}`} style={{ animationDelay: ATRASO[i] }}>
                <f.Icone className="size-5" />
              </span>
            </span>
            <span className="text-sm font-semibold">{f.titulo}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const CICLOS = [
  { id: "a", nome: "A · O cartão muda", nota: "O mesmo cartão troca de estado a cada 2,5 s. Uma linha de leitura passa na conferência.", Comp: CicloCartao },
  { id: "b", nome: "B · Linha do tempo", nota: "Cada etapa entra com o horário até a retirada. Mostra a cadeia de custódia.", Comp: CicloLinha },
  { id: "c", nome: "C · Estações (escolhida)", nota: "O pacote anda da portaria até o morador. O cartão mostra o estado com a mesma cor e texto da fila.", Comp: CicloEstacoes },
]
