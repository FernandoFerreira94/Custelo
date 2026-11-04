"use client"

import * as React from "react"
import { PzMarca } from "../pz-marca/marca"
import {
  AlertTriangleIcon,
  BarChart3Icon,
  BellIcon,
  Building2Icon,
  CameraIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleHelpIcon,
  ClockIcon,
  CornerUpLeftIcon,
  DownloadIcon,
  HomeIcon,
  ListIcon,
  MailIcon,
  MessageCircleIcon,
  MonitorSmartphoneIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  QrCodeIcon,
  UserPlusIcon,
  XIcon,
  ScanLineIcon,
  SendIcon,
  SettingsIcon,
  TimerIcon,
  UsersIcon,
  WifiIcon,
  WifiOffIcon,
} from "lucide-react"

import { PhoneFrame } from "@/components/demos/phone-frame"
import { ActivityRing } from "@/registry/webcode/ui/activity-ring"
import { Avatar, AvatarFallback } from "@/registry/webcode/ui/avatar"
import { Badge } from "@/registry/webcode/ui/badge"
import { BarChart } from "@/registry/webcode/ui/bar-chart"
import { BottomBar } from "@/registry/webcode/ui/bottom-bar"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/webcode/ui/sheet"
import { DonutChart } from "@/registry/webcode/ui/donut-chart"
import { FilterCounters } from "@/registry/webcode/ui/filter-counters"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { Kbd } from "@/registry/webcode/ui/kbd"
import { LineChart } from "@/registry/webcode/ui/line-chart"
import { SearchBar } from "@/registry/webcode/ui/search-bar"
import { SegmentedBar } from "@/registry/webcode/ui/segmented-bar"
import { StatCard } from "@/registry/webcode/ui/stat-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/webcode/ui/table"
import { Timeline, TimelineDescription, TimelineItem, TimelineTime, TimelineTitle } from "@/registry/webcode/ui/timeline"
import { UsageMeter } from "@/registry/webcode/ui/usage-meter"
import { WeekStrip } from "@/registry/webcode/ui/week-strip"
import { TabBar, TabBarAction, TabBarItem } from "@/registry/webcode/ui/tab-bar"
import { Progress } from "@/registry/webcode/ui/progress"

// Painel PacoteZap no estilo da referência (bento, cartões brancos, trilho de ícones, botões em pílula).
// Só componentes da WebCode UI, tema custelo, sem vidro (LOCK). Nomes e números são exemplos.

type Estado = "recebida" | "aguardando" | "naoIdent" | "falha" | "urgente" | "pronta" | "retirada" | "devolvida" | "offline"

const ESTADOS: Record<Estado, { label: string; variant: React.ComponentProps<typeof Badge>["variant"]; icon: React.ReactNode }> = {
  recebida: { label: "Recebida", variant: "soft", icon: <PackageIcon aria-hidden /> },
  aguardando: { label: "Aguardando aviso", variant: "warning", icon: <ClockIcon aria-hidden /> },
  naoIdent: { label: "Não identificada", variant: "outline", icon: <CircleHelpIcon aria-hidden /> },
  falha: { label: "Falha no aviso", variant: "danger", icon: <AlertTriangleIcon aria-hidden /> },
  urgente: { label: "Prazo estourado", variant: "danger", icon: <TimerIcon aria-hidden /> },
  pronta: { label: "Pronta p/ retirada", variant: "success", icon: <CheckCircle2Icon aria-hidden /> },
  retirada: { label: "Retirada", variant: "secondary", icon: <CheckCheckIcon aria-hidden /> },
  devolvida: { label: "Devolvida", variant: "secondary", icon: <CornerUpLeftIcon aria-hidden /> },
  offline: { label: "Não sincronizada", variant: "outline", icon: <WifiOffIcon aria-hidden /> },
}

function EstadoBadge({ estado }: { estado: Estado }) {
  const e = ESTADOS[estado]
  return (
    <Badge variant={e.variant}>
      {e.icon}
      {e.label}
    </Badge>
  )
}

/* ---------------- dados de exemplo ---------------- */

const RECEBIDAS = [
  { dia: "24/10", n: 28 },
  { dia: "25/10", n: 19 },
  { dia: "26/10", n: 12 },
  { dia: "27/10", n: 34 },
  { dia: "28/10", n: 31 },
  { dia: "29/10", n: 38 },
  { dia: "30/10", n: 52 },
  { dia: "31/10", n: 36 },
  { dia: "01/11", n: 22 },
  { dia: "02/11", n: 32 },
]

const SEMANA = [
  { dia: "Qua", recebidas: 38, retiradas: 30 },
  { dia: "Qui", recebidas: 52, retiradas: 41 },
  { dia: "Sex", recebidas: 36, retiradas: 44 },
  { dia: "Sáb", recebidas: 22, retiradas: 27 },
  { dia: "Dom", recebidas: 9, retiradas: 15 },
  { dia: "Seg", recebidas: 32, retiradas: 29 },
  { dia: "Ter", recebidas: 27, retiradas: 18 },
]

const ORIGEM = [
  { label: "Mercado Livre", value: 128 },
  { label: "Correios", value: 70 },
  { label: "Amazon", value: 55 },
  { label: "Shopee", value: 34 },
  { label: "Outros", value: 18 },
]

const PRATELEIRAS = [
  { id: "A1", nome: "Prateleira A1", ocupado: 11, total: 24 },
  { id: "B2", nome: "Prateleira B2", ocupado: 9, total: 24 },
  { id: "C2", nome: "Prateleira C2", ocupado: 21, total: 24 },
  { id: "VG", nome: "Volume grande", ocupado: 5, total: 8 },
]

const MOVIMENTOS: { hora: string; unidade: string; quem: string; evento: string; estado: Estado }[] = [
  { hora: "13:42", unidade: "B-304", quem: "Mariana Souza", evento: "Retirada com assinatura", estado: "retirada" },
  { hora: "13:10", unidade: "A-112", quem: "João Pereira", evento: "WhatsApp não entregue", estado: "falha" },
  { hora: "12:55", unidade: "C-021", quem: "Ana Lima", evento: "9 dias na portaria", estado: "urgente" },
  { hora: "12:31", unidade: "D-410", quem: "Lucas Martins", evento: "Recebida por Carlos", estado: "aguardando" },
  { hora: "11:58", unidade: "—", quem: "Etiqueta ilegível", evento: "Foto salva, sem unidade", estado: "naoIdent" },
]

