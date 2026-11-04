"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ClockIcon,
  CornerUpLeftIcon,
  EyeIcon,
  FileUpIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  PlusIcon,
  SendIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UserXIcon,
} from "lucide-react"

import { Celular, EstadoBadge, Moldura, PALETAS, Perfil, Trilho, Busca, vars } from "../pz-dash/painel"
import { Avatar, AvatarFallback, AvatarGroup } from "@/registry/webcode/ui/avatar"
import { Badge } from "@/registry/webcode/ui/badge"
import { Banner, BannerContent, BannerDescription, BannerTitle } from "@/registry/webcode/ui/banner"
import { Button } from "@/registry/webcode/ui/button"
import { CameraCapture } from "@/registry/webcode/ui/camera-capture"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { DescriptionItem, DescriptionList } from "@/registry/webcode/ui/description-list"
import { Field, FieldDescription, FieldLabel } from "@/registry/webcode/ui/field"
import { FilterCounters } from "@/registry/webcode/ui/filter-counters"
import { Input } from "@/registry/webcode/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { NavigationBar } from "@/registry/webcode/ui/navigation-bar"
import {
  RadioGroup,
  RadioGroupCard,
  RadioGroupCardContent,
  RadioGroupCardDescription,
  RadioGroupCardTitle,
} from "@/registry/webcode/ui/radio-group"
import { Result } from "@/registry/webcode/ui/result"
import { SignaturePad } from "@/registry/webcode/ui/signature-pad"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/webcode/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/registry/webcode/ui/tabs"
import { Textarea } from "@/registry/webcode/ui/textarea"
import { Timeline, TimelineDescription, TimelineItem, TimelineTime, TimelineTitle } from "@/registry/webcode/ui/timeline"
import { UsageMeter } from "@/registry/webcode/ui/usage-meter"

// Telas de cadastro, avisos e devolução do PacoteZap (03/11/2026), paleta Névoa, só componentes da WebCode UI.
// Nomes, telefones e números são exemplos.

/* ---------------- moldura comum do desktop ---------------- */

function Shell({ ativo, titulo, sub, acoes, children }: { ativo: string; titulo: string; sub: string; acoes: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-6">
      <Trilho ativo={ativo} />
      <div className="grid content-start gap-6">
        <header className="flex items-center justify-between gap-4">
          <Busca />
          <Perfil />
        </header>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-bold">{titulo}</h2>
            <p className="text-muted-foreground">{sub}</p>
          </div>
          <div className="flex gap-2">{acoes}</div>
        </div>
        {children}
      </div>
    </div>
  )
}

