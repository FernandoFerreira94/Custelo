"use client"

import * as React from "react"
import { PzMarca, PzSimbolo } from "../pz-marca/marca"
import {
  AlertTriangleIcon,
  BellIcon,
  Building2Icon,
  CameraIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  CircleHelpIcon,
  ClockIcon,
  CornerUpLeftIcon,
  FileTextIcon,
  HomeIcon,
  ListIcon,
  LockIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PackageIcon,
  ScanLineIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
  WifiOffIcon,
  XIcon,
} from "lucide-react"

import { PhoneFrame } from "@/components/demos/phone-frame"
import {
  AppShell,
  AppShellContent,
  AppShellMain,
  AppShellNav,
  AppShellNavGroup,
  AppShellNavItem,
  AppShellSidebar,
  AppShellSidebarHeader,
  AppShellTopbar,
  AppShellTrigger,
} from "@/registry/webcode/ui/app-shell"
import { Badge } from "@/registry/webcode/ui/badge"
import { Banner, BannerContent, BannerDescription, BannerTitle } from "@/registry/webcode/ui/banner"
import { Button } from "@/registry/webcode/ui/button"
import { CameraCapture } from "@/registry/webcode/ui/camera-capture"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Checkbox, CheckboxCard, CheckboxCardContent, CheckboxCardDescription, CheckboxCardTitle } from "@/registry/webcode/ui/checkbox"
import { DataTable, type DataTableColumn } from "@/registry/webcode/ui/data-table"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/webcode/ui/field"
import { FilterCounters } from "@/registry/webcode/ui/filter-counters"
import { Input, InputPassword } from "@/registry/webcode/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { Label } from "@/registry/webcode/ui/label"
import { NavigationBar } from "@/registry/webcode/ui/navigation-bar"
import { PageHeader, PageHeaderActions, PageHeaderContent, PageHeaderDescription, PageHeaderTitle } from "@/registry/webcode/ui/page-header"
import {
  RadioGroup,
  RadioGroupCard,
  RadioGroupCardContent,
  RadioGroupCardDescription,
  RadioGroupCardTitle,
} from "@/registry/webcode/ui/radio-group"
import { SearchBar } from "@/registry/webcode/ui/search-bar"
import { SignaturePad } from "@/registry/webcode/ui/signature-pad"
import { StatCard } from "@/registry/webcode/ui/stat-card"
import { TabBar, TabBarAction, TabBarItem } from "@/registry/webcode/ui/tab-bar"
import { ToggleGroup, ToggleGroupItem } from "@/registry/webcode/ui/toggle-group"

// Pranchas do PacoteZap (03/11/2026): só componentes da WebCode UI, tema custelo.
// Estado da encomenda: a Badge da biblioteca tem 7 variantes; os 9 estados usam a mais próxima + ícone + texto.
// Falta na biblioteca (pedido ao design): selo com os 9 tons de estado (violeta, teal, laranja, slate).

export type Estado = "recebida" | "aguardando" | "naoIdent" | "falha" | "urgente" | "pronta" | "retirada" | "devolvida" | "offline"

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

export function EstadoBadge({ estado }: { estado: Estado }) {
  const e = ESTADOS[estado]
  return (
    <Badge variant={e.variant}>
      {e.icon}
      {e.label}
    </Badge>
  )
}

function Marca({ className = "" }: { className?: string }) {
  return <PzMarca className={className} texto="text-2xl" />
}

export function Prancha({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <figure className="m-0 grid w-[390px] shrink-0 gap-3">
      <figcaption className="text-sm font-semibold text-muted-foreground">
        <span className="font-mono text-foreground">{id}</span> · {titulo}
      </figcaption>
      <PhoneFrame label={`${id} ${titulo}`} className="h-[844px] max-w-[390px]">
        {children}
      </PhoneFrame>
    </figure>
  )
}

/* ---------------- OPS ---------------- */

