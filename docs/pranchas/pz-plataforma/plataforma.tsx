"use client"

import * as React from "react"
import {
  ActivityIcon,
  AlertTriangleIcon,
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  GaugeIcon,
  KeyRoundIcon,
  LayersIcon,
  LogOutIcon,
  MessageCircleIcon,
  PlusIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  XCircleIcon,
} from "lucide-react"

import { AcoesAba, Busca, Moldura, PALETAS, Perfil, Trilho, vars } from "../pz-dash/painel"
import { Alert, AlertDescription, AlertTitle } from "@/registry/webcode/ui/alert"
import { Badge } from "@/registry/webcode/ui/badge"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Countdown } from "@/registry/webcode/ui/countdown"
import { Field, FieldDescription, FieldLabel } from "@/registry/webcode/ui/field"
import { FilterCounters } from "@/registry/webcode/ui/filter-counters"
import { Input } from "@/registry/webcode/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { LineChart } from "@/registry/webcode/ui/line-chart"
import { NativeSelect, NativeSelectOption } from "@/registry/webcode/ui/native-select"
import { StatCard } from "@/registry/webcode/ui/stat-card"
import { Switch } from "@/registry/webcode/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/webcode/ui/table"
import { Textarea } from "@/registry/webcode/ui/textarea"
import { Timeline, TimelineDescription, TimelineItem, TimelineTime, TimelineTitle } from "@/registry/webcode/ui/timeline"
import { UsageMeter } from "@/registry/webcode/ui/usage-meter"

// Admin da plataforma PacoteZap (03/11/2026): contas, planos, limites, acesso de suporte, saúde e consumo.
// Superfície (saas), só para a equipe Webcode. Paleta Névoa, só WebCode UI. Dados são exemplos.

const CARTAO = "rounded-3xl"

const NAV = [
  { label: "Contas", icon: <Building2Icon aria-hidden /> },
  { label: "Planos e limites", icon: <LayersIcon aria-hidden /> },
  { label: "Acesso de suporte", icon: <KeyRoundIcon aria-hidden /> },
  { label: "Saúde", icon: <ActivityIcon aria-hidden /> },
  { label: "Consumo", icon: <GaugeIcon aria-hidden /> },
]

// Pedido do Fernando (04/11): sidebar só com ícones (selecionado em brasa), engrenagem no pé,
// botão "Ações" navy preso ao canto direito mostrando só a metade, que abre um sheet só com as opções.
const ACOES_ADMIN = [
  { label: "Nova conta", icon: <PlusIcon aria-hidden /> },
  { label: "Convidar gestor", icon: <UserPlusIcon aria-hidden /> },
  { label: "Mudar plano", icon: <LayersIcon aria-hidden /> },
  { label: "Acesso de suporte", icon: <KeyRoundIcon aria-hidden /> },
  { label: "Enviar cobrança", icon: <ReceiptIcon aria-hidden /> },
  { label: "Exportar contas", icon: <DownloadIcon aria-hidden /> },
]

function Admin({ ativo, titulo, sub, acoes, sheet = false, children }: { ativo: string; titulo: string; sub: string; acoes?: React.ReactNode; sheet?: boolean; children: React.ReactNode }) {
  return (
    <div className="relative -m-6 overflow-hidden rounded-[1.6rem] p-6">
      <div className="grid grid-cols-[56px_1fr] gap-6">
        <Trilho ativo={ativo} itens={NAV} label="Admin da plataforma" />
        <div className="grid min-w-0 content-start gap-6">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Busca />
              <Badge variant="soft">Admin</Badge>
            </div>
            <Perfil />
          </header>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-bold">{titulo}</h2>
              <p className="text-muted-foreground">{sub}</p>
            </div>
            {acoes && <div className="flex gap-2">{acoes}</div>}
          </div>
          {children}
        </div>
      </div>
      {sheet && <AcoesAba itens={ACOES_ADMIN} />}
    </div>
  )
}

/* ---------------- SAAS-001 ---------------- */

