"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ArchiveIcon,
  BarChart3Icon,
  BellIcon,
  Building2Icon,
  CameraIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  HomeIcon,
  KeyRoundIcon,
  LayersIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  PackageIcon,
  PenLineIcon,
  PlusIcon,
  PrinterIcon,
  ScanTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  WifiOffIcon,
  XCircleIcon,
} from "lucide-react"

import { Busca, Moldura, PALETAS, Perfil, Trilho, vars } from "../pz-dash/painel"
import { Alert, AlertDescription, AlertTitle } from "@/registry/webcode/ui/alert"
import { Avatar, AvatarFallback } from "@/registry/webcode/ui/avatar"
import { Badge } from "@/registry/webcode/ui/badge"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Countdown } from "@/registry/webcode/ui/countdown"
import { DescriptionItem, DescriptionList } from "@/registry/webcode/ui/description-list"
import { Field, FieldDescription, FieldLabel } from "@/registry/webcode/ui/field"
import { FilterCounters } from "@/registry/webcode/ui/filter-counters"
import { Input } from "@/registry/webcode/ui/input"
import { InputCep } from "@/registry/webcode/ui/input-cep"
import { InputDocument } from "@/registry/webcode/ui/input-document"
import { InputPhone } from "@/registry/webcode/ui/input-phone"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { LockedFeature } from "@/registry/webcode/ui/locked-feature"
import { NativeSelect, NativeSelectOption } from "@/registry/webcode/ui/native-select"
import { StatCard } from "@/registry/webcode/ui/stat-card"
import { Stepper } from "@/registry/webcode/ui/stepper"
import { Switch } from "@/registry/webcode/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/webcode/ui/table"
import { Timeline, TimelineDescription, TimelineItem, TimelineTime, TimelineTitle } from "@/registry/webcode/ui/timeline"
import { UsageMeter } from "@/registry/webcode/ui/usage-meter"

// Configurações, auditoria de acessos e organização do PacoteZap (04/11/2026).
// Paleta Névoa + Brasa, sidebar padrão (Trilho), só WebCode UI. Nomes e números são exemplos.

const CARTAO = "rounded-3xl"

const NAV_ORG = [
  { label: "Visão geral", icon: <HomeIcon aria-hidden /> },
  { label: "Empreendimentos", icon: <Building2Icon aria-hidden /> },
  { label: "Usuários", icon: <UsersIcon aria-hidden /> },
  { label: "Relatórios", icon: <BarChart3Icon aria-hidden /> },
]

function PerfilOrg() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" shape="pill">
        <LayersIcon aria-hidden />
        Administradora Lume
        <ChevronDownIcon aria-hidden />
      </Button>
      <Button variant="outline" shape="pill" size="icon" aria-label="Notificações, 2 novas">
        <BellIcon aria-hidden />
      </Button>
      <Avatar size="lg">
        <AvatarFallback>AS</AvatarFallback>
      </Avatar>
    </div>
  )
}

function Shell({ ativo, itens, rotulo, titulo, sub, acoes, children }: { ativo: string; itens?: typeof NAV_ORG; rotulo?: string; titulo: string; sub: string; acoes?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-6">
      <Trilho ativo={ativo} itens={itens} label={rotulo} />
      <div className="grid min-w-0 content-start gap-6">
        <header className="flex items-center justify-between gap-4">
          <Busca />
          {itens ? <PerfilOrg /> : <Perfil />}
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
  )
}

function Config({ aba, titulo, sub, children, acoes }: { aba: string; titulo: string; sub: string; children: React.ReactNode; acoes?: React.ReactNode }) {
  const abas = ["Empreendimento", "Prazos", "Portaria", "Avisos", "Plano"]
  return (
    <Shell ativo="Configurações" titulo={titulo} sub={sub} acoes={acoes}>
      <nav aria-label="Configurações" className="flex w-fit gap-1 rounded-full border bg-card p-1">
        {abas.map((a) => (
          <Button key={a} size="sm" shape="pill" variant={a === aba ? "secondary" : "ghost"} aria-current={a === aba ? "page" : undefined}>{a}</Button>
        ))}
      </nav>
      {children}
    </Shell>
  )
}