function Entrar() {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 pt-8 pb-6">
      <Marca />
      <div>
        <h2 className="text-3xl font-bold">Boa tarde.</h2>
        <p className="mt-1 text-muted-foreground">Entre para registrar e entregar as encomendas da portaria.</p>
      </div>
      <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
        <Field>
          <FieldLabel htmlFor="e-mail">E-mail</FieldLabel>
          <Input id="e-mail" type="email" defaultValue="carlos.porteiro@vilaverde.com.br" autoComplete="email" />
        </Field>
        <Field>
          <FieldLabel htmlFor="senha">Senha</FieldLabel>
          <InputPassword id="senha" defaultValue="senhasegura" autoComplete="current-password" />
        </Field>
        <Button shape="pill" size="lg" className="w-full">Entrar</Button>
        <Button variant="link" type="button">Esqueci minha senha</Button>
      </form>
      <Banner variant="info" className="mt-auto rounded-2xl">
        <LockIcon aria-hidden />
        <BannerContent>
          <BannerDescription>Conta individual. Cada registro fica no seu nome, com data e hora.</BannerDescription>
        </BannerContent>
      </Banner>
    </div>
  )
}

function Contexto() {
  return (
    <div className="flex h-full flex-col overflow-y-auto pb-6">
      <NavigationBar title="Onde você está hoje?" large />
      <div className="grid gap-5 px-4">
        <p className="text-muted-foreground">Tudo o que você registrar vai para este empreendimento.</p>
        <RadioGroup defaultValue="vila" aria-label="Empreendimento" className="grid gap-3">
          {[
            ["vila", "Residencial Vila Verde", "Portaria principal · Porteiro"],
            ["colinas", "Condomínio Colinas II", "Portaria da garagem · Porteiro"],
            ["torre", "Torre Atlântica Business", "Recepção · Recepcionista"],
          ].map(([v, t, d]) => (
            <RadioGroupCard key={v} value={v}>
              <Building2Icon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
              <RadioGroupCardContent>
                <RadioGroupCardTitle>{t}</RadioGroupCardTitle>
                <RadioGroupCardDescription>{d}</RadioGroupCardDescription>
              </RadioGroupCardContent>
            </RadioGroupCard>
          ))}
        </RadioGroup>
        <div className="flex min-h-11 items-center gap-3">
          <Checkbox id="padrao" defaultChecked />
          <Label htmlFor="padrao">Abrir sempre neste empreendimento</Label>
        </div>
      </div>
      <div className="mt-auto px-4">
        <Button shape="pill" size="lg" className="w-full">Começar no Vila Verde</Button>
      </div>
    </div>
  )
}

function Receber() {
  return (
    <div className="flex h-full flex-col overflow-y-auto pb-6">
      <NavigationBar
        title="Receber"
        leading={
          <Button variant="ghost" size="icon" aria-label="Fechar">
            <XIcon aria-hidden />
          </Button>
        }
        trailing={<Badge variant="success" size="lg"><CheckCheckIcon aria-hidden />7 no lote</Badge>}
      />
      <div className="grid gap-4 px-4">
        <p className="text-sm text-muted-foreground">Vila Verde · Portaria principal</p>
        <CameraCapture aspect="3/4" label="Fotografar etiqueta" fallbackLabel="Tirar foto da etiqueta" />
        <p className="text-sm text-muted-foreground">Enquadre só a etiqueta. A foto fica privada e nunca vai para o morador.</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" shape="pill" size="lg">Digitar unidade</Button>
          <Button variant="outline" shape="pill" size="lg">Encerrar lote</Button>
        </div>
      </div>
    </div>
  )
}