const CONTAS = [
  { nome: "Administradora Lume", plano: "Profissional", locais: 14, situacao: "ativa", msgs: "18.420", receita: "R$ 4.130" },
  { nome: "Condomínio Jardins", plano: "Essencial", locais: 1, situacao: "ativa", msgs: "3.198", receita: "R$ 389" },
  { nome: "Grupo Vértice", plano: "Profissional", locais: 6, situacao: "teste", msgs: "2.011", receita: "—" },
  { nome: "Edifício Aurora", plano: "Essencial", locais: 1, situacao: "atraso", msgs: "702", receita: "R$ 289" },
  { nome: "Residencial Serra", plano: "Essencial", locais: 1, situacao: "saindo", msgs: "0", receita: "—" },
] as const

function SituacaoConta({ s }: { s: (typeof CONTAS)[number]["situacao"] }) {
  if (s === "ativa") return <Badge variant="success"><CheckCircle2Icon aria-hidden />Ativa</Badge>
  if (s === "teste") return <Badge variant="soft"><ClockIcon aria-hidden />Teste · 9 dias</Badge>
  if (s === "atraso") return <Badge variant="warning"><AlertTriangleIcon aria-hidden />Pagamento atrasado</Badge>
  return <Badge variant="outline"><LogOutIcon aria-hidden />Saindo · 30 dias</Badge>
}

function Contas() {
  const [f, setF] = React.useState<string | null>(null)
  return (
    <Admin ativo="Contas" titulo="Contas" sub="Clientes da plataforma. Dados dos moradores nunca aparecem aqui." sheet>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Contas ativas" value="38" delta={5.6} period="no mês" />
        <StatCard label="Empreendimentos" value="112" delta={7.7} period="no mês" />
        <StatCard label="Receita mensal" value="R$ 31,8 mil" delta={6.1} period="no mês" />
        <StatCard label="Em teste" value="4" period="2 vencem esta semana" />
      </div>
      <FilterCounters
        value={f}
        onValueChange={setF}
        items={[
          { value: "ativa", label: "Ativas", count: 38, tone: "success" },
          { value: "teste", label: "Em teste", count: 4, tone: "info" },
          { value: "atraso", label: "Atrasadas", count: 2, tone: "warning" },
          { value: "saindo", label: "Saindo", count: 1, tone: "neutral" },
        ]}
      />
      <Card className={CARTAO}>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead className="text-right">Locais</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Mensagens no mês</TableHead>
                <TableHead className="text-right">Mensalidade</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONTAS.map((c) => (
                <TableRow key={c.nome}>
                  <TableCell className="font-semibold">{c.nome}</TableCell>
                  <TableCell>{c.plano}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.locais}</TableCell>
                  <TableCell><SituacaoConta s={c.situacao} /></TableCell>
                  <TableCell className="text-right tabular-nums">{c.msgs}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.receita}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost" shape="pill">Abrir</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Admin>
  )
}

/* ---------------- SAAS-002 + SAAS-003 ---------------- */

const PLANOS = [
  { nome: "Essencial", preco: "R$ 289", por: "por empreendimento/mês", contas: 24, inclui: "1.500 mensagens · 3 portarias" },
  { nome: "Profissional", preco: "R$ 249", por: "por empreendimento/mês, a partir de 5", contas: 14, inclui: "2.500 mensagens · portarias sem limite" },
]

const LIMITES = [
  { item: "Mensagens WhatsApp por mês", essencial: "1.500", pro: "2.500", tipo: "numero" },
  { item: "Portarias (pontos de recebimento)", essencial: "3", pro: "Sem limite", tipo: "numero" },
  { item: "Importação por planilha", essencial: true, pro: true, tipo: "liga" },
  { item: "Relatórios e exportação", essencial: false, pro: true, tipo: "liga" },
  { item: "Visão de várias unidades (organização)", essencial: false, pro: true, tipo: "liga" },
] as const