const FILA: { unidade: string; quem: string; detalhe: string; estado: Estado }[] = [
  { unidade: "B-304", quem: "Mariana Souza", detalhe: "C2 · 2 volumes · há 2 h", estado: "pronta" },
  { unidade: "A-112", quem: "João Pereira", detalhe: "A1 · há 5 h", estado: "falha" },
  { unidade: "C-021", quem: "Ana Lima", detalhe: "Volume grande · há 9 dias", estado: "urgente" },
  { unidade: "D-410", quem: "Lucas Martins", detalhe: "B2 · há 20 min", estado: "aguardando" },
  { unidade: "—", quem: "Etiqueta ilegível", detalhe: "A1 · há 1 dia", estado: "naoIdent" },
]

/* ---------------- peças comuns ---------------- */

function Ocupacao({ p }: { p: (typeof PRATELEIRAS)[number] }) {
  const pct = Math.round((p.ocupado / p.total) * 100)
  const cheia = pct >= 80
  return (
    <div className="grid gap-1.5">
      <span className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground tabular-nums">
        {cheia && <AlertTriangleIcon aria-hidden className="size-3.5 text-warning" />}
        {p.ocupado} de {p.total}
        {cheia && <span className="text-warning">· quase cheia</span>}
      </span>
      <Progress value={pct} tone={cheia ? "warning" : "default"} aria-label={`${p.nome}: ${p.ocupado} de ${p.total} lugares ocupados`} />
    </div>
  )
}

function Logo({ nome = false }: { nome?: boolean }) {
  return <PzMarca nome={nome} simbolo="size-11" />
}

const NAV = [
  { label: "Hoje", icon: <HomeIcon aria-hidden /> },
  { label: "Encomendas", icon: <PackageIcon aria-hidden /> },
  { label: "Avisos", icon: <BellIcon aria-hidden /> },
  { label: "Unidades e pessoas", icon: <Building2Icon aria-hidden /> },
  { label: "Relatórios", icon: <BarChart3Icon aria-hidden /> },
]

// Sidebar padrão das pranchas (04/11): só ícones no meio, engrenagem no pé.
// Selecionado em Brasa sólido (ícone branco); os demais em branco (outline) com o hover da biblioteca.
type ItemNav = { label: string; icon: React.ReactNode }

function Trilho({ ativo = "Hoje", itens = NAV, label = "Menu principal" }: { ativo?: string; itens?: ItemNav[]; label?: string }) {
  return (
    <nav aria-label={label} className="sticky top-6 flex h-[calc(100dvh-3rem)] max-h-full flex-col items-center justify-between gap-3 self-stretch">
      <Logo />
      <div className="flex flex-col gap-3">
        {itens.map((n) => {
          const sel = n.label === ativo
          return (
            <Button
              key={n.label}
              variant={sel ? "default" : "outline"}
              shape="pill"
              size="icon-lg"
              aria-label={n.label}
              aria-current={sel ? "page" : undefined}
              title={n.label}
              className={sel ? "bg-[var(--pz-brasa)] text-[var(--pz-brasa-fg)] hover:bg-[var(--pz-brasa-hover)]" : undefined}
            >
              {n.icon}
            </Button>
          )
        })}
      </div>
      <Button
        variant={ativo === "Configurações" ? "default" : "outline"}
        shape="pill"
        size="icon-lg"
        aria-label="Configurações"
        title="Configurações"
        aria-current={ativo === "Configurações" ? "page" : undefined}
        className={ativo === "Configurações" ? "bg-[var(--pz-brasa)] text-[var(--pz-brasa-fg)] hover:bg-[var(--pz-brasa-hover)]" : undefined}
      >
        <SettingsIcon aria-hidden />
      </Button>
    </nav>
  )
}

function Perfil() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" shape="pill">
        <Building2Icon aria-hidden />
        Residencial Vila Verde
        <ChevronDownIcon aria-hidden />
      </Button>
      <Button variant="outline" shape="pill" size="icon" aria-label="Notificações, 2 novas">
        <BellIcon aria-hidden />
      </Button>
      <Avatar size="lg">
        <AvatarFallback>MA</AvatarFallback>
      </Avatar>
    </div>
  )
}

function Busca({ placeholder = "Buscar unidade, morador ou código" }: { placeholder?: string }) {
  return (
    <div className="relative w-full max-w-md">
      <SearchBar placeholder={placeholder} aria-label="Buscar" cancel="never" inputClassName="rounded-full border bg-card shadow-wc-xs" />
      <Kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">⌘K</Kbd>
    </div>
  )
}

/** Pilha de etiquetas: o "cofre" do PacoteZap (como a carteira da referência). */
function CardCustodia({ compacto = false }: { compacto?: boolean }) {
  return (
    <Card className="gap-0 overflow-hidden rounded-3xl py-0 shadow-wc-md">
      <div aria-hidden className="relative h-36 bg-muted px-6 pt-5">
        <div className="absolute inset-x-12 top-3 h-16 rounded-2xl border bg-secondary" />
        <div className="absolute inset-x-9 top-6 h-16 rounded-2xl border bg-accent" />
        <div className="absolute inset-x-6 top-9 grid h-20 content-center gap-1 rounded-2xl border bg-card px-4 shadow-wc-xs">
          <span className="font-mono text-sm font-semibold">B-304 · C2</span>
          <span className="text-xs text-muted-foreground">Mariana Souza · Mercado Livre</span>
        </div>
      </div>
      <div className="relative grid gap-1 px-6 pt-5 pb-6">
        <Button shape="pill" size="icon-lg" aria-label="Registrar encomenda" className="absolute -top-6 right-6">
          <PlusIcon aria-hidden />
        </Button>
        <Badge variant="outline" className="w-fit">4 prateleiras</Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          Em custódia agora <span className="font-medium text-success">+4 desde ontem</span>
        </p>
        <p className="flex items-baseline gap-2 tabular-nums">
          <span className={`font-semibold ${compacto ? "text-4xl" : "text-5xl"}`}>23</span>
          <span className="text-lg text-muted-foreground">encomendas</span>
        </p>
      </div>
    </Card>
  )
}