function Confirmar() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar
          title="Confirmar destino"
          leading={
            <Button variant="ghost" size="icon" aria-label="Voltar para a câmera">
              <ChevronLeftIcon aria-hidden />
            </Button>
          }
          trailing={<span className="pe-3 text-sm text-muted-foreground">8º do lote</span>}
        />
        <div className="grid gap-5 px-4">
          <Banner variant="info" className="rounded-2xl">
            <SparklesIcon aria-hidden />
            <BannerContent>
              <BannerTitle>Sugestão pela etiqueta</BannerTitle>
              <BannerDescription>Leu “Bloco B Ap 304” e “Mariana S. Souza”. Confira antes de salvar.</BannerDescription>
            </BannerContent>
          </Banner>
          <Card className="gap-3 rounded-3xl py-4 shadow-wc-md">
            <CardHeader className="px-4">
              <CardDescription>Unidade</CardDescription>
              <CardTitle className="font-mono text-3xl">B-304</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 px-4">
              <Badge variant="success"><CheckCircle2Icon aria-hidden />Bate com o cadastro</Badge>
              <Button variant="link" size="sm">Trocar</Button>
            </CardContent>
          </Card>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Para quem</p>
            <RadioGroup defaultValue="mariana" aria-label="Destinatário" className="grid gap-2">
              {[
                ["mariana", "Mariana Souza", "Lida na etiqueta · Titular"],
                ["pedro", "Pedro Souza", "Morador"],
                ["qualquer", "Qualquer morador da unidade", "Sem pessoa específica"],
              ].map(([v, t, d]) => (
                <RadioGroupCard key={v} value={v}>
                  <RadioGroupCardContent>
                    <RadioGroupCardTitle>{t}</RadioGroupCardTitle>
                    <RadioGroupCardDescription>{d}</RadioGroupCardDescription>
                  </RadioGroupCardContent>
                </RadioGroupCard>
              ))}
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Onde guardou (opcional)</p>
            <ToggleGroup type="single" defaultValue="c2" aria-label="Prateleira" className="flex-wrap justify-start gap-2" spacing={2}>
              {["A1", "B2", "C2", "Volume grande"].map((p) => (
                <ToggleGroupItem key={p} value={p.toLowerCase()} className="rounded-full px-4">{p}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </div>
      <div className="grid gap-2 border-t bg-card px-4 pt-3 pb-4">
        <Button shape="pill" size="lg" className="w-full"><CheckCheckIcon aria-hidden />Confirmar e próxima</Button>
        <p className="text-center text-xs text-muted-foreground">O aviso vai por WhatsApp no horário configurado.</p>
      </div>
    </div>
  )
}

const FILA: { unidade: string; quem: string; meta: string; estado: Estado }[] = [
  { unidade: "A-112", quem: "João Pereira", meta: "A1 · há 5 h · WhatsApp sem entrega", estado: "falha" },
  { unidade: "B-304", quem: "Mariana Souza · 2 volumes", meta: "C2 · há 2 h", estado: "pronta" },
  { unidade: "C-021", quem: "Ana Lima", meta: "Volume grande · há 9 dias", estado: "urgente" },
  { unidade: "B-108", quem: "Rafael Costa", meta: "B2 · agora · salvo no aparelho", estado: "offline" },
]

function Fila() {
  const [tab, setTab] = React.useState("fila")
  return (
    <div className="relative flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-28">
        <NavigationBar title="Fila" large trailing={<span className="pe-3 text-sm text-muted-foreground">23 em custódia</span>} />
        <div className="grid gap-3 px-4">
          <SearchBar placeholder="Unidade ou nome" aria-label="Buscar encomenda" inputClassName="rounded-full border bg-card shadow-wc-xs" />
          <Banner variant="brand" className="rounded-2xl">
            <WifiOffIcon aria-hidden />
            <BannerContent>
              <BannerTitle>Sem conexão</BannerTitle>
              <BannerDescription>3 registros salvos neste aparelho.</BannerDescription>
            </BannerContent>
          </Banner>
          <FilterCounters
            defaultValue="todas"
            items={[
              { value: "todas", label: "Todas", count: 23 },
              { value: "prontas", label: "Prontas", count: 14, tone: "success" },
              { value: "falha", label: "Falha no aviso", count: 2, tone: "danger" },
              { value: "prazo", label: "Prazo", count: 3, tone: "warning" },
            ]}
          />
          <ItemGroup className="gap-2">
            {FILA.map((f) => (
              <Item key={f.unidade} variant="outline" asChild>
                <a href="#retirada">
                  <ItemMedia variant="icon"><PackageIcon aria-hidden /></ItemMedia>
                  <ItemContent>
                    <ItemTitle className="font-mono text-base">{f.unidade}</ItemTitle>
                    <ItemDescription>{f.quem}</ItemDescription>
                    <ItemDescription className="text-xs">{f.meta}</ItemDescription>
                  </ItemContent>
                  <ItemActions><EstadoBadge estado={f.estado} /></ItemActions>
                </a>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </div>
      <TabBar aria-label="Navegação principal" className="absolute inset-x-0 bottom-3 px-3">
        {[
          { value: "receber", label: "Receber", icon: <CameraIcon /> },
          { value: "fila", label: "Fila", icon: <ListIcon /> },
          { value: "entregar", label: "Entregar", icon: <PackageCheckIcon /> },
          { value: "mais", label: "Mais", icon: <MoreHorizontalIcon /> },
        ].map((t) => (
          <TabBarItem key={t.value} label={t.label} icon={t.icon} active={tab === t.value} onClick={() => setTab(t.value)} />
        ))}
        <TabBarAction aria-label="Escanear QR para localizar encomenda">
          <ScanLineIcon />
        </TabBarAction>
      </TabBar>
    </div>
  )
}

function Retirada() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar
          title="Entregar · B-304"
          leading={
            <Button variant="ghost" size="icon" aria-label="Voltar para a fila">
              <ChevronLeftIcon aria-hidden />
            </Button>
          }
        />
        <div className="grid gap-5 px-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Encomendas que saem agora · 2 de 2</p>
            {[
              ["ml", "Mercado Livre", "C2 · recebida hoje 11:42"],
              ["cor", "Correios · caixa média", "C2 · recebida ontem 18:05"],
            ].map(([v, t, d]) => (
              <CheckboxCard key={v} value={v} defaultChecked>
                <CheckboxCardContent>
                  <CheckboxCardTitle>{t}</CheckboxCardTitle>
                  <CheckboxCardDescription>{d}</CheckboxCardDescription>
                </CheckboxCardContent>
              </CheckboxCard>
            ))}
          </div>
          <Field>
            <FieldLabel htmlFor="retirante">Nome de quem está retirando</FieldLabel>
            <Input id="retirante" defaultValue="Mariana Souza" />
          </Field>
          <SignaturePad label="Assinatura de quem retira" placeholder="Assine com o dedo" />
          <p className="text-xs text-muted-foreground">O QR só ajuda a achar o volume. Quem libera a retirada é a assinatura, com seu nome e o horário.</p>
        </div>
      </div>
      <div className="border-t bg-card px-4 pt-3 pb-4">
        <Button shape="pill" size="lg" className="w-full"><CheckCheckIcon aria-hidden />Registrar retirada de 2</Button>
      </div>
    </div>
  )
}

/* ---------------- WEB ---------------- */

type Linha = { id: string; unidade: string; quem: string; estado: Estado; tempo: string; acao: string }
const LINHAS: Linha[] = [
  { id: "1", unidade: "A-112", quem: "João Pereira", estado: "falha", tempo: "5 h", acao: "Reenviar aviso" },
  { id: "2", unidade: "C-021", quem: "Ana Lima", estado: "urgente", tempo: "9 dias", acao: "Iniciar devolução" },
  { id: "3", unidade: "—", quem: "Etiqueta ilegível", estado: "naoIdent", tempo: "1 dia", acao: "Identificar" },
  { id: "4", unidade: "D-410", quem: "Lucas Martins", estado: "aguardando", tempo: "20 min", acao: "Ver detalhes" },
]
const COLUNAS: DataTableColumn<Linha>[] = [
  { id: "unidade", header: "Unidade", rowHeader: true, sortable: true, cell: (r) => <span className="font-mono font-semibold">{r.unidade}</span> },
  { id: "quem", header: "Destinatário", sortable: true },
  { id: "estado", header: "Estado", cell: (r) => <EstadoBadge estado={r.estado} /> },
  { id: "tempo", header: "Há quanto tempo", sortable: true },
  { id: "acao", header: "Ação", cell: (r) => <Button variant="outline" size="sm">{r.acao}</Button> },
]

const NAV = [
  { id: "hoje", label: "Hoje", icon: HomeIcon },
  { id: "encomendas", label: "Encomendas", icon: PackageIcon },
  { id: "avisos", label: "Avisos", icon: BellIcon, badge: 2 },
  { id: "unidades", label: "Unidades e pessoas", icon: Building2Icon },
  { id: "equipe", label: "Equipe", icon: UsersIcon },
  { id: "auditoria", label: "Auditoria", icon: ShieldCheckIcon },
  { id: "relatorios", label: "Relatórios", icon: FileTextIcon },
  { id: "config", label: "Configurações", icon: SettingsIcon },
]

function Painel() {
  const [active, setActive] = React.useState("hoje")
  return (
    <AppShell className="h-[900px] min-h-0 w-full overflow-hidden rounded-lg border">
      <AppShellSidebar label="Menu de gestão" className="h-full">
        <AppShellSidebarHeader>
          <PzSimbolo className="size-8 shrink-0" />
          <span className="min-w-0 truncate font-display text-lg font-bold group-data-[collapsed=true]/shell:md:sr-only">PacoteZap</span>
        </AppShellSidebarHeader>
        <AppShellNav>
          <AppShellNavGroup label="Residencial Vila Verde">
            {NAV.map((i) => (
              <AppShellNavItem
                key={i.id}
                href="#painel"
                icon={<i.icon aria-hidden />}
                isActive={active === i.id}
                badge={i.badge}
                onClick={(e) => {
                  e.preventDefault()
                  setActive(i.id)
                }}
              >
                {i.label}
              </AppShellNavItem>
            ))}
          </AppShellNavGroup>
        </AppShellNav>
      </AppShellSidebar>
      <AppShellMain className="min-h-0 overflow-y-auto">
        <AppShellTopbar>
          <AppShellTrigger />
          <span className="flex-1 text-sm text-muted-foreground">Gestor · Residencial Vila Verde</span>
          <Badge variant="success"><CheckCircle2Icon aria-hidden />WhatsApp conectado</Badge>
        </AppShellTopbar>
        <AppShellContent asChild>
          <div className="grid gap-6">
            <PageHeader>
              <PageHeaderContent>
                <PageHeaderTitle className="font-display">Hoje no Vila Verde</PageHeaderTitle>
                <PageHeaderDescription>Terça, 3 de novembro</PageHeaderDescription>
              </PageHeaderContent>
              <PageHeaderActions>
                <Button variant="outline">Exportar</Button>
              </PageHeaderActions>
            </PageHeader>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Em custódia agora" value="23" icon={<PackageIcon aria-hidden />} />
              <StatCard label="Avisos que falharam" value="2" delta={-1} goodWhen="down" period="vs. ontem" icon={<AlertTriangleIcon aria-hidden />} />
              <StatCard label="Com prazo estourado" value="3" icon={<TimerIcon aria-hidden />} />
              <StatCard label="Retiradas hoje" value="18" delta={12} period="vs. ontem" trend={[9, 12, 11, 14, 13, 16, 18]} />
            </div>
            <DataTable data={LINHAS} columns={COLUNAS} getRowId={(r) => r.id} caption="Precisa de ação" noun="encomendas" searchPlaceholder="Buscar unidade ou nome…" />
          </div>
        </AppShellContent>
      </AppShellMain>
    </AppShell>
  )
}

/* ---------------- Fundação ---------------- */

function Fundacao() {
  return (
    <div className="grid gap-8 rounded-3xl border bg-card p-8 lg:grid-cols-2">
      <div className="grid content-start gap-4">
        <Marca />
        <p className="text-muted-foreground">Tema <b className="text-foreground">custelo</b> da WebCode UI · logo final (pino-caixa, brilho de IA e raio) aplicada em 03/11.</p>
        <div className="flex flex-wrap gap-2">
          <Button shape="pill" size="lg">Confirmar e próxima</Button>
          <Button shape="pill" size="lg" variant="outline">Registrar sem foto</Button>
          <Button shape="pill" size="lg" variant="ghost">Cancelar</Button>
          <Button shape="pill" size="lg" variant="destructive">Cancelar registro</Button>
        </div>
        <Field data-invalid>
          <FieldLabel htmlFor="motivo">Motivo da correção</FieldLabel>
          <Input id="motivo" aria-invalid />
          <FieldError>Escreva o motivo. Ele fica na trilha de auditoria.</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="unidade">Unidade</FieldLabel>
          <Input id="unidade" defaultValue="B-304" />
          <FieldDescription>Bloco e apartamento, como na etiqueta.</FieldDescription>
        </Field>
      </div>
      <div className="grid content-start gap-4">
        <p className="text-sm font-semibold">Estados da encomenda (Badge, variante mais próxima)</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ESTADOS) as Estado[]).map((e) => (
            <EstadoBadge key={e} estado={e} />
          ))}
        </div>
        <Banner variant="brand" className="rounded-2xl">
          <WifiOffIcon aria-hidden />
          <BannerContent>
            <BannerTitle>Sem conexão</BannerTitle>
            <BannerDescription>3 registros salvos no aparelho, enviam quando a rede voltar.</BannerDescription>
          </BannerContent>
        </Banner>
        <Item variant="outline">
          <ItemMedia variant="icon"><PackageIcon aria-hidden /></ItemMedia>
          <ItemContent>
            <ItemTitle className="font-mono text-base">B-304</ItemTitle>
            <ItemDescription>Mariana Souza · C2 · há 2 h</ItemDescription>
          </ItemContent>
          <ItemActions><EstadoBadge estado="pronta" /></ItemActions>
        </Item>
      </div>
    </div>
  )
}