/* ---------------- CFG-001 ---------------- */

function Empreendimento() {
  return (
    <Config aba="Empreendimento" titulo="Configurações" sub="Residencial Vila Verde · só gestor altera" acoes={<Button size="lg" shape="pill">Salvar alterações</Button>}>
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Dados do empreendimento</CardTitle>
            <CardDescription>Aparecem nos avisos aos moradores e nos relatórios.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="e-nome">Nome</FieldLabel>
                <Input id="e-nome" defaultValue="Residencial Vila Verde" />
              </Field>
              <Field>
                <FieldLabel htmlFor="e-cnpj">CNPJ do condomínio</FieldLabel>
                <InputDocument id="e-cnpj" accept="cnpj" defaultValue="12345678000190" />
              </Field>
            </div>
            <div className="grid grid-cols-[180px_minmax(0,1fr)_120px] gap-4">
              <Field>
                <FieldLabel htmlFor="e-cep">CEP</FieldLabel>
                <InputCep id="e-cep" defaultValue="04538133" />
              </Field>
              <Field>
                <FieldLabel htmlFor="e-rua">Endereço</FieldLabel>
                <Input id="e-rua" defaultValue="Av. Brigadeiro Faria Lima" />
              </Field>
              <Field>
                <FieldLabel htmlFor="e-num">Número</FieldLabel>
                <Input id="e-num" defaultValue="3900" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="e-tel">Telefone da portaria</FieldLabel>
                <InputPhone id="e-tel" defaultValue="1130456677" />
                <FieldDescription>Aparece no aviso: “dúvidas, ligue para a portaria”.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="e-nome-aviso">Nome no aviso</FieldLabel>
                <Input id="e-nome-aviso" defaultValue="Portaria Vila Verde" />
                <FieldDescription>Como o morador vê quem mandou a mensagem.</FieldDescription>
              </Field>
            </div>
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Estrutura</CardTitle>
              <CardAction><Button size="sm" variant="outline" shape="pill">Editar</Button></CardAction>
            </CardHeader>
            <CardContent>
              <DescriptionList>
                <DescriptionItem label="Tipo">Residencial</DescriptionItem>
                <DescriptionItem label="Torres">3 (A, B, C)</DescriptionItem>
                <DescriptionItem label="Unidades">240</DescriptionItem>
                <DescriptionItem label="Portarias">2 · principal e garagem</DescriptionItem>
                <DescriptionItem label="Prateleiras">5</DescriptionItem>
              </DescriptionList>
            </CardContent>
          </Card>
          <Alert>
            <ShieldCheckIcon aria-hidden />
            <AlertTitle>Fica registrado</AlertTitle>
            <AlertDescription>Toda mudança aqui entra na auditoria com seu nome e o horário.</AlertDescription>
          </Alert>
        </div>
      </div>
    </Config>
  )
}

/* ---------------- CFG-005 ---------------- */

const REGRAS = [
  { id: "lembrete", titulo: "Lembrar o morador", desc: "Novo aviso por WhatsApp se ainda não retirou.", dias: "2", icone: <BellIcon aria-hidden />, liga: true },
  { id: "atraso", titulo: "Marcar como atrasada", desc: "Aparece em destaque na fila e no painel.", dias: "7", icone: <AlertTriangleIcon aria-hidden />, liga: true },
  { id: "devolver", titulo: "Sugerir devolução", desc: "O gestor decide; nada é devolvido sozinho.", dias: "30", icone: <ArchiveIcon aria-hidden />, liga: true },
]