const ACOES = [
  { label: "Registrar", icon: <CameraIcon aria-hidden /> },
  { label: "Entregar", icon: <PackageCheckIcon aria-hidden /> },
  { label: "Reenviar aviso", icon: <SendIcon aria-hidden /> },
  { label: "Devolução", icon: <CornerUpLeftIcon aria-hidden /> },
  { label: "Mais", icon: <MoreHorizontalIcon aria-hidden /> },
]

function AcoesRapidas({ itens = ACOES }: { itens?: typeof ACOES }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {itens.map((a) => (
        <Button key={a.label} variant="outline" className="h-auto flex-col gap-2 rounded-2xl py-4 text-xs whitespace-normal">
          <span className="grid size-9 place-items-center rounded-full bg-accent text-brand">{a.icon}</span>
          {a.label}
        </Button>
      ))}
    </div>
  )
}

// Ações da área (03/11): sai do bento e vira aba vertical no meio da borda direita.
// Ao abrir, o cartão desliza da direita para a esquerda com as ações em quadrados, duas colunas.
const ACOES_PAINEL = [
  { label: "Registrar encomenda", icon: <CameraIcon aria-hidden /> },
  { label: "Entregar", icon: <PackageCheckIcon aria-hidden /> },
  { label: "Ler QR", icon: <QrCodeIcon aria-hidden /> },
  { label: "Reenviar aviso", icon: <SendIcon aria-hidden /> },
  { label: "Devolução", icon: <CornerUpLeftIcon aria-hidden /> },
  { label: "Nova pessoa", icon: <UserPlusIcon aria-hidden /> },
]

// Ações (04/11, aprovado na SAAS-001): meia-aba navy presa no canto direito, metade escondida,
// arredondada dos dois lados. Abre um sheet do tamanho das opções. O pai precisa de `relative overflow-hidden`.
function AcoesAba({ itens = ACOES_PAINEL }: { itens?: ItemNav[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg" shape="pill" aria-label="Ações" title="Ações" className="absolute top-1/2 right-0 z-10 h-32 w-14 translate-x-1/2 -translate-y-1/2 p-0 text-sm">
          <span className="absolute inset-y-0 left-0 grid w-7 place-items-center">
            <span className="rotate-180 [writing-mode:vertical-rl]">Ações</span>
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" size="sm" inset className="inset-y-0 my-auto h-fit max-h-[calc(100dvh-1.5rem)] w-[320px]">
        <SheetHeader>
          <SheetTitle>Ações</SheetTitle>
        </SheetHeader>
        <SheetBody className="grid grid-cols-2 content-start gap-3">
          {itens.map((a) => (
            <Button key={a.label} variant="outline" className="aspect-square h-auto flex-col gap-2 rounded-2xl p-3 text-sm whitespace-normal">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--pz-brasa-soft)] text-[var(--pz-brasa)] [&_svg]:size-5">{a.icon}</span>
              {a.label}
            </Button>
          ))}
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}