// Paleta Névoa (escolhida em 03/11/2026): Midnight Navy + Ocean Breeze sobre cinza-azulado frio.
export const NEVOA = {
  "--wc-bg": "#EEF1F5", "--wc-sunken": "#E4E8EE", "--wc-surface": "#FFFFFF", "--wc-surface-raised": "#FFFFFF",
  "--wc-fg": "#0C2C55", "--wc-fg-muted": "#4A5B74", "--wc-fg-subtle": "#6B7A90",
  "--wc-border": "#DDE3EA", "--wc-border-strong": "#C6CFDA", "--wc-control-border": "#758398",
  "--wc-accent": "#0C2C55", "--wc-accent-hover": "#143A6B", "--wc-accent-solid": "#0C2C55", "--wc-accent-solid-fg": "#FFFFFF",
  "--wc-accent-soft": "#DCEBEF", "--wc-focus": "#0C2C55",
  "--wc-danger": "#B4123F", "--wc-danger-solid": "#B4123F", "--wc-danger-soft": "#FCE8EE",
  "--wc-chart-1": "#0C2C55", "--wc-chart-2": "#629FAD", "--wc-chart-3": "#2E8A6A", "--wc-chart-4": "#C2702E", "--wc-chart-5": "#A7577F",
  "--wc-glass-bg": "#EEF1F5db", "--wc-glass-bg-thin": "#EEF1F580", "--wc-glass-bg-thick": "#EEF1F5eb", "--wc-glass-border": "#DDE3EA",
  "--wc-font-display": '"Plus Jakarta Sans", Inter, system-ui, sans-serif', "--accent": "#F1F3F6", "--accent-foreground": "#0C2C55",
} as React.CSSProperties