function Iniciais({ nome }: { nome: string }) {
  const [a, b] = nome.split(" ")
  return (
    <Avatar size="sm">
      <AvatarFallback>{(a[0] + (b?.[0] ?? "")).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

/* ---------------- UNI-002 · Unidades ---------------- */

type Contato = "ok" | "semConsent" | "semContato"

const CONTATO: Record<Contato, React.ReactNode> = {
  ok: (
    <Badge variant="success">
      <CheckCircle2Icon aria-hidden />
      WhatsApp ok
    </Badge>
  ),
  semConsent: (
    <Badge variant="warning">
      <ShieldCheckIcon aria-hidden />
      Sem consentimento
    </Badge>
  ),
  semContato: (
    <Badge variant="danger">
      <PhoneIcon aria-hidden />
      Sem contato
    </Badge>
  ),
}

const UNIDADES: { u: string; pessoas: string[]; contato: Contato; custodia: number }[] = [
  { u: "B-301", pessoas: ["Rafael Costa", "Bia Costa"], contato: "ok", custodia: 0 },
  { u: "B-302", pessoas: ["Helena Duarte"], contato: "ok", custodia: 1 },
  { u: "B-303", pessoas: [], contato: "semContato", custodia: 0 },
  { u: "B-304", pessoas: ["Mariana Souza", "Pedro Souza", "Lia Souza"], contato: "ok", custodia: 2 },
  { u: "B-305", pessoas: ["Tiago Nunes"], contato: "semConsent", custodia: 1 },
  { u: "B-306", pessoas: ["Carla Mendes", "Davi Mendes"], contato: "ok", custodia: 0 },
  { u: "B-401", pessoas: ["Otávio Lima"], contato: "semConsent", custodia: 3 },
]

function Unidades() {
  return (
    <Shell
      ativo="Unidades e pessoas"
      titulo="Unidades"
      sub="Vila Verde · 4 blocos · 128 unidades"
      acoes={
        <>
          <Button variant="outline" shape="pill" size="lg">
            <FileUpIcon aria-hidden />
            Importar planilha
          </Button>
          <Button variant="elevated" shape="pill" size="lg">
            <PlusIcon aria-hidden />
            Nova unidade
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_340px] items-start gap-5">
        <Card className="rounded-3xl shadow-wc-md">
          <CardHeader className="gap-4">
            <Tabs defaultValue="b">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="a">Bloco A</TabsTrigger>
                <TabsTrigger value="b">Bloco B</TabsTrigger>
                <TabsTrigger value="c">Bloco C</TabsTrigger>
                <TabsTrigger value="d">Bloco D</TabsTrigger>
              </TabsList>
            </Tabs>
            <FilterCounters
              defaultValue="todas"
              items={[
                { value: "todas", label: "Todas do bloco", count: 32 },
                { value: "custodia", label: "Com encomenda", count: 7, tone: "info" },
                { value: "consent", label: "Sem consentimento", count: 2, tone: "warning" },
                { value: "contato", label: "Sem contato", count: 1, tone: "danger" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Pessoas</TableHead>
                  <TableHead>Aviso</TableHead>
                  <TableHead numeric>Em custódia</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {UNIDADES.map((r) => (
                  <TableRow key={r.u}>
                    <TableCell className="font-mono font-semibold">{r.u}</TableCell>
                    <TableCell>
                      {r.pessoas.length ? (
                        <span className="flex items-center gap-2">
                          <AvatarGroup>
                            {r.pessoas.map((p) => (
                              <Iniciais key={p} nome={p} />
                            ))}
                          </AvatarGroup>
                          <span className="text-sm">{r.pessoas[0]}{r.pessoas.length > 1 ? ` +${r.pessoas.length - 1}` : ""}</span>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Ninguém cadastrado</span>
                      )}
                    </TableCell>
                    <TableCell>{CONTATO[r.contato]}</TableCell>
                    <TableCell numeric className="tabular-nums">{r.custodia || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Abrir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid gap-5">
          <Card className="rounded-3xl shadow-wc-md">
            <CardHeader>
              <CardTitle className="text-lg">Qualidade do cadastro</CardTitle>
              <CardDescription>Unidade sem contato válido não recebe aviso.</CardDescription>
            </CardHeader>
            <CardContent>
              <UsageMeter label="Com contato para aviso" value={119} max={128} warnAt={0.98} hint="9 unidades precisam de atenção" />
            </CardContent>
          </Card>
          <Card className="rounded-3xl shadow-wc-md">
            <CardHeader>
              <CardTitle className="text-lg">Corrigir primeiro</CardTitle>
              <CardDescription>Têm encomenda parada e ninguém para avisar.</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                {[
                  { u: "B-401", d: "3 encomendas · sem consentimento" },
                  { u: "B-305", d: "1 encomenda · sem consentimento" },
                  { u: "D-102", d: "1 encomenda · sem contato" },
                ].map((i) => (
                  <Item key={i.u} variant="outline" size="sm" className="rounded-xl">
                    <ItemContent>
                      <ItemTitle className="font-mono">{i.u}</ItemTitle>
                      <ItemDescription>{i.d}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button variant="outline" shape="pill" size="sm">
                        Pedir contato
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- PES-001 + PES-003 · Pessoas ---------------- */

const PESSOAS = [
  { nome: "Mariana Souza", vinculo: "B-304 · Titular", contato: "ok" as Contato },
  { nome: "Pedro Souza", vinculo: "B-304 · Morador", contato: "ok" as Contato },
  { nome: "Tiago Nunes", vinculo: "B-305 · Titular", contato: "semConsent" as Contato },
  { nome: "Helena Duarte", vinculo: "B-302 · Titular", contato: "ok" as Contato },
  { nome: "Otávio Lima", vinculo: "B-401 · Inquilino", contato: "semConsent" as Contato },
  { nome: "Sandra Reis", vinculo: "B-304 · Autorizada a retirar", contato: "ok" as Contato },
]

function Pessoas() {
  return (
    <Shell
      ativo="Unidades e pessoas"
      titulo="Pessoas"
      sub="Moradores, inquilinos e autorizados · 286 pessoas"
      acoes={
        <Button variant="elevated" shape="pill" size="lg">
          <UserPlusIcon aria-hidden />
          Cadastrar pessoa
        </Button>
      }
    >
      <div className="grid grid-cols-[1fr_400px] items-start gap-5">
        <Card className="rounded-3xl shadow-wc-md">
          <CardHeader>
            <FilterCounters
              defaultValue="todas"
              items={[
                { value: "todas", label: "Todas", count: 286 },
                { value: "autorizadas", label: "Autorizadas a retirar", count: 41, tone: "info" },
                { value: "consent", label: "Sem consentimento", count: 12, tone: "warning" },
                { value: "saida", label: "Saída marcada", count: 3, tone: "neutral" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {PESSOAS.map((p, i) => (
                <Item key={p.nome} variant={i === 0 ? "muted" : "outline"} size="sm" className={`rounded-xl ${i === 0 ? "ring-2 ring-ring" : ""}`}>
                  <ItemMedia>
                    <Iniciais nome={p.nome} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{p.nome}</ItemTitle>
                    <ItemDescription>{p.vinculo}</ItemDescription>
                  </ItemContent>
                  <ItemActions>{CONTATO[p.contato]}</ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-wc-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar size="xl">
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">Mariana Souza</CardTitle>
                <CardDescription>Cadastrada em 12/08/2026 pela síndica</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <section className="grid gap-2">
              <h3 className="text-sm font-semibold">Vínculos</h3>
              <ItemGroup className="gap-2">
                <Item variant="outline" size="sm" className="rounded-xl">
                  <ItemContent>
                    <ItemTitle>
                      <span className="font-mono">B-304</span> · Titular
                    </ItemTitle>
                    <ItemDescription>Desde 03/2024 · recebe e retira</ItemDescription>
                  </ItemContent>
                </Item>
                <Item variant="outline" size="sm" className="rounded-xl">
                  <ItemContent>
                    <ItemTitle>
                      <span className="font-mono">B-305</span> · Autorizada a retirar
                    </ItemTitle>
                    <ItemDescription>Até 30/11/2026 · pedido de Tiago Nunes</ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>
              <Button variant="outline" shape="pill" size="sm" className="w-fit">
                <PlusIcon aria-hidden />
                Novo vínculo
              </Button>
            </section>
            <section className="grid gap-2">
              <h3 className="text-sm font-semibold">Contatos para aviso</h3>
              <DescriptionList layout="horizontal" bordered>
                <DescriptionItem label="WhatsApp" hint="Consentiu em 12/08/2026">
                  (11) 9 ••••-4421
                </DescriptionItem>
                <DescriptionItem label="E-mail">m•••@gmail.com</DescriptionItem>
                <DescriptionItem label="Preferência">WhatsApp, depois e-mail</DescriptionItem>
              </DescriptionList>
              <FieldDescription>Dados de contato aparecem mascarados. Ver completo fica registrado na auditoria.</FieldDescription>
            </section>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" shape="pill">
                <EyeIcon aria-hidden />
                Ver contato
              </Button>
              <Button variant="outline" shape="pill">
                <UserXIcon aria-hidden />
                Marcar saída
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

/* ---------------- NOT-001 + NOT-002 · Avisos ---------------- */

type Aviso = "entregue" | "lido" | "falhou" | "janela" | "enviando"

const AVISO: Record<Aviso, React.ReactNode> = {
  lido: (
    <Badge variant="success">
      <CheckCheckIcon aria-hidden />
      Lido
    </Badge>
  ),
  entregue: (
    <Badge variant="soft">
      <CheckCircle2Icon aria-hidden />
      Entregue
    </Badge>
  ),
  falhou: (
    <Badge variant="danger">
      <AlertTriangleIcon aria-hidden />
      Falhou
    </Badge>
  ),
  janela: (
    <Badge variant="warning">
      <ClockIcon aria-hidden />
      Espera a janela
    </Badge>
  ),
  enviando: (
    <Badge variant="outline">
      <SendIcon aria-hidden />
      Enviando
    </Badge>
  ),
}

const AVISOS: { hora: string; u: string; quem: string; canal: string; tent: number; estado: Aviso }[] = [
  { hora: "13:10", u: "A-112", quem: "João Pereira", canal: "WhatsApp", tent: 3, estado: "falhou" },
  { hora: "12:58", u: "D-410", quem: "Lucas Martins", canal: "WhatsApp", tent: 1, estado: "enviando" },
  { hora: "11:43", u: "B-304", quem: "Mariana Souza", canal: "WhatsApp", tent: 1, estado: "lido" },
  { hora: "11:40", u: "C-021", quem: "Ana Lima", canal: "E-mail", tent: 1, estado: "entregue" },
  { hora: "22:14", u: "B-401", quem: "Otávio Lima", canal: "WhatsApp", tent: 0, estado: "janela" },
]

function Avisos() {
  return (
    <Shell
      ativo="Avisos"
      titulo="Avisos"
      sub="Hoje · 241 enviados · janela de envio 07:00 às 22:00"
      acoes={
        <Button variant="outline" shape="pill" size="lg">
          Configurar janela
        </Button>
      }
    >
      <Banner variant="danger" className="rounded-2xl">
        <AlertTriangleIcon aria-hidden />
        <BannerContent>
          <BannerTitle>2 avisos falharam hoje</BannerTitle>
          <BannerDescription>O WhatsApp devolveu erro para A-112 e C-118. O porteiro vê o alerta na fila até alguém resolver.</BannerDescription>
        </BannerContent>
      </Banner>
      <div className="grid grid-cols-[1fr_400px] items-start gap-5">
        <Card className="rounded-3xl shadow-wc-md">
          <CardHeader>
            <FilterCounters
              defaultValue="todos"
              items={[
                { value: "todos", label: "Todos", count: 241 },
                { value: "falhou", label: "Falharam", count: 2, tone: "danger" },
                { value: "janela", label: "Esperando janela", count: 4, tone: "warning" },
                { value: "lido", label: "Lidos", count: 188, tone: "success" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Para</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead numeric>Tentativas</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {AVISOS.map((a, i) => (
                  <TableRow key={a.u + a.hora} data-state={i === 0 ? "selected" : undefined}>
                    <TableCell className="tabular-nums text-muted-foreground">{a.hora}</TableCell>
                    <TableCell className="font-mono font-semibold">{a.u}</TableCell>
                    <TableCell>{a.quem}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        {a.canal === "WhatsApp" ? <MessageCircleIcon aria-hidden className="size-4" /> : <MailIcon aria-hidden className="size-4" />}
                        {a.canal}
                      </span>
                    </TableCell>
                    <TableCell numeric className="tabular-nums">{a.tent}</TableCell>
                    <TableCell>{AVISO[a.estado]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-wc-md">
          <CardHeader>
            <CardDescription>Aviso selecionado</CardDescription>
            <CardTitle className="text-2xl">
              <span className="font-mono">A-112</span> · João Pereira
            </CardTitle>
            <CardAction>{AVISO.falhou}</CardAction>
          </CardHeader>
          <CardContent className="grid gap-5">
            <Timeline>
              <TimelineItem status="done">
                <TimelineTitle>Encomenda registrada</TimelineTitle>
                <TimelineDescription>Mercado Livre · prateleira A1</TimelineDescription>
                <TimelineTime>08:02</TimelineTime>
              </TimelineItem>
              <TimelineItem status="error">
                <TimelineTitle>1ª tentativa no WhatsApp</TimelineTitle>
                <TimelineDescription>Número não tem WhatsApp</TimelineDescription>
                <TimelineTime>08:03</TimelineTime>
              </TimelineItem>
              <TimelineItem status="error">
                <TimelineTitle>2ª e 3ª tentativas</TimelineTitle>
                <TimelineDescription>Mesmo erro. Parou de tentar.</TimelineDescription>
                <TimelineTime>13:10</TimelineTime>
              </TimelineItem>
              <TimelineItem status="current">
                <TimelineTitle>Esperando alguém resolver</TimelineTitle>
              </TimelineItem>
            </Timeline>
            <div className="grid gap-2">
              <Button shape="pill" size="lg">
                <MailIcon aria-hidden />
                Enviar por e-mail
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" shape="pill">
                  <PhoneIcon aria-hidden />
                  Corrigir número
                </Button>
                <Button variant="outline" shape="pill">
                  Marcar como avisado
                </Button>
              </div>
            </div>
            <Card variant="flat" className="gap-3 rounded-2xl bg-muted py-4">
              <CardContent className="grid gap-3 px-4">
                <p className="text-sm font-semibold">Enviar fora da janela (NOT-004)</p>
                <Field>
                  <FieldLabel htmlFor="motivo-janela">Motivo</FieldLabel>
                  <Textarea id="motivo-janela" placeholder="Ex.: morador pediu aviso imediato por telefone" rows={2} />
                  <FieldDescription>Envio entre 22:00 e 07:00 pede motivo e fica na auditoria.</FieldDescription>
                </Field>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

/* ---------------- DEV-001/002 · Registrar devolução (mobile) ---------------- */

function Devolver() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar
          title="Devolver · C-021"
          leading={
            <Button variant="ghost" size="icon" aria-label="Voltar para a fila">
              <ChevronLeftIcon aria-hidden />
            </Button>
          }
        />
        <div className="grid gap-5 px-4">
          <Card className="gap-3 rounded-3xl py-4 shadow-wc-md">
            <CardContent className="grid gap-2 px-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-2xl font-bold">C-021</span>
                <EstadoBadge estado="urgente" />
              </div>
              <p className="text-sm text-muted-foreground">Ana Lima · Correios · volume grande · 9 dias na portaria (prazo de 7)</p>
            </CardContent>
          </Card>
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Por que está devolvendo?</p>
            <RadioGroup defaultValue="prazo" className="gap-2">
              {[
                { v: "prazo", t: "Prazo estourado", d: "Ninguém retirou no prazo do condomínio" },
                { v: "recusa", t: "Recusada pelo morador", d: "Morador pediu para devolver" },
                { v: "naoexiste", t: "Destinatário não mora aqui", d: "Não há unidade nem pessoa com esse nome" },
                { v: "avaria", t: "Volume avariado", d: "Chegou danificado; fotografe antes" },
              ].map((o) => (
                <RadioGroupCard key={o.v} value={o.v} id={`m-${o.v}`}>
                  <RadioGroupCardContent>
                    <RadioGroupCardTitle>{o.t}</RadioGroupCardTitle>
                    <RadioGroupCardDescription>{o.d}</RadioGroupCardDescription>
                  </RadioGroupCardContent>
                </RadioGroupCard>
              ))}
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Foto do volume saindo</p>
            <CameraCapture aspect="4/3" />
          </div>
          <Field>
            <FieldLabel htmlFor="coletor">Quem está levando</FieldLabel>
            <Input id="coletor" defaultValue="Paulo Ramos · carteiro dos Correios" />
          </Field>
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Assinatura de quem leva</p>
            <SignaturePad />
          </div>
        </div>
      </div>
      <div className="grid gap-2 border-t bg-background px-4 pt-3 pb-6">
        <Button shape="pill" size="lg">
          <CornerUpLeftIcon aria-hidden />
          Registrar devolução
        </Button>
      </div>
    </div>
  )
}

/* ---------------- DEV-003 · Confirmação ---------------- */

function DevolucaoFeita() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-12 pb-4">
        <Result
          status="success"
          title="Devolução registrada"
          description="C-021 saiu da custódia às 14:05. O registro entra na trilha e não pode ser apagado."
        />
        <Card className="mt-6 gap-3 rounded-3xl py-4 shadow-wc-md">
          <CardContent className="px-4">
            <DescriptionList layout="horizontal">
              <DescriptionItem label="Motivo">Prazo estourado</DescriptionItem>
              <DescriptionItem label="Levou">Paulo Ramos · Correios</DescriptionItem>
              <DescriptionItem label="Registrou">Carlos · Portaria principal</DescriptionItem>
              <DescriptionItem label="Evidência">Foto e assinatura</DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>
        <Banner variant="info" className="mt-4 rounded-2xl">
          <MessageCircleIcon aria-hidden />
          <BannerContent>
            <BannerDescription>Ana Lima recebe um aviso de que a encomenda foi devolvida aos Correios.</BannerDescription>
          </BannerContent>
        </Banner>
      </div>
      <div className="grid gap-2 border-t bg-background px-4 pt-3 pb-6">
        <Button shape="pill" size="lg">
          Voltar para a fila
        </Button>
        <Button variant="ghost" shape="pill">
          Ver trilha da encomenda
        </Button>
      </div>
    </div>
  )
}

/* ---------------- página ---------------- */

export function Telas() {
  const nevoa = PALETAS[0]
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(nevoa.vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" />
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Cadastros, avisos e devolução</h1>
          <p className="max-w-[65ch] text-muted-foreground">
            Unidades, pessoas e avisos para o gestor; devolução para o porteiro. Mesmo estilo do painel aprovado. Nomes e números são exemplos.
          </p>
        </header>
        <Moldura id="UNI-002" titulo="Unidades" nota="Por bloco, com quem mora e se dá para avisar. Destaca o que travaria um aviso.">
          <Unidades />
        </Moldura>
        <Moldura id="PES-001 + PES-003" titulo="Pessoas e detalhe" nota="Lista à esquerda; vínculos e contatos (mascarados, com consentimento) à direita.">
          <Pessoas />
        </Moldura>
        <Moldura id="NOT-001 + NOT-002" titulo="Avisos e tentativas" nota="Falha nunca some: alerta no topo, tentativas no detalhe e saídas para resolver.">
          <Avisos />
        </Moldura>
        <section className="grid min-w-0 gap-6" aria-labelledby="t-dev">
          <h2 id="t-dev" className="text-2xl font-semibold">Devolução · porteiro</h2>
          <div className="relative -mx-4 flex gap-8 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
            <Celular id="DEV-001 + DEV-002" titulo="Registrar devolução" nota="Motivo, foto e assinatura de quem leva.">
              <Devolver />
            </Celular>
            <Celular id="DEV-003" titulo="Confirmação" nota="O que ficou registrado e quem foi avisado.">
              <DevolucaoFeita />
            </Celular>
          </div>
        </section>
      </div>
    </div>
  )
}