function Prazos() {
  return (
    <Config aba="Prazos" titulo="Configurações" sub="Quanto tempo uma encomenda pode ficar na portaria" acoes={<Button size="lg" shape="pill">Salvar prazos</Button>}>
      <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Regras de prazo</CardTitle>
            <CardDescription>Contam a partir da hora em que a encomenda foi recebida.</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-3">
              {REGRAS.map((r) => (
                <Item key={r.id} variant="outline">
                  <ItemMedia variant="icon">{r.icone}</ItemMedia>
                  <ItemContent>
                    <ItemTitle>{r.titulo}</ItemTitle>
                    <ItemDescription>{r.desc}</ItemDescription>
                  </ItemContent>
                  <ItemActions className="gap-3">
                    <div className="flex items-center gap-2">
                      <Input id={`p-${r.id}`} aria-label={`${r.titulo}, depois de quantos dias`} defaultValue={r.dias} inputMode="numeric" className="w-16 text-center" />
                      <span className="text-sm text-muted-foreground">dias</span>
                    </div>
                    <Switch defaultChecked={r.liga} aria-label={`${r.titulo} ligado`} />
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Como fica na prática</CardTitle>
            <CardDescription>Encomenda recebida na segunda às 10h.</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline>
              <TimelineItem icon={<PackageIcon aria-hidden />}>
                <TimelineTitle>Recebida e avisada</TimelineTitle>
                <TimelineTime>Seg · 10:00</TimelineTime>
              </TimelineItem>
              <TimelineItem icon={<BellIcon aria-hidden />}>
                <TimelineTitle>Lembrete ao morador</TimelineTitle>
                <TimelineDescription>Dentro da janela de envio</TimelineDescription>
                <TimelineTime>Qua · 10:00</TimelineTime>
              </TimelineItem>
              <TimelineItem icon={<AlertTriangleIcon aria-hidden />} status="current">
                <TimelineTitle>Atrasada</TimelineTitle>
                <TimelineDescription>Destaque na fila do porteiro</TimelineDescription>
                <TimelineTime>Seg seguinte</TimelineTime>
              </TimelineItem>
              <TimelineItem icon={<ArchiveIcon aria-hidden />}>
                <TimelineTitle>Sugestão de devolução ao gestor</TimelineTitle>
                <TimelineTime>Dia 30</TimelineTime>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </div>
    </Config>
  )
}

/* ---------------- CFG-006 ---------------- */

const PREFS = [
  { t: "Foto da etiqueta ao receber", d: "Pede a foto primeiro. Sem câmera, o porteiro registra à mão.", i: <CameraIcon aria-hidden />, on: true },
  { t: "Leitura automática da etiqueta", d: "Sugere unidade e nome. O porteiro sempre confirma.", i: <ScanTextIcon aria-hidden />, on: true },
  { t: "Assinatura na retirada", d: "Morador assina na tela do porteiro.", i: <PenLineIcon aria-hidden />, on: true },
  { t: "Código de retirada", d: "Morador mostra um código de 4 números enviado no aviso.", i: <KeyRoundIcon aria-hidden />, on: false },
  { t: "Imprimir etiqueta com QR", d: "Para achar o volume na prateleira. O QR não libera retirada.", i: <PrinterIcon aria-hidden />, on: true },
]

function Portaria() {
  return (
    <Config aba="Portaria" titulo="Configurações" sub="Como a portaria trabalha no dia a dia">
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Preferências da portaria</CardTitle>
            <CardDescription>Valem para todos os porteiros deste empreendimento.</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-3">
              {PREFS.map((p) => (
                <Item key={p.t} variant="outline">
                  <ItemMedia variant="icon">{p.i}</ItemMedia>
                  <ItemContent>
                    <ItemTitle>{p.t}</ItemTitle>
                    <ItemDescription>{p.d}</ItemDescription>
                  </ItemContent>
                  <ItemActions><Switch defaultChecked={p.on} aria-label={p.t} /></ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Sempre ligado</CardTitle>
            <CardDescription>Não tem chave: protege a operação.</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-3">
              {[
                { t: "Receber sem internet", d: "Salva no aparelho e envia quando voltar.", i: <WifiOffIcon aria-hidden /> },
                { t: "Registro sem foto", d: "Câmera ou leitura falhou? Segue à mão.", i: <CameraIcon aria-hidden /> },
                { t: "Histórico de cada encomenda", d: "Correção cria passo novo; nada é apagado.", i: <ShieldCheckIcon aria-hidden /> },
              ].map((x) => (
                <Item key={x.t} variant="outline" size="sm">
                  <ItemMedia variant="icon">{x.i}</ItemMedia>
                  <ItemContent>
                    <ItemTitle>{x.t}</ItemTitle>
                    <ItemDescription>{x.d}</ItemDescription>
                  </ItemContent>
                  <ItemActions><Badge variant="secondary"><LockIcon aria-hidden />Fixo</Badge></ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </Config>
  )
}

/* ---------------- CFG-007 ---------------- */

function Plano() {
  return (
    <Config aba="Plano" titulo="Configurações" sub="Plano Essencial · renova em 12/11">
      <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Uso do mês</CardTitle>
            <CardDescription>Passou do limite? Os avisos continuam saindo e o excedente vem na próxima fatura.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <UsageMeter label="Mensagens de WhatsApp" value={1210} max={1500} unit="mensagens" warnAt={0.8} hint="Faltam 8 dias para renovar" />
            <UsageMeter label="Portarias" value={2} max={3} hint="Pontos de recebimento ativos" />
            <UsageMeter label="Fotos guardadas" value={3.1} max={null} unit="GB" hint="Sem limite no plano" />
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <LockedFeature
            title="Relatórios e exportação"
            description="Números do período, falhas de aviso e arquivo para a administradora."
            badge={<Badge variant="soft">Profissional</Badge>}
            actions={<Button shape="pill">Ver plano Profissional</Button>}
          />
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Em todo plano</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm">
                {["Histórico e auditoria", "Separação entre condomínios", "Recebimento sem internet", "Aviso de falha de WhatsApp", "Pedidos LGPD do morador"].map((t) => (
                  <li key={t} className="flex items-center gap-2"><ShieldCheckIcon aria-hidden className="size-4 text-success" />{t}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Config>
  )
}

/* ---------------- AUD-002 ---------------- */

const ACESSOS = [
  { quando: "Hoje · 13:02–13:40", quem: "Rafael · suporte PacoteZap", oque: "Acesso de suporte · só ver", motivo: "Chamado #4817 · avisos não chegam na torre B", tipo: "suporte" as const },
  { quando: "Hoje · 09:15", quem: "Ana Souza · gestora", oque: "Exportou outubro (CSV)", motivo: "Encomendas, retiradas e avisos", tipo: "exportacao" as const },
  { quando: "Ontem · 22:47", quem: "Carlos Lima · porteiro", oque: "Entrou de aparelho novo", motivo: "Android · São Paulo", tipo: "incomum" as const },
  { quando: "01/11 · 10:30", quem: "Ana Souza · gestora", oque: "Gerou cópia de dados (LGPD)", motivo: "Pedido de Helena Prado", tipo: "exportacao" as const },
]

function TipoAcesso({ t }: { t: (typeof ACESSOS)[number]["tipo"] }) {
  if (t === "suporte") return <Badge variant="soft"><KeyRoundIcon aria-hidden />Suporte</Badge>
  if (t === "exportacao") return <Badge variant="secondary"><DownloadIcon aria-hidden />Exportação</Badge>
  return <Badge variant="warning"><AlertTriangleIcon aria-hidden />Incomum</Badge>
}

function Acessos() {
  const [f, setF] = React.useState<string | null>(null)
  return (
    <Shell ativo="Relatórios" titulo="Acessos e exportações" sub="Quem entrou de fora, quem baixou dados e acessos fora do comum. Somente leitura." acoes={<Button variant="outline" shape="pill"><DownloadIcon aria-hidden />Baixar registro</Button>}>
      <FilterCounters
        value={f}
        onValueChange={setF}
        items={[
          { value: "suporte", label: "Suporte PacoteZap", count: 1, tone: "info" },
          { value: "exportacao", label: "Exportações", count: 6, tone: "neutral" },
          { value: "incomum", label: "Acessos incomuns", count: 1, tone: "warning" },
        ]}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6">
        <Card className={CARTAO}>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Quem</TableHead>
                  <TableHead>O que</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ACESSOS.map((a) => (
                  <TableRow key={a.quando + a.oque} data-state={a.tipo === "suporte" ? "selected" : undefined}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{a.quando}</TableCell>
                    <TableCell className="font-semibold">{a.quem}</TableCell>
                    <TableCell className="whitespace-normal">
                      <span className="block">{a.oque}</span>
                      <span className="block text-xs text-muted-foreground">{a.motivo}</span>
                    </TableCell>
                    <TableCell><TipoAcesso t={a.tipo} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Acesso de suporte</CardTitle>
            <CardDescription>Rafael · hoje, 38 minutos</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <DescriptionList>
              <DescriptionItem label="Motivo">Chamado #4817 · avisos não chegam na torre B</DescriptionItem>
              <DescriptionItem label="Permissão">Só ver</DescriptionItem>
              <DescriptionItem label="Aprovado por">Ana Souza</DescriptionItem>
            </DescriptionList>
            <Timeline>
              <TimelineItem icon={<KeyRoundIcon aria-hidden />}>
                <TimelineTitle>Entrou</TimelineTitle>
                <TimelineTime>13:02</TimelineTime>
              </TimelineItem>
              <TimelineItem icon={<EyeIcon aria-hidden />}>
                <TimelineTitle>Abriu 6 telas</TimelineTitle>
                <TimelineDescription>Avisos, WhatsApp, fila da torre B</TimelineDescription>
                <TimelineTime>13:03–13:38</TimelineTime>
              </TimelineItem>
              <TimelineItem icon={<LogOutIcon aria-hidden />}>
                <TimelineTitle>Saiu</TimelineTitle>
                <TimelineTime>13:40</TimelineTime>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

/* ---------------- ORG-001 ---------------- */

const LOCAIS = [
  { nome: "Residencial Vila Verde", un: 240, rec: 304, paradas: 3, falhas: 2, ok: "atencao" as const },
  { nome: "Residencial Ipê", un: 180, rec: 251, paradas: 0, falhas: 0, ok: "ok" as const },
  { nome: "Edifício Aurora", un: 64, rec: 88, paradas: 1, falhas: 0, ok: "ok" as const },
  { nome: "Condomínio Serra Azul", un: 320, rec: 412, paradas: 9, falhas: 14, ok: "problema" as const },
]

function Saude({ s }: { s: (typeof LOCAIS)[number]["ok"] }) {
  if (s === "ok") return <Badge variant="success"><CheckCircle2Icon aria-hidden />Em dia</Badge>
  if (s === "atencao") return <Badge variant="warning"><AlertTriangleIcon aria-hidden />Atenção</Badge>
  return <Badge variant="danger"><XCircleIcon aria-hidden />WhatsApp caiu</Badge>
}

function OrgHome() {
  return (
    <Shell ativo="Visão geral" itens={NAV_ORG} rotulo="Organização" titulo="Administradora Lume" sub="4 empreendimentos · últimos 10 dias">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Recebidas" value="1.055" delta={6.4} period="vs. 10 dias antes" />
        <StatCard label="Retiradas" value="1.011" delta={5.9} period="vs. 10 dias antes" />
        <StatCard label="Paradas há +7 dias" value="13" delta={18} goodWhen="down" period="agora" />
        <StatCard label="Avisos com falha" value="16" delta={40} goodWhen="down" period="14 no Serra Azul" />
      </div>
      <Card className={CARTAO}>
        <CardHeader>
          <CardTitle>Por empreendimento</CardTitle>
          <CardDescription>Clique para entrar no empreendimento com o seu acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empreendimento</TableHead>
                <TableHead className="text-right">Unidades</TableHead>
                <TableHead className="text-right">Recebidas</TableHead>
                <TableHead className="text-right">Paradas +7 dias</TableHead>
                <TableHead className="text-right">Falhas de aviso</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOCAIS.map((l) => (
                <TableRow key={l.nome}>
                  <TableCell className="font-semibold">{l.nome}</TableCell>
                  <TableCell className="text-right tabular-nums">{l.un}</TableCell>
                  <TableCell className="text-right tabular-nums">{l.rec}</TableCell>
                  <TableCell className="text-right tabular-nums">{l.paradas}</TableCell>
                  <TableCell className="text-right tabular-nums">{l.falhas}</TableCell>
                  <TableCell><Saude s={l.ok} /></TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost" shape="pill">Abrir</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Shell>
  )
}

/* ---------------- ORG-002 ---------------- */

function OrgLocais() {
  return (
    <Shell ativo="Empreendimentos" itens={NAV_ORG} rotulo="Organização" titulo="Empreendimentos" sub="Administradora Lume · plano Profissional, 4 de 10 usados" acoes={<Button size="lg" shape="pill"><PlusIcon aria-hidden />Novo empreendimento</Button>}>
      <div className="grid grid-cols-2 gap-6">
        {LOCAIS.map((l) => (
          <Card key={l.nome} className={CARTAO}>
            <CardHeader>
              <CardTitle>{l.nome}</CardTitle>
              <CardDescription>{l.un} unidades · 2 portarias</CardDescription>
              <CardAction><Saude s={l.ok} /></CardAction>
            </CardHeader>
            <CardContent className="grid gap-4">
              <DescriptionList>
                <DescriptionItem label="Gestor">{l.nome === "Edifício Aurora" ? "Marcos Lima" : "Ana Souza"}</DescriptionItem>
                <DescriptionItem label="Moradores com WhatsApp">{Math.round(l.un * 0.93)} de {l.un} unidades</DescriptionItem>
              </DescriptionList>
              <div className="flex gap-2">
                <Button size="sm" shape="pill">Entrar</Button>
                <Button size="sm" variant="outline" shape="pill">Configurar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  )
}

/* ---------------- ORG-003 ---------------- */

const PESSOAS = [
  { nome: "Ana Souza", email: "ana@lume.com.br", papel: "Gestora da organização", locais: ["Todos"], ultimo: "agora" },
  { nome: "Marcos Lima", email: "marcos@lume.com.br", papel: "Gestor", locais: ["Edifício Aurora"], ultimo: "há 2 h" },
  { nome: "Carlos Lima", email: "carlos.portaria@…", papel: "Porteiro", locais: ["Vila Verde", "Ipê"], ultimo: "há 5 min" },
  { nome: "Juliana Reis", email: "juliana@lume.com.br", papel: "Síndica (só ver)", locais: ["Serra Azul"], ultimo: "há 3 dias" },
  { nome: "Pedro Alves", email: "pedro@…", papel: "Porteiro", locais: ["Serra Azul"], ultimo: "convite enviado" },
]

function OrgUsuarios() {
  return (
    <Shell ativo="Usuários" itens={NAV_ORG} rotulo="Organização" titulo="Usuários da organização" sub="Uma conta por pessoa, com acesso só aos empreendimentos marcados." acoes={<Button size="lg" shape="pill"><MailIcon aria-hidden />Convidar pessoa</Button>}>
      <Card className={CARTAO}>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Onde trabalha</TableHead>
                <TableHead>Último acesso</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PESSOAS.map((p) => (
                <TableRow key={p.nome}>
                  <TableCell>
                    <span className="block font-semibold">{p.nome}</span>
                    <span className="block text-xs text-muted-foreground">{p.email}</span>
                  </TableCell>
                  <TableCell>{p.papel}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">{p.locais.map((l) => <Badge key={l} variant="outline">{l}</Badge>)}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.ultimo === "convite enviado" ? <Badge variant="soft"><ClockIcon aria-hidden />Convite enviado</Badge> : p.ultimo}
                  </TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost" shape="pill">Editar</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Shell>
  )
}

/* ---------------- ORG-004 ---------------- */

function OrgEncerrar() {
  const fim = React.useMemo(() => Date.now() + 27 * 24 * 3600 * 1000, [])
  return (
    <Shell ativo="Visão geral" itens={NAV_ORG} rotulo="Organização" titulo="Encerrar conta" sub="Administradora Lume · o histórico é guardado pelo prazo legal">
      <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Stepper
              orientation="vertical"
              current={1}
              steps={[
                { title: "Baixar os dados", description: "Encomendas, retiradas, avisos e auditoria em CSV e PDF." },
                { title: "Avisar a equipe e os moradores", description: "Mensagem pronta dizendo até quando o PacoteZap funciona." },
                { title: "30 dias para mudar de ideia", description: "Tudo segue funcionando. Dá para cancelar o encerramento." },
                { title: "Conta encerrada", description: "Ninguém mais entra. Dados pessoais são anonimizados; o histórico de custódia fica guardado pelo prazo legal." },
              ]}
            />
            <div className="flex gap-2">
              <Button size="lg" shape="pill"><FileTextIcon aria-hidden />Baixar tudo</Button>
              <Button size="lg" variant="outline" shape="pill"><MailIcon aria-hidden />Ver mensagem de aviso</Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Encerramento agendado</CardTitle>
              <CardDescription>Pedido por Ana Souza em 03/11 · motivo: “troca de administradora”</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3">
                <span className="text-sm text-muted-foreground">Encerra em</span>
                <Countdown to={fim} units={["d", "h"]} label="Tempo até o encerramento" />
              </div>
              <Button variant="outline" shape="pill" size="lg">Cancelar encerramento</Button>
            </CardContent>
          </Card>
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Confirmar agora</CardTitle>
              <CardDescription>Só quem tem papel de gestora da organização.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Field>
                <FieldLabel htmlFor="enc-nome">Digite o nome da organização</FieldLabel>
                <Input id="enc-nome" placeholder="Administradora Lume" />
              </Field>
              <Field>
                <FieldLabel htmlFor="enc-motivo">Motivo</FieldLabel>
                <NativeSelect id="enc-motivo" defaultValue="adm">
                  <NativeSelectOption value="adm">Troca de administradora</NativeSelectOption>
                  <NativeSelectOption value="preco">Preço</NativeSelectOption>
                  <NativeSelectOption value="outro">Outro</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Button variant="destructive" shape="pill" size="lg" disabled><LogOutIcon aria-hidden />Encerrar em 30 dias</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- página ---------------- */

export function Configuracoes() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(PALETAS[0].vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 04/11/2026 · WebCode UI · Névoa + Brasa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Configurações e organização</h1>
          <p className="max-w-[65ch] text-muted-foreground">Ajustes do empreendimento, quem acessou de fora e a visão da administradora com vários condomínios. Nomes e números são exemplos.</p>
        </header>
        <Moldura id="CFG-001" titulo="Dados do empreendimento" nota="Nome, CNPJ, endereço e como o morador vê a portaria.">
          <Empreendimento />
        </Moldura>
        <Moldura id="CFG-005" titulo="Prazos" nota="Lembrete, atraso e sugestão de devolução, com exemplo na linha do tempo.">
          <Prazos />
        </Moldura>
        <Moldura id="CFG-006" titulo="Preferências da portaria" nota="O que é opcional tem chave; o que protege a operação é fixo.">
          <Portaria />
        </Moldura>
        <Moldura id="CFG-007" titulo="Plano e limites" nota="Uso do mês e o que o plano libera. Segurança nunca depende de plano.">
          <Plano />
        </Moldura>
        <Moldura id="AUD-002" titulo="Acessos e exportações" nota="Suporte, downloads e acesso incomum, com o detalhe ao lado.">
          <Acessos />
        </Moldura>
        <Moldura id="ORG-001" titulo="Visão da organização" nota="Administradora com vários condomínios: números e situação de cada um.">
          <OrgHome />
        </Moldura>
        <Moldura id="ORG-002" titulo="Empreendimentos" nota="Lista com gestor, cobertura de WhatsApp e atalho para entrar.">
          <OrgLocais />
        </Moldura>
        <Moldura id="ORG-003" titulo="Usuários da organização" nota="Uma conta por pessoa, papel e onde trabalha.">
          <OrgUsuarios />
        </Moldura>
        <Moldura id="ORG-004" titulo="Encerrar conta" nota="Dois momentos: confirmar digitando o nome (direita, embaixo) e o encerramento já agendado, com 30 dias para desistir.">
          <OrgEncerrar />
        </Moldura>
      </div>
    </div>
  )
}

export { Shell as ShellOrg, NAV_ORG }