export function Pranchas() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={NEVOA} className="min-h-dvh bg-background px-4 py-10 text-foreground sm:px-6">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" />
      <div className="mx-auto grid max-w-[1600px] gap-14">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-bold">PacoteZap</h1>
          <p className="max-w-2xl text-muted-foreground">Fluxo do porteiro do login à retirada, no estilo do painel aprovado (cartões claros, botões em pílula, barra de vidro). Componentes da WebCode UI; nomes e números são exemplos.</p>
        </header>

        <section aria-labelledby="t-fund" className="grid gap-4">
          <h2 id="t-fund" className="text-2xl font-semibold">00 · Fundação</h2>
          <Fundacao />
        </section>

        <section aria-labelledby="t-ops" className="grid gap-4">
          <h2 id="t-ops" className="text-2xl font-semibold">OPS · porteiro</h2>
          <div className="relative flex gap-8 overflow-x-auto pb-4">
            <Prancha id="AUTH-001" titulo="Entrar"><Entrar /></Prancha>
            <Prancha id="AUTH-005" titulo="Escolher empreendimento"><Contexto /></Prancha>
            <Prancha id="REC-002" titulo="Fotografar etiqueta"><Receber /></Prancha>
            <Prancha id="REC-003" titulo="Confirmar destino"><Confirmar /></Prancha>
            <Prancha id="CUS-001" titulo="Fila (offline)"><Fila /></Prancha>
            <div id="retirada"><Prancha id="RET-004" titulo="Retirada com assinatura"><Retirada /></Prancha></div>
          </div>
        </section>

      </div>
    </div>
  )
}