function Movimentos({ linhas = MOVIMENTOS }: { linhas?: typeof MOVIMENTOS }) {
  return (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>Hora</TableHead>
          <TableHead>Unidade</TableHead>
          <TableHead>Destinatário</TableHead>
          <TableHead>Evento</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {linhas.map((m) => (
          <TableRow key={m.hora}>
            <TableCell className="tabular-nums text-muted-foreground">{m.hora}</TableCell>
            <TableCell className="font-mono font-semibold">{m.unidade}</TableCell>
            <TableCell>{m.quem}</TableCell>
            <TableCell className="text-muted-foreground">{m.evento}</TableCell>
            <TableCell>
              <EstadoBadge estado={m.estado} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function Moldura({ id, titulo, nota, children }: { id: string; titulo: string; nota: string; children: React.ReactNode }) {
  return (
    <figure className="m-0 grid min-w-0 gap-3">
      <figcaption className="grid gap-0.5">
        <span className="text-sm font-semibold">
          <span className="font-mono">{id}</span> · {titulo}
        </span>
        <span className="text-sm text-muted-foreground">{nota}</span>
      </figcaption>
      <div className="relative overflow-x-auto rounded-[2rem] border bg-card p-2 shadow-wc">
        <div className="w-[1280px] rounded-[1.6rem] bg-muted p-6">{children}</div>
      </div>
    </figure>
  )
}

/* ---------------- DASHBOARD A · bento fiel à referência ---------------- */

function DashA() {
  return (
    <div className="relative -m-6 overflow-hidden rounded-[1.6rem] p-6">
    <AcoesAba />
    <div className="grid grid-cols-[56px_1fr] gap-6">
      <Trilho />
      <div className="grid gap-6">
        <header className="flex items-center justify-between gap-4">
          <Busca />
          <Perfil />
        </header>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-bold">Hoje</h2>
            <p className="text-muted-foreground">Encomendas, prateleiras e avisos do Vila Verde · terça, 3 de novembro</p>
          </div>
          <div className="flex gap-2">
            <Button variant="elevated" shape="pill" size="lg">
              <PlusIcon aria-hidden />
              Registrar encomenda
            </Button>
            <Button variant="outline" shape="pill" size="lg">
              <DownloadIcon aria-hidden />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-[300px_1fr_340px] gap-5">
          <CardCustodia />
          <Card className="rounded-3xl shadow-wc-md">
            <CardHeader>
              <CardTitle className="text-lg">Recebidas por dia</CardTitle>
              <CardDescription className="flex gap-6 tabular-nums">
                <span>
                  10 dias <strong className="text-foreground">304</strong>
                </span>
                <span>
                  Retiradas <strong className="text-foreground">281</strong>
                </span>
                <span>
                  Média/dia <strong className="text-foreground">30</strong>
                </span>
              </CardDescription>
              <CardAction>
                <Button variant="outline" shape="pill" size="sm">
                  10 dias
                  <ChevronDownIcon aria-hidden />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <BarChart data={RECEBIDAS} index="dia" series={[{ key: "n", label: "Recebidas" }]} highlight="30/10" height={190} maxBarSize={40} tableToggle={false} />
            </CardContent>
          </Card>
          <Card className="rounded-3xl shadow-wc-md">
            <CardHeader>
              <CardTitle className="text-lg">Avisos por canal</CardTitle>
              <CardAction>
                <Button variant="outline" shape="pill" size="sm">
                  <PlusIcon aria-hidden />
                  Canal
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                {[
                  { nome: "WhatsApp", n: "142 entregues", extra: <Badge variant="danger"><AlertTriangleIcon aria-hidden />2 falhas</Badge>, icon: <MessageCircleIcon aria-hidden /> },
                  { nome: "E-mail", n: "38 entregues", icon: <MailIcon aria-hidden /> },
                  { nome: "Painel do morador", n: "61 lidos", icon: <MonitorSmartphoneIcon aria-hidden /> },
                ].map((c) => (
                  <Item key={c.nome} variant="outline" size="sm" className="rounded-xl">
                    <ItemMedia variant="icon" className="rounded-full">{c.icon}</ItemMedia>
                    <ItemContent>
                      <ItemTitle>{c.nome}</ItemTitle>
                      <ItemDescription className="tabular-nums">{c.n}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      {c.extra}
                      <Button variant="ghost" size="icon-sm" aria-label={`Opções de ${c.nome}`}>
                        <MoreHorizontalIcon aria-hidden />
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-[1fr_420px] items-start gap-5">
          <div className="grid gap-5">
            <Card className="rounded-3xl shadow-wc-md">
              <CardHeader>
                <CardTitle className="text-lg">Prateleiras</CardTitle>
                <CardAction>
                  <Button variant="outline" shape="pill" size="sm">Ver todas</Button>
                </CardAction>
              </CardHeader>
              <CardContent className="grid grid-cols-5 gap-3">
                {PRATELEIRAS.map((p) => (
                  <div key={p.id} className="grid gap-3 rounded-2xl border bg-muted p-4">
                    <span className="font-mono text-2xl font-bold">{p.id}</span>
                    <Ocupacao p={p} />
                  </div>
                ))}
                <Button variant="ghost" className="h-auto flex-col gap-2 rounded-2xl border border-dashed text-muted-foreground">
                  <span className="grid size-9 place-items-center rounded-full bg-accent text-brand">
                    <PlusIcon aria-hidden />
                  </span>
                  Nova prateleira
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-wc-md">
              <CardHeader>
                <CardTitle className="text-lg">Últimas movimentações</CardTitle>
                <CardAction>
                  <Button variant="outline" shape="pill" size="sm">Ver todas</Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Movimentos />
              </CardContent>
            </Card>
          </div>
          <div className="grid content-start gap-5">
            <Card className="rounded-3xl shadow-wc-md">
              <CardHeader>
                <CardTitle className="text-lg">Origem das encomendas</CardTitle>
                <CardAction>
                  <Button variant="outline" shape="pill" size="sm">
                    Este mês
                    <ChevronDownIcon aria-hidden />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <BarChart data={ORIGEM} index="label" series={[{ key: "value", label: "Encomendas" }]} orientation="horizontal" height={220} grid={false} tableToggle={false} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

/* ---------------- DASHBOARD B · comando (faixa da marca + o que precisa de você) ---------------- */

function PrecisaDeVoce() {
  const itens: { titulo: string; desc: string; estado: Estado; acao: string }[] = [
    { titulo: "A-112 · João Pereira", desc: "WhatsApp não entregue há 5 h", estado: "falha", acao: "Reenviar" },
    { titulo: "C-021 · Ana Lima", desc: "9 dias na portaria, prazo de 7", estado: "urgente", acao: "Devolver" },
    { titulo: "Etiqueta ilegível", desc: "Foto salva em A1, sem unidade", estado: "naoIdent", acao: "Identificar" },
  ]
  return (
    <ItemGroup className="gap-2">
      {itens.map((i) => (
        <Item key={i.titulo} variant="outline" size="sm" className="rounded-xl">
          <ItemContent className="gap-1.5">
            <ItemTitle>{i.titulo}</ItemTitle>
            <ItemDescription>{i.desc}</ItemDescription>
            <EstadoBadge estado={i.estado} />
          </ItemContent>
          <ItemActions>
            <Button variant="outline" shape="pill" size="sm">{i.acao}</Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}

const SEGMENTOS = [
  { label: "Prontas p/ retirada", value: 14, color: "var(--color-success)" },
  { label: "Aguardando aviso", value: 3, color: "var(--color-warning)" },
  { label: "Falha no aviso", value: 2, color: "var(--color-danger)" },
  { label: "Prazo estourado", value: 3, color: 4 as const },
  { label: "Não identificada", value: 1, color: 5 as const },
]

function DashB() {
  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo nome />
          <nav aria-label="Menu principal" className="flex gap-1 rounded-full border bg-card p-1">
            {NAV.map((n) => (
              <Button key={n.label} variant={n.label === "Hoje" ? "default" : "ghost"} shape="pill" size="sm" aria-current={n.label === "Hoje" ? "page" : undefined}>
                {n.label}
              </Button>
            ))}
          </nav>
        </div>
        <Perfil />
      </header>

      <section className="grid grid-cols-[1fr_auto] items-end gap-6 rounded-3xl bg-primary p-8 text-primary-foreground shadow-wc-md">
        <div className="grid gap-6">
          <div>
            <p className="opacity-80">Residencial Vila Verde · terça, 3 de novembro</p>
            <h2 className="font-display text-4xl font-bold">Boa tarde, Marina.</h2>
          </div>
          <dl className="grid grid-cols-4 gap-8">
            {[
              { n: "23", l: "em custódia" },
              { n: "14", l: "prontas para retirada" },
              { n: "18", l: "retiradas hoje" },
              { n: "5", l: "precisam de você" },
            ].map((s) => (
              <div key={s.l} className="grid gap-1 border-l border-primary-foreground/25 pl-4">
                <dt className="order-2 text-sm opacity-80">{s.l}</dt>
                <dd className="order-1 text-4xl font-semibold tabular-nums">{s.n}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" shape="pill" size="lg">
            <PlusIcon aria-hidden />
            Registrar encomenda
          </Button>
          <Button variant="outline" shape="pill" size="lg" className="text-foreground">
            <DownloadIcon aria-hidden />
            Exportar
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-[1fr_400px] items-start gap-5">
        <div className="grid gap-5">
          <Card className="rounded-3xl shadow-wc-md">
            <CardHeader>
              <CardTitle className="text-lg">Estado da custódia</CardTitle>
              <CardDescription>As 23 encomendas que estão na portaria agora</CardDescription>
            </CardHeader>
            <CardContent>
              <SegmentedBar segments={SEGMENTOS} label="Estado das encomendas em custódia" size="lg" showValue />
            </CardContent>
          </Card>
          <Card className="rounded-3xl shadow-wc-md">
            <CardHeader>
              <CardTitle className="text-lg">Fluxo da semana</CardTitle>
              <CardDescription>Recebidas e retiradas por dia</CardDescription>
              <CardAction>
                <Button variant="outline" shape="pill" size="sm">
                  7 dias
                  <ChevronDownIcon aria-hidden />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <LineChart
                data={SEMANA}
                index="dia"
                series={[
                  { key: "recebidas", label: "Recebidas" },
                  { key: "retiradas", label: "Retiradas" },
                ]}
                type="area"
                curve="smooth"
                showLastValue
                tableToggle={false}
                height={220}
              />
            </CardContent>
          </Card>
        </div>
        <div className="grid content-start gap-5">
          <Card className="rounded-3xl shadow-wc-md">
            <CardHeader>
              <CardTitle className="text-lg">Precisa de você</CardTitle>
              <CardDescription>5 itens · 3 mais antigos</CardDescription>
              <CardAction>
                <Button variant="outline" shape="pill" size="sm">Ver todos</Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <PrecisaDeVoce />
            </CardContent>
          </Card>
          <Card className="rounded-3xl shadow-wc-md">
            <CardHeader>
              <CardTitle className="text-lg">Agora na portaria</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline>
                <TimelineItem status="done">
                  <TimelineTitle>B-304 retirada por Mariana Souza</TimelineTitle>
                  <TimelineTime>13:42</TimelineTime>
                </TimelineItem>
                <TimelineItem status="error">
                  <TimelineTitle>Aviso para A-112 falhou</TimelineTitle>
                  <TimelineDescription>WhatsApp fora do ar. Tentando de novo em 10 min.</TimelineDescription>
                  <TimelineTime>13:10</TimelineTime>
                </TimelineItem>
                <TimelineItem status="done">
                  <TimelineTitle>Carlos registrou 7 encomendas</TimelineTitle>
                  <TimelineTime>12:31</TimelineTime>
                </TimelineItem>
              </Timeline>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ---------------- DASHBOARD C · operação (lista + detalhe) ---------------- */

function DashC() {
  return (
    <div className="grid grid-cols-[220px_1fr_380px] gap-5">
      <aside className="grid content-start gap-6 rounded-3xl border bg-card p-4 shadow-wc-xs">
        <Logo nome />
        <nav aria-label="Menu principal" className="grid gap-1">
          {NAV.map((n) => (
            <Button
              key={n.label}
              variant={n.label === "Encomendas" ? "secondary" : "ghost"}
              shape="pill"
              className="justify-start"
              aria-current={n.label === "Encomendas" ? "page" : undefined}
            >
              {n.icon}
              {n.label}
            </Button>
          ))}
          <Button variant="ghost" shape="pill" className="justify-start">
            <UsersIcon aria-hidden />
            Equipe
          </Button>
        </nav>
        <div className="min-w-0 rounded-2xl border bg-muted p-3">
          <UsageMeter label="Mensagens" value={812} max={1000} hint="Plano Prédio · renova dia 10" />
        </div>
      </aside>

      <div className="grid content-start gap-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">Encomendas</h2>
            <p className="text-sm text-muted-foreground">Vila Verde · 23 em custódia</p>
          </div>
          <Button variant="elevated" shape="pill" size="lg">
            <PlusIcon aria-hidden />
            Registrar
          </Button>
        </header>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Prontas p/ retirada" value="14" />
          <StatCard label="Retiradas hoje" value="18" delta={12} period="vs. ontem" />
          <StatCard label="Tempo médio" value="1,4 dia" delta={-8} goodWhen="down" period="vs. outubro" />
        </div>
        <Card className="gap-4 rounded-3xl shadow-wc-md">
          <CardContent className="grid gap-4">
            <Busca placeholder="Unidade, morador ou código" />
            <FilterCounters
              defaultValue="todas"
              items={[
                { value: "todas", label: "Todas", count: 23 },
                { value: "prontas", label: "Prontas", count: 14, tone: "success" },
                { value: "falha", label: "Falha no aviso", count: 2, tone: "danger" },
                { value: "prazo", label: "Prazo estourado", count: 3, tone: "warning" },
              ]}
            />
            <ItemGroup className="gap-2">
              {FILA.map((f, i) => (
                <Item key={f.quem} variant={i === 0 ? "muted" : "outline"} size="sm" className={`rounded-xl ${i === 0 ? "ring-2 ring-ring" : ""}`}>
                  <ItemMedia variant="icon" className="rounded-full">
                    <PackageIcon aria-hidden />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <span className="font-mono">{f.unidade}</span> · {f.quem}
                    </ItemTitle>
                    <ItemDescription>{f.detalhe}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <EstadoBadge estado={f.estado} />
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>

      <aside className="grid content-start gap-5">
        <div className="flex justify-end">
          <Perfil />
        </div>
        <Card className="rounded-3xl shadow-wc-md">
          <CardHeader>
            <CardDescription>Encomenda selecionada</CardDescription>
            <CardTitle className="font-mono text-4xl">B-304</CardTitle>
            <CardAction>
              <EstadoBadge estado="pronta" />
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ["Destinatário", "Mariana Souza"],
                ["Prateleira", "C2 · 2 volumes"],
                ["Recebida", "11:42 por Carlos"],
                ["Aviso", "WhatsApp, entregue"],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-0.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <Timeline>
              <TimelineItem status="done">
                <TimelineTitle>Recebida na portaria</TimelineTitle>
                <TimelineTime>11:42</TimelineTime>
              </TimelineItem>
              <TimelineItem status="done">
                <TimelineTitle>Unidade confirmada pelo porteiro</TimelineTitle>
                <TimelineDescription>Sugestão da etiqueta aceita</TimelineDescription>
                <TimelineTime>11:42</TimelineTime>
              </TimelineItem>
              <TimelineItem status="done">
                <TimelineTitle>Aviso entregue no WhatsApp</TimelineTitle>
                <TimelineTime>11:43</TimelineTime>
              </TimelineItem>
              <TimelineItem status="current">
                <TimelineTitle>Aguardando retirada</TimelineTitle>
                <TimelineDescription>Há 2 h</TimelineDescription>
              </TimelineItem>
            </Timeline>
            <div className="grid gap-2">
              <Button size="lg" shape="pill">
                <PackageCheckIcon aria-hidden />
                Registrar retirada
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" shape="pill">
                  <SendIcon aria-hidden />
                  Reenviar aviso
                </Button>
                <Button variant="outline" shape="pill">
                  <PencilIcon aria-hidden />
                  Corrigir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

/* ---------------- MOBILE ---------------- */

function NavMobile({ ativo = "Hoje" }: { ativo?: string }) {
  const itens = [
    { label: "Hoje", icon: <HomeIcon aria-hidden /> },
    { label: "Fila", icon: <PackageIcon aria-hidden /> },
    null,
    { label: "Avisos", icon: <BellIcon aria-hidden /> },
    { label: "Mais", icon: <MoreHorizontalIcon aria-hidden /> },
  ]
  return (
    <BottomBar position="static" className="grid grid-cols-5 items-center gap-1 px-3">
      {itens.map((i) =>
        i ? (
          <Button
            key={i.label}
            variant={i.label === ativo ? "secondary" : "ghost"}
            className={`h-auto flex-col gap-1 py-2 text-xs ${i.label === ativo ? "" : "text-muted-foreground"}`}
            aria-current={i.label === ativo ? "page" : undefined}
          >
            {i.icon}
            {i.label}
          </Button>
        ) : (
          <Button key="registrar" shape="pill" size="icon-lg" variant="elevated" aria-label="Registrar encomenda" className="mx-auto">
            <ScanLineIcon aria-hidden />
          </Button>
        ),
      )}
    </BottomBar>
  )
}

function Tela({ children, ativo }: { children: React.ReactNode; ativo?: string }) {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <NavMobile ativo={ativo} />
    </div>
  )
}

function CabecalhoMobile({ invertido = false }: { invertido?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="lg">
        <AvatarFallback>MA</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className={`text-xs ${invertido ? "opacity-80" : "text-muted-foreground"}`}>Residencial Vila Verde</p>
        <p className="font-semibold">Boa tarde, Marina</p>
      </div>
      <Button variant="outline" shape="pill" size="icon" aria-label="Notificações, 2 novas" className="text-foreground">
        <BellIcon aria-hidden />
      </Button>
    </div>
  )
}

function MobA() {
  return (
    <Tela>
      <div className="grid gap-4 px-4 pt-6 pb-6">
        <CabecalhoMobile />
        <SearchBar placeholder="Unidade, morador ou código" aria-label="Buscar" cancel="never" inputClassName="rounded-full border bg-card shadow-wc-xs" />
        <CardCustodia compacto />
        <div className="grid grid-cols-4 gap-2">
          {ACOES.slice(0, 4).map((a) => (
            <Button key={a.label} variant="ghost" className="h-auto flex-col gap-1.5 px-0 py-1 text-xs whitespace-normal">
              <span className="grid size-12 place-items-center rounded-full border bg-card text-brand shadow-wc-xs">{a.icon}</span>
              {a.label}
            </Button>
          ))}
        </div>
        <Card className="gap-3 rounded-3xl py-5 shadow-wc-md">
          <CardHeader className="px-5">
            <CardTitle>Recebidas por dia</CardTitle>
            <CardDescription>Média de 30 por dia</CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <BarChart data={RECEBIDAS.slice(3)} index="dia" series={[{ key: "n", label: "Recebidas" }]} highlight="30/10" height={140} grid={false} tableToggle={false} />
          </CardContent>
        </Card>
        <Card className="gap-3 rounded-3xl py-5 shadow-wc-md">
          <CardHeader className="px-5">
            <CardTitle>Últimas movimentações</CardTitle>
            <CardAction>
              <Button variant="outline" shape="pill" size="sm">Ver todas</Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-3">
            <ItemGroup>
              {MOVIMENTOS.slice(0, 3).map((m) => (
                <Item key={m.hora} size="sm">
                  <ItemContent className="gap-1">
                    <ItemTitle>
                      <span className="font-mono">{m.unidade}</span> · {m.quem}
                    </ItemTitle>
                    <EstadoBadge estado={m.estado} />
                  </ItemContent>
                  <ItemActions className="text-xs text-muted-foreground tabular-nums">{m.hora}</ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </Tela>
  )
}

function MobB() {
  return (
    <Tela ativo="Hoje">
      <section className="grid gap-6 rounded-b-[2rem] bg-primary px-4 pt-6 pb-8 text-primary-foreground">
        <CabecalhoMobile invertido />
        <div>
          <p className="opacity-80">Em custódia agora</p>
          <p className="text-5xl font-semibold tabular-nums">23</p>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          {[
            { n: "14", l: "prontas" },
            { n: "18", l: "retiradas hoje" },
            { n: "5", l: "pedem ação" },
          ].map((s) => (
            <div key={s.l} className="grid rounded-2xl border border-primary-foreground/25 px-3 py-2">
              <dt className="order-2 text-xs opacity-80">{s.l}</dt>
              <dd className="order-1 text-xl font-semibold tabular-nums">{s.n}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="grid gap-4 px-4 pt-5 pb-6">
        <Card className="gap-3 rounded-3xl py-5 shadow-wc-md">
          <CardContent className="px-5">
            <SegmentedBar segments={SEGMENTOS} label="Estado das encomendas em custódia" />
          </CardContent>
        </Card>
        <div className="grid gap-2">
          <h3 className="font-semibold">Prateleiras</h3>
          <div className="relative -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {PRATELEIRAS.map((p) => (
              <div key={p.id} className="grid w-40 shrink-0 gap-2 rounded-2xl border bg-card p-4 shadow-wc-xs">
                <span className="font-mono text-2xl font-bold">{p.id}</span>
                <Ocupacao p={p} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Precisa de você</h3>
            <Button variant="ghost" size="sm">Ver todos</Button>
          </div>
          <PrecisaDeVoce />
        </div>
      </div>
    </Tela>
  )
}

function NavVidro() {
  const [tab, setTab] = React.useState("receber")
  return (
    <TabBar aria-label="Navegação principal" className="absolute inset-x-0 bottom-3 px-3">
      {[
        { value: "receber", label: "Receber", icon: <CameraIcon /> },
        { value: "fila", label: "Fila", icon: <ListIcon /> },
        { value: "entregar", label: "Entregar", icon: <PackageCheckIcon /> },
        { value: "mais", label: "Mais", icon: <MoreHorizontalIcon /> },
      ].map((t) => (
        <TabBarItem key={t.value} label={t.label} icon={t.icon} active={tab === t.value} onClick={() => setTab(t.value)} />
      ))}
      <TabBarAction aria-label="Ler QR para localizar encomenda">
        <ScanLineIcon />
      </TabBarAction>
    </TabBar>
  )
}

function MobC() {
  return (
    <div className="relative h-full bg-muted">
      <div className="h-full overflow-y-auto">
      <div className="grid gap-4 px-4 pt-6 pb-28">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Portaria principal · Vila Verde</p>
            <h2 className="font-display text-3xl font-bold">Turno da tarde</h2>
          </div>
          <Badge variant="success">
            <WifiIcon aria-hidden />
            Online
          </Badge>
        </div>
        <Card className="gap-4 rounded-3xl bg-primary py-5 text-primary-foreground shadow-wc-md">
          <CardContent className="grid gap-4 px-5">
            <div className="flex items-center gap-3">
              <span aria-hidden className="grid size-12 place-items-center rounded-full bg-primary-foreground text-primary">
                <CameraIcon className="size-6" />
              </span>
              <div className="flex-1">
                <p className="text-lg font-semibold">Chegou encomenda?</p>
                <p className="text-sm opacity-80">Foto da etiqueta, confere e pronto.</p>
              </div>
              <Button variant="secondary" shape="pill" size="icon-lg" aria-label="Ler QR de uma encomenda">
                <QrCodeIcon aria-hidden />
              </Button>
            </div>
            <Button variant="secondary" shape="pill" size="lg">
              Registrar encomenda
            </Button>
          </CardContent>
        </Card>
        <Card className="gap-3 rounded-3xl py-5 shadow-wc-md">
          <CardHeader className="px-5">
            <CardTitle>Seu turno</CardTitle>
            <CardDescription>Desde 12:00</CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <ActivityRing
              size={130}
              label="Seu turno"
              rings={[
                { label: "Registradas", value: 32, goal: 40 },
                { label: "Avisadas", value: 30, goal: 32 },
                { label: "Entregues", value: 18, goal: 32 },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="gap-3 rounded-3xl py-5 shadow-wc-md">
          <CardContent className="grid gap-4 px-5">
            <WeekStrip defaultValue={new Date(2026, 10, 3)} variant="pill" label="Dia do histórico" />
            <Timeline>
              <TimelineItem status="done">
                <TimelineTitle>B-304 entregue a Mariana</TimelineTitle>
                <TimelineTime>13:42</TimelineTime>
              </TimelineItem>
              <TimelineItem status="error">
                <TimelineTitle>Aviso para A-112 falhou</TimelineTitle>
                <TimelineDescription>O gestor já foi avisado</TimelineDescription>
                <TimelineTime>13:10</TimelineTime>
              </TimelineItem>
              <TimelineItem status="done">
                <TimelineTitle>Lote de 7 registrado</TimelineTitle>
                <TimelineTime>12:31</TimelineTime>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </div>
      </div>
      <NavVidro />
    </div>
  )
}

function Celular({ id, titulo, nota, children }: { id: string; titulo: string; nota: string; children: React.ReactNode }) {
  return (
    <figure className="m-0 grid w-full max-w-[390px] shrink-0 content-start gap-3">
      <figcaption className="grid gap-0.5">
        <span className="text-sm font-semibold">
          <span className="font-mono">{id}</span> · {titulo}
        </span>
        <span className="text-sm text-muted-foreground">{nota}</span>
      </figcaption>
      <PhoneFrame label={`${id} ${titulo}`} className="h-[844px] max-w-[390px]">
        {children}
      </PhoneFrame>
    </figure>
  )
}

/* ---------------- página ---------------- */

type Paleta = { id: string; nome: string; nota: string; modo: "light" | "dark"; cores: [string, string][]; vars: Record<string, string> }

function vars(v: Record<string, string>) {
  const bg = v["--wc-bg"]
  return {
    ...v,
    "--wc-glass-bg": `${bg}db`,
    "--wc-glass-bg-thin": `${bg}80`,
    "--wc-glass-bg-thick": `${bg}eb`,
    "--wc-glass-border": v["--wc-border"],
    // Ajustes de 03/11: títulos em Plus Jakarta Sans e hover cinza-claro (no lugar do azul).
    "--wc-font-display": '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
    "--accent": v["--wc-accent-soft-hover"] ?? "#F1F3F6",
    "--accent-foreground": v["--wc-fg"],
  } as React.CSSProperties
}

const CHART_CLARO = { "--wc-chart-1": "#0C2C55", "--wc-chart-2": "#629FAD", "--wc-chart-3": "#2E8A6A", "--wc-chart-4": "#C2702E", "--wc-chart-5": "#A7577F" }

// Três propostas (03/11/2026) a partir de Midnight Navy #0C2C55 + Ocean Breeze #629FAD, trocando o fundo.
const PALETAS: Paleta[] = [
  {
    id: "P1",
    nome: "Névoa",
    nota: "Cinza-azulado frio e cartões brancos, como na referência. Navy na ação, Ocean nos destaques.",
    modo: "light",
    cores: [["Fundo", "#EEF1F5"], ["Cartão", "#FFFFFF"], ["Midnight Navy", "#0C2C55"], ["Ocean Breeze", "#629FAD"], ["Texto suave", "#4A5B74"]],
    vars: {
      "--wc-bg": "#EEF1F5", "--wc-sunken": "#E4E8EE", "--wc-surface": "#FFFFFF", "--wc-surface-raised": "#FFFFFF",
      "--wc-fg": "#0C2C55", "--wc-fg-muted": "#4A5B74", "--wc-fg-subtle": "#6B7A90",
      "--wc-border": "#DDE3EA", "--wc-border-strong": "#C6CFDA", "--wc-control-border": "#758398",
      "--wc-accent": "#0C2C55", "--wc-accent-hover": "#143A6B", "--wc-accent-solid": "#0C2C55", "--wc-accent-solid-fg": "#FFFFFF",
      "--wc-accent-soft": "#DCEBEF", "--wc-focus": "#0C2C55", ...CHART_CLARO,
      // Erro em carmim (03/11) para não confundir com a brasa da marca.
      "--wc-danger": "#B4123F", "--wc-danger-solid": "#B4123F", "--wc-danger-soft": "#FCE8EE",
    },
  },
  {
    id: "P2",
    nome: "Brisa",
    nota: "Fundo levemente azulado do Ocean Breeze; o Ocean vira a cor dos gráficos e dos destaques.",
    modo: "light",
    cores: [["Fundo", "#E8F1F3"], ["Cartão", "#FFFFFF"], ["Midnight Navy", "#0C2C55"], ["Ocean Breeze", "#629FAD"], ["Ocean claro", "#CFE3E8"]],
    vars: {
      "--wc-bg": "#E8F1F3", "--wc-sunken": "#DAE8EC", "--wc-surface": "#FFFFFF", "--wc-surface-raised": "#FFFFFF",
      "--wc-fg": "#0C2C55", "--wc-fg-muted": "#43606E", "--wc-fg-subtle": "#647F8B",
      "--wc-border": "#D3E2E6", "--wc-border-strong": "#B6CDD3", "--wc-control-border": "#6C8791",
      "--wc-accent": "#0C2C55", "--wc-accent-hover": "#143A6B", "--wc-accent-solid": "#0C2C55", "--wc-accent-solid-fg": "#FFFFFF",
      "--wc-accent-soft": "#CFE3E8", "--wc-focus": "#0C2C55",
      ...CHART_CLARO, "--wc-chart-1": "#3F7F8E", "--wc-chart-2": "#0C2C55",
    },
  },
  {
    id: "P3",
    nome: "Noturno",
    nota: "Escuro: o Midnight Navy vira o fundo, Ocean na ação e o Vanilla Linen só no texto.",
    modo: "dark",
    cores: [["Fundo", "#0A1B33"], ["Cartão", "#10294A"], ["Ocean Breeze", "#8CC3CF"], ["Vanilla Linen", "#EDEDCE"], ["Texto suave", "#A9B8CC"]],
    vars: {
      "--wc-bg": "#0A1B33", "--wc-sunken": "#071427", "--wc-surface": "#10294A", "--wc-surface-raised": "#143159",
      "--wc-fg": "#EDEDCE", "--wc-fg-muted": "#A9B8CC", "--wc-fg-subtle": "#8597AE",
      "--wc-border": "#1F3A60", "--wc-border-strong": "#2C4A75", "--wc-control-border": "#6F86A6",
      "--wc-accent": "#8CC3CF", "--wc-accent-hover": "#A6D3DC", "--wc-accent-solid": "#8CC3CF", "--wc-accent-solid-fg": "#0A1B33",
      "--wc-accent-soft": "#163A5C", "--wc-focus": "#8CC3CF",
      "--wc-chart-1": "#8CC3CF", "--wc-chart-2": "#D9925A", "--wc-chart-3": "#3FB68A", "--wc-chart-4": "#E0B34A", "--wc-chart-5": "#D57AA6",
    },
  },
]

function Amostras({ cores }: { cores: [string, string][] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {cores.map(([nome, hex]) => (
        <li key={nome} className="flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-sm">
          <span aria-hidden className="size-7 rounded-full border" style={{ background: hex }} />
          <span className="font-medium">{nome}</span>
          <span className="font-mono text-muted-foreground">{hex}</span>
        </li>
      ))}
    </ul>
  )
}

export function Painel({ paletas = PALETAS }: { paletas?: Paleta[] }) {
  const unica = paletas.length === 1
  return (
    <div className="min-h-dvh">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" />
      {paletas.map((p, i) => (
        <section
          key={p.id}
          data-wc-theme="custelo"
          data-mode={p.modo}
          style={vars(p.vars)}
          aria-labelledby={`t-${p.id}`}
          className="bg-background px-4 py-12 text-foreground sm:px-8"
        >
          <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-8">
            {i === 0 && (
              <header className="grid gap-2 pb-4">
                <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · tema custelo</p>
                <h1 className="font-display text-5xl font-bold text-balance">Painel PacoteZap</h1>
                <p className="max-w-[65ch] text-muted-foreground">
                  {unica
                    ? "Dashboard do gestor e tela inicial da portaria, na paleta Névoa. Nomes e números são exemplos."
                    : "Dashboard A e mobile C em três paletas. Navy e Ocean ficam; muda o fundo. Nomes e números são exemplos."}
                </p>
              </header>
            )}
            <div className="grid gap-3">
              <h2 id={`t-${p.id}`} className="text-2xl font-semibold">
                <span className="font-mono">{p.id}</span> · {p.nome}
              </h2>
              <p className="max-w-[65ch] text-muted-foreground">{p.nota}</p>
              <Amostras cores={p.cores} />
            </div>
            <Moldura id="DASH-A" titulo="Bento" nota="Desktop do gestor.">
              <DashA />
            </Moldura>
            <Celular id="MOB-C" titulo="Portaria" nota="Porteiro, com a barra de vidro e o leitor de QR separado.">
              <MobC />
            </Celular>
          </div>
        </section>
      ))}
    </div>
  )
}

export { AcoesAba, EstadoBadge, Logo, Trilho, Perfil, Busca, Moldura, Celular, PALETAS, vars, DashA, MobC }