function Planos() {
  return (
    <Admin ativo="Planos e limites" titulo="Planos e limites" sub="O que cada plano libera. Segurança e auditoria valem para todos, sempre." acoes={<Button variant="outline" shape="pill"><PlusIcon aria-hidden />Novo plano</Button>}>
      <div className="grid grid-cols-2 gap-6">
        {PLANOS.map((p) => (
          <Card key={p.nome} className={CARTAO}>
            <CardHeader>
              <CardTitle className="text-xl">{p.nome}</CardTitle>
              <CardDescription>{p.contas} contas neste plano</CardDescription>
              <CardAction><Button size="sm" variant="outline" shape="pill">Editar</Button></CardAction>
            </CardHeader>
            <CardContent className="grid gap-1">
              <p className="font-display text-4xl font-bold tabular-nums">{p.preco}</p>
              <p className="text-sm text-muted-foreground">{p.por}</p>
              <p className="mt-2 text-sm">{p.inclui}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>SAAS-003 · Limites por plano</CardTitle>
            <CardDescription>Mudança vale para todas as contas do plano no próximo ciclo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recurso</TableHead>
                  <TableHead className="w-40">Essencial</TableHead>
                  <TableHead className="w-40">Profissional</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LIMITES.map((l) => (
                  <TableRow key={l.item}>
                    <TableCell className="whitespace-normal">{l.item}</TableCell>
                    {(["essencial", "pro"] as const).map((k) => (
                      <TableCell key={k}>
                        {l.tipo === "numero" ? (
                          <Input aria-label={`${l.item} · ${k === "pro" ? "Profissional" : "Essencial"}`} defaultValue={String(l[k])} className="w-32" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Switch defaultChecked={Boolean(l[k])} aria-label={`${l.item} · ${k === "pro" ? "Profissional" : "Essencial"}`} />
                            <span className="text-sm text-muted-foreground">{l[k] ? "Liberado" : "Bloqueado"}</span>
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Sempre ligado</CardTitle>
            <CardDescription>Não depende de plano e não tem chave aqui.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm">
              {["Registro de custódia e auditoria", "Separação entre condomínios", "Recebimento sem internet", "Aviso de falha de WhatsApp", "Pedidos LGPD do morador"].map((t) => (
                <li key={t} className="flex items-center gap-2"><ShieldCheckIcon aria-hidden className="size-4 text-success" />{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Admin>
  )
}

/* ---------------- SAAS-004 ---------------- */

function AcessoSuporte() {
  const fim = React.useMemo(() => Date.now() + 38 * 60 * 1000, [])
  return (
    <Admin ativo="Acesso de suporte" titulo="Acesso de suporte" sub="Entrar na conta de um cliente só com motivo, por tempo curto e registrado na auditoria dele.">
      <div className="grid grid-cols-[minmax(0,1fr)_440px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Pedir acesso</CardTitle>
            <CardDescription>O gestor da conta é avisado e vê tudo o que você fizer.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="jit-conta">Conta e empreendimento</FieldLabel>
              <NativeSelect id="jit-conta" defaultValue="lume-ipe">
                <NativeSelectOption value="lume-ipe">Administradora Lume · Residencial Ipê</NativeSelectOption>
                <NativeSelectOption value="jardins">Condomínio Jardins</NativeSelectOption>
              </NativeSelect>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="jit-tempo">Por quanto tempo</FieldLabel>
                <NativeSelect id="jit-tempo" defaultValue="60">
                  <NativeSelectOption value="30">30 minutos</NativeSelectOption>
                  <NativeSelectOption value="60">1 hora</NativeSelectOption>
                  <NativeSelectOption value="120">2 horas (máximo)</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="jit-nivel">O que pode fazer</FieldLabel>
                <NativeSelect id="jit-nivel" defaultValue="ler">
                  <NativeSelectOption value="ler">Só ver</NativeSelectOption>
                  <NativeSelectOption value="config">Ver e ajustar configurações</NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="jit-motivo">Motivo (obrigatório)</FieldLabel>
              <Textarea id="jit-motivo" placeholder="Ex.: chamado #4821, avisos não chegam na torre B" rows={3} />
              <FieldDescription>Aparece para o cliente na auditoria, do jeito que você escrever.</FieldDescription>
            </Field>
            <div className="flex gap-2">
              <Button shape="pill" size="lg"><KeyRoundIcon aria-hidden />Pedir acesso</Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Acesso em andamento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Item variant="outline">
                <ItemMedia variant="icon"><KeyRoundIcon aria-hidden /></ItemMedia>
                <ItemContent>
                  <ItemTitle>Lume · Residencial Ipê</ItemTitle>
                  <ItemDescription>Só ver · chamado #4817 · aprovado por Lia (gestora)</ItemDescription>
                </ItemContent>
              </Item>
              <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3">
                <span className="text-sm text-muted-foreground">Encerra em</span>
                <Countdown to={fim} units={["m", "s"]} warnAt={300} label="Tempo restante de acesso" />
              </div>
              <Button variant="destructive-soft" shape="pill"><LogOutIcon aria-hidden />Encerrar agora</Button>
            </CardContent>
          </Card>
          <Alert>
            <ShieldCheckIcon aria-hidden />
            <AlertTitle>Fica na auditoria do cliente</AlertTitle>
            <AlertDescription>Entrada, cada tela aberta e a saída, com o seu nome e o motivo. Não dá para apagar.</AlertDescription>
          </Alert>
        </div>
      </div>
    </Admin>
  )
}

/* ---------------- SAAS-005 ---------------- */

const SERVICOS = [
  { nome: "WhatsApp (envio de avisos)", estado: "ok", lat: "820 ms", check: "há 20 s" },
  { nome: "Leitura de etiqueta (OCR)", estado: "lento", lat: "4,8 s", check: "há 20 s" },
  { nome: "Banco de dados", estado: "ok", lat: "12 ms", check: "há 20 s" },
  { nome: "Arquivos e fotos", estado: "ok", lat: "95 ms", check: "há 20 s" },
  { nome: "Fila de tarefas", estado: "ok", lat: "3 na fila", check: "há 20 s" },
] as const

function EstadoServico({ e }: { e: (typeof SERVICOS)[number]["estado"] }) {
  if (e === "ok") return <Badge variant="success"><CheckCircle2Icon aria-hidden />Funcionando</Badge>
  return <Badge variant="warning"><AlertTriangleIcon aria-hidden />Lento</Badge>
}

function Saude() {
  return (
    <Admin ativo="Saúde" titulo="Saúde das integrações" sub="Verificação a cada 30 segundos. Portaria continua recebendo mesmo com falha.">
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6">
        <Card className={CARTAO}>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Resposta</TableHead>
                  <TableHead className="text-right">Verificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SERVICOS.map((s) => (
                  <TableRow key={s.nome}>
                    <TableCell className="font-semibold">{s.nome}</TableCell>
                    <TableCell><EstadoServico e={s.estado} /></TableCell>
                    <TableCell className="text-right tabular-nums">{s.lat}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{s.check}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Últimos incidentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline>
              <TimelineItem status="current" icon={<AlertTriangleIcon aria-hidden />}>
                <TimelineTitle>Leitura de etiqueta lenta</TimelineTitle>
                <TimelineDescription>Porteiros digitam à mão quando passa de 6 s. 3 contas afetadas.</TimelineDescription>
                <TimelineTime>Agora</TimelineTime>
              </TimelineItem>
              <TimelineItem>
                <TimelineTitle>WhatsApp fora do ar</TimelineTitle>
                <TimelineDescription>212 avisos esperaram e saíram depois. 19 falharam de vez.</TimelineDescription>
                <TimelineTime>29/10 · 13:40 a 15:10</TimelineTime>
              </TimelineItem>
              <TimelineItem>
                <TimelineTitle>Manutenção programada</TimelineTitle>
                <TimelineDescription>20 minutos. Portarias seguiram sem internet.</TimelineDescription>
                <TimelineTime>12/10 · 02:00</TimelineTime>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </div>
    </Admin>
  )
}

/* ---------------- SAAS-006 ---------------- */

const CONSUMO = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 9, 4 + i)
  const base = d.getDay() === 0 ? 700 : d.getDay() === 6 ? 1100 : 1900
  return { dia: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, mensagens: base + ((i * 211) % 400) }
})

function Consumo() {
  return (
    <Admin ativo="Consumo" titulo="Consumo" sub="Mensagens e custo por conta desde o primeiro dia. Base para cobrar excedente.">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Mensagens no mês" value="48.310" delta={9.4} period="vs. outubro" />
        <StatCard label="Custo WhatsApp" value="R$ 3.864" delta={9.1} goodWhen="down" period="R$ 0,08 por mensagem" />
        <StatCard label="Leituras de etiqueta" value="41.902" delta={11} period="no mês" />
        <StatCard label="Custo por empreendimento" value="R$ 41" delta={-3} goodWhen="down" period="média" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_480px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Mensagens por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={CONSUMO} index="dia" series={[{ key: "mensagens", label: "Mensagens" }]} type="area" curve="smooth" height={260} />
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Perto do limite</CardTitle>
            <CardDescription>A conta é avisada em 80%. Aviso nunca para de sair.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <UsageMeter label="Edifício Aurora" value={1390} max={1500} unit="mensagens" warnAt={0.8} hint="Essencial · vence em 4 dias" />
            <UsageMeter label="Condomínio Jardins" value={1210} max={1500} unit="mensagens" warnAt={0.8} hint="Essencial" />
            <UsageMeter label="Lume · Residencial Ipê" value={1460} max={2500} unit="mensagens" warnAt={0.8} hint="Profissional" />
          </CardContent>
        </Card>
      </div>
      <Card className={CARTAO}>
        <CardHeader>
          <CardTitle>Por conta</CardTitle>
          <CardAction><Button size="sm" variant="outline" shape="pill"><MessageCircleIcon aria-hidden />Ver mensagens por tipo</Button></CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead className="text-right">Mensagens</TableHead>
                <TableHead className="text-right">Leituras</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Mensalidade</TableHead>
                <TableHead>Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { c: "Administradora Lume", m: "18.420", l: "16.011", custo: "R$ 1.473", mens: "R$ 4.130", ok: true },
                { c: "Condomínio Jardins", m: "3.198", l: "3.214", custo: "R$ 256", mens: "R$ 389", ok: true },
                { c: "Edifício Aurora", m: "702", l: "690", custo: "R$ 56", mens: "R$ 289", ok: true },
                { c: "Grupo Vértice", m: "2.011", l: "1.844", custo: "R$ 161", mens: "Teste", ok: false },
              ].map((r) => (
                <TableRow key={r.c}>
                  <TableCell className="font-semibold">{r.c}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.m}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.l}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.custo}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.mens}</TableCell>
                  <TableCell>
                    {r.ok ? <Badge variant="success"><CheckCircle2Icon aria-hidden />Positiva</Badge> : <Badge variant="warning"><XCircleIcon aria-hidden />Sem receita</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Admin>
  )
}

/* ---------------- página ---------------- */

export function Plataforma() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(PALETAS[0].vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Admin da plataforma</h1>
          <p className="max-w-[65ch] text-muted-foreground">Só para a equipe Webcode: contas, planos, acesso de suporte, saúde e consumo. Dados são exemplos.</p>
        </header>
        <Moldura id="SAAS-001" titulo="Contas" nota="Sidebar só de ícones (selecionado em brasa, engrenagem no pé). A meia-aba Ações, navy, abre um sheet só com as opções.">
          <Contas />
        </Moldura>
        <Moldura id="SAAS-002 + SAAS-003" titulo="Planos e limites" nota="Preço por plano e o que cada um libera. Segurança nunca entra em plano.">
          <Planos />
        </Moldura>
        <Moldura id="SAAS-004" titulo="Acesso de suporte" nota="Motivo obrigatório, tempo curto, contagem regressiva e registro na auditoria do cliente.">
          <AcessoSuporte />
        </Moldura>
        <Moldura id="SAAS-005" titulo="Saúde das integrações" nota="Estado de cada serviço e incidentes recentes.">
          <Saude />
        </Moldura>
        <Moldura id="SAAS-006 + BIL-003" titulo="Consumo" nota="Mensagens, leituras e custo por conta, com alerta de limite. A tabela por conta cobre o consumo do cliente (BIL-003).">
          <Consumo />
        </Moldura>
      </div>
    </div>
  )
}

export { Admin }
