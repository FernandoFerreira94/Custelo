"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ArchiveIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  FilterIcon,
  KeyRoundIcon,
  LinkIcon,
  MailIcon,
  MessageCircleIcon,
  MoonIcon,
  PackageIcon,
  PencilIcon,
  RefreshCwIcon,
  SendIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  UserCogIcon,
  UserPlusIcon,
  WifiIcon,
} from "lucide-react"

import { Busca, Moldura, PALETAS, Perfil, Trilho, vars } from "../pz-dash/painel"
import { Alert, AlertDescription, AlertTitle } from "@/registry/webcode/ui/alert"
import { Avatar, AvatarFallback } from "@/registry/webcode/ui/avatar"
import { Badge } from "@/registry/webcode/ui/badge"
import { Banner, BannerContent, BannerDescription, BannerTitle } from "@/registry/webcode/ui/banner"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Checkbox } from "@/registry/webcode/ui/checkbox"
import { DescriptionItem, DescriptionList } from "@/registry/webcode/ui/description-list"
import { Field, FieldDescription, FieldLabel } from "@/registry/webcode/ui/field"
import { FilterCounters } from "@/registry/webcode/ui/filter-counters"
import { Input } from "@/registry/webcode/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { Label } from "@/registry/webcode/ui/label"
import { NativeSelect, NativeSelectOption } from "@/registry/webcode/ui/native-select"
import { PermissionMatrix, type Grants, type PermissionGroup, type Role } from "@/registry/webcode/ui/permission-matrix"
import { Switch } from "@/registry/webcode/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/webcode/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/registry/webcode/ui/tabs"
import { Textarea } from "@/registry/webcode/ui/textarea"
import { Timeline, TimelineDescription, TimelineItem, TimelineTime, TimelineTitle } from "@/registry/webcode/ui/timeline"
import { UsageMeter } from "@/registry/webcode/ui/usage-meter"

// Telas de gestão do PacoteZap (03/11/2026): equipe, permissões, avisos, WhatsApp, auditoria e retenção.
// Paleta Névoa, só componentes da WebCode UI. Nomes, telefones e números são exemplos.

function Shell({ ativo, titulo, sub, acoes, children }: { ativo: string; titulo: string; sub: string; acoes?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-6">
      <Trilho ativo={ativo} />
      <div className="grid min-w-0 content-start gap-6">
        <header className="flex items-center justify-between gap-4">
          <Busca />
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

const CARTAO = "rounded-3xl"

/* ---------------- USR-001 + USR-003 · Equipe e convite ---------------- */

const EQUIPE = [
  { nome: "Marta Andrade", email: "marta@vilaverde.com.br", papel: "Gestora", onde: "Vila Verde · Colinas II", ultimo: "agora", estado: "ativo" },
  { nome: "Carlos Reis", email: "carlos.porteiro@vilaverde.com.br", papel: "Porteiro", onde: "Vila Verde · principal", ultimo: "há 4 min", estado: "ativo" },
  { nome: "Joana Prates", email: "joana@vilaverde.com.br", papel: "Porteira", onde: "Vila Verde · garagem", ultimo: "ontem 22:10", estado: "ativo" },
  { nome: "Sérgio Lopes", email: "sindico@vilaverde.com.br", papel: "Síndico", onde: "Vila Verde", ultimo: "há 3 dias", estado: "ativo" },
  { nome: "Rita Campos", email: "rita.c@gmail.com", papel: "Porteira", onde: "Vila Verde · principal", ultimo: "—", estado: "convite" },
  { nome: "Paulo Mendes", email: "paulo@vilaverde.com.br", papel: "Zelador", onde: "Vila Verde", ultimo: "há 40 dias", estado: "inativo" },
] as const

function Equipe() {
  return (
    <Shell
      ativo=""
      titulo="Equipe"
      sub="Quem acessa o Vila Verde e o que pode fazer. Cada pessoa tem conta própria."
      acoes={
        <>
          <Button variant="outline" shape="pill"><KeyRoundIcon aria-hidden />Papéis e permissões</Button>
          <Button shape="pill"><UserPlusIcon aria-hidden />Convidar</Button>
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <FilterCounters
              defaultValue="todos"
              items={[
                { value: "todos", label: "Todos", count: 6 },
                { value: "ativos", label: "Ativos", count: 4, tone: "success" },
                { value: "convite", label: "Convite pendente", count: 1, tone: "warning" },
                { value: "inativos", label: "Sem acesso há 30 dias", count: 1, tone: "danger" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Papel e local</TableHead>
                  <TableHead>Último acesso</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EQUIPE.map((p) => (
                  <TableRow key={p.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Iniciais nome={p.nome} />
                        <div className="grid">
                          <span className="font-medium">{p.nome}</span>
                          <span className="text-xs text-muted-foreground">{p.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="grid">
                        <span>{p.papel}</span>
                        <span className="text-xs text-muted-foreground">{p.onde}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.estado === "convite" ? (
                        <Badge variant="warning"><MailIcon aria-hidden />Convite enviado</Badge>
                      ) : p.estado === "inativo" ? (
                        <Badge variant="danger"><ClockIcon aria-hidden />{p.ultimo}</Badge>
                      ) : (
                        <span className="text-muted-foreground">{p.ultimo}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">{p.estado === "convite" ? "Reenviar" : p.estado === "inativo" ? "Revisar" : "Editar"}</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Convidar pessoa</CardTitle>
            <CardDescription>USR-003 · o link vale 72 h e só funciona uma vez.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
              <Field>
                <FieldLabel htmlFor="cv-email">E-mail</FieldLabel>
                <Input id="cv-email" type="email" defaultValue="rita.c@gmail.com" />
              </Field>
              <Field>
                <FieldLabel htmlFor="cv-papel">Papel</FieldLabel>
                <NativeSelect id="cv-papel" defaultValue="porteiro">
                  <NativeSelectOption value="porteiro">Porteiro</NativeSelectOption>
                  <NativeSelectOption value="zelador">Zelador</NativeSelectOption>
                  <NativeSelectOption value="sindico">Síndico (só leitura)</NativeSelectOption>
                  <NativeSelectOption value="gestor">Gestor</NativeSelectOption>
                </NativeSelect>
              </Field>
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">Onde vai trabalhar</legend>
                {[
                  ["p1", "Vila Verde · portaria principal", true],
                  ["p2", "Vila Verde · garagem", false],
                  ["p3", "Colinas II · portaria", false],
                ].map(([id, l, on]) => (
                  <div key={id as string} className="flex min-h-11 items-center gap-3">
                    <Checkbox id={id as string} defaultChecked={on as boolean} />
                    <Label htmlFor={id as string}>{l}</Label>
                  </div>
                ))}
              </fieldset>
              <Button shape="pill" size="lg"><SendIcon aria-hidden />Enviar convite</Button>
              <p className="text-xs text-muted-foreground">A pessoa cria a própria senha. Ninguém da equipe vê ou define senha de outra pessoa.</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

/* ---------------- USR-002 · Papéis e escopo ---------------- */

const PAPEIS: Role[] = [
  { id: "porteiro", label: "Porteiro" },
  { id: "zelador", label: "Zelador" },
  { id: "sindico", label: "Síndico" },
  { id: "gestor", label: "Gestor", locked: true },
]

const GRUPOS: PermissionGroup[] = [
  {
    id: "rec",
    label: "Recebimento e retirada",
    icon: <PackageIcon aria-hidden />,
    permissions: [
      { id: "receber", label: "Registrar encomenda" },
      { id: "entregar", label: "Registrar retirada" },
      { id: "devolver", label: "Registrar devolução" },
    ],
  },
  {
    id: "cor",
    label: "Correções (pedem motivo)",
    icon: <ShieldAlertIcon aria-hidden />,
    permissions: [
      { id: "trocar", label: "Trocar unidade depois do aviso" },
      { id: "cancelar", label: "Cancelar registro" },
      { id: "corrigir-ret", label: "Corrigir retirada" },
    ],
  },
  {
    id: "avi",
    label: "Avisos",
    icon: <MessageCircleIcon aria-hidden />,
    permissions: [
      { id: "reenviar", label: "Reenviar aviso" },
      { id: "fora", label: "Enviar fora da janela" },
    ],
  },
  {
    id: "adm",
    label: "Gestão",
    icon: <UserCogIcon aria-hidden />,
    permissions: [
      { id: "cadastros", label: "Unidades e pessoas" },
      { id: "auditoria", label: "Ver auditoria" },
      { id: "exportar", label: "Exportar dados" },
    ],
  },
]

const SALVO: Grants = {
  porteiro: ["receber", "entregar", "devolver", "reenviar"],
  zelador: ["receber", "entregar", "devolver", "reenviar", "trocar"],
  sindico: ["auditoria"],
  gestor: ["receber", "entregar", "devolver", "trocar", "cancelar", "corrigir-ret", "reenviar", "fora", "cadastros", "auditoria", "exportar"],
}

function Papeis() {
  const [grants, setGrants] = React.useState<Grants>({ ...SALVO, zelador: [...SALVO.zelador, "cancelar"] })
  return (
    <Shell ativo="" titulo="Papéis e permissões" sub="O que cada papel pode fazer. O banco recusa o que a tela não liberar.">
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6">
        <Card className={CARTAO}>
          <CardContent>
            <PermissionMatrix roles={PAPEIS} groups={GRUPOS} value={grants} onValueChange={setGrants} saved={SALVO} />
          </CardContent>
        </Card>
        <div className="grid content-start gap-4">
          <Alert variant="warning">
            <AlertTriangleIcon aria-hidden />
            <AlertTitle>1 mudança não salva</AlertTitle>
            <AlertDescription>Zelador passa a poder cancelar registro. Vale para 1 pessoa.</AlertDescription>
          </Alert>
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Regras fixas</CardTitle>
              <CardDescription>Não mudam por papel.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {[
                "Ninguém apaga evidência: foto, assinatura ou registro.",
                "Correção pede motivo e fica na auditoria.",
                "O gestor não perde acesso à auditoria.",
              ].map((t) => (
                <p key={t} className="flex gap-2"><ShieldCheckIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />{t}</p>
              ))}
            </CardContent>
          </Card>
          <Button shape="pill" size="lg">Salvar 1 mudança</Button>
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- CFG-002 + CFG-003 · Janelas e modelos ---------------- */

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

function AvisosConfig() {
  return (
    <Shell ativo="Avisos" titulo="Como os avisos saem" sub="Horário em que o morador pode receber mensagem e o texto de cada aviso.">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Janela de envio</CardTitle>
            <CardDescription>CFG-002 · fora dela o aviso espera e sai no próximo horário.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {DIAS.map((d, i) => (
              <div key={d} className="grid grid-cols-[64px_auto_1fr_1fr] items-center gap-3">
                <Label htmlFor={`dia-${d}`} className="font-medium">{d}</Label>
                <Switch id={`dia-${d}`} defaultChecked={i < 6} />
                <Input aria-label={`${d}, início`} inputMode="numeric" defaultValue={i === 6 ? "—" : i < 5 ? "07:00" : "09:00"} disabled={i === 6} />
                <Input aria-label={`${d}, fim`} inputMode="numeric" defaultValue={i === 6 ? "—" : i < 5 ? "22:00" : "20:00"} disabled={i === 6} />
              </div>
            ))}
            <Banner variant="info" className="mt-3 rounded-2xl">
              <MoonIcon aria-hidden />
              <BannerContent>
                <BannerDescription>Mandar fora da janela pede motivo e fica na auditoria.</BannerDescription>
              </BannerContent>
            </Banner>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Modelos de mensagem</CardTitle>
            <CardDescription>CFG-003 · o WhatsApp só envia modelos aprovados pela Meta.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Tabs defaultValue="chegou">
              <TabsList>
                <TabsTrigger value="chegou">Chegou</TabsTrigger>
                <TabsTrigger value="lembrete">Lembrete</TabsTrigger>
                <TabsTrigger value="retirada">Retirada</TabsTrigger>
                <TabsTrigger value="engano">Enviado por engano</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="grid grid-cols-[minmax(0,1fr)_240px] gap-4">
              <Field>
                <FieldLabel htmlFor="tpl">Texto</FieldLabel>
                <Textarea
                  id="tpl"
                  rows={7}
                  defaultValue={"Olá, {{nome}}! Chegou uma encomenda para a unidade {{unidade}} na portaria do {{condominio}}. Retire até {{prazo}}."}
                />
                <FieldDescription>Campos: {"{{nome}} {{unidade}} {{condominio}} {{prazo}}"}. Nunca inclui foto da etiqueta.</FieldDescription>
              </Field>
              <div className="grid content-start gap-2">
                <p className="text-sm font-medium">Prévia</p>
                <div className="rounded-2xl border bg-sunken p-3">
                  <p className="rounded-2xl rounded-tl-sm bg-card p-3 text-sm shadow-wc-xs">Olá, Mariana! Chegou uma encomenda para a unidade B-304 na portaria do Vila Verde. Retire até 10/11.</p>
                </div>
                <Badge variant="success"><CheckCircle2Icon aria-hidden />Aprovado pela Meta</Badge>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" shape="pill"><SendIcon aria-hidden />Enviar teste para mim</Button>
              <Button shape="pill">Mandar para aprovação</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

/* ---------------- CFG-004 + NOT-003 · WhatsApp e falhas ---------------- */

function WhatsApp() {
  return (
    <Shell ativo="Avisos" titulo="WhatsApp e falhas" sub="A conexão que envia os avisos e tudo o que não chegou.">
      <div className="grid grid-cols-[380px_minmax(0,1fr)] gap-6">
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Conexão</CardTitle>
              <CardDescription>CFG-004</CardDescription>
              <CardAction><Badge variant="success"><WifiIcon aria-hidden />Conectado</Badge></CardAction>
            </CardHeader>
            <CardContent className="grid gap-4">
              <DescriptionList layout="horizontal">
                <DescriptionItem label="Número">+55 11 9••••-4021</DescriptionItem>
                <DescriptionItem label="Nome exibido">Portaria Vila Verde</DescriptionItem>
                <DescriptionItem label="Qualidade">Alta</DescriptionItem>
                <DescriptionItem label="Última mensagem">há 2 min</DescriptionItem>
              </DescriptionList>
              <UsageMeter label="Mensagens hoje" value={212} max={1000} />
              <div className="flex gap-2">
                <Button variant="outline" shape="pill"><SendIcon aria-hidden />Testar envio</Button>
                <Button variant="ghost" shape="pill">Trocar número</Button>
              </div>
            </CardContent>
          </Card>
          <Banner variant="info" className="rounded-2xl">
            <SmartphoneIcon aria-hidden />
            <BannerContent>
              <BannerTitle>Se o WhatsApp cair</BannerTitle>
              <BannerDescription>A portaria continua recebendo. Os avisos esperam e saem quando voltar, ou vão por e-mail.</BannerDescription>
            </BannerContent>
          </Banner>
        </div>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Falhas e alertas</CardTitle>
            <CardDescription>NOT-003 · falha nunca some sozinha. Resolve ou marca o motivo.</CardDescription>
            <CardAction><Button variant="outline" shape="pill" size="sm"><RefreshCwIcon aria-hidden />Reenviar todas que dá</Button></CardAction>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {[
                { t: "Número sem WhatsApp", d: "A-112 · João Pereira · 3 tentativas", a: "Pedir outro contato", tone: "danger" as const },
                { t: "Morador bloqueou o número", d: "D-207 · Sandra Viana · desde 28/10", a: "Avisar por e-mail", tone: "danger" as const },
                { t: "Sem contato com consentimento", d: "C-109 · 2 encomendas paradas", a: "Completar cadastro", tone: "warning" as const },
                { t: "Esperando a janela abrir", d: "4 avisos · saem às 07:00", a: "Enviar agora", tone: "neutral" as const },
              ].map((f) => (
                <Item key={f.t} variant="outline">
                  <ItemMedia variant="icon">
                    {f.tone === "neutral" ? <MoonIcon aria-hidden /> : <AlertTriangleIcon aria-hidden className={f.tone === "danger" ? "text-danger" : "text-warning"} />}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{f.t}</ItemTitle>
                    <ItemDescription>{f.d}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {f.tone === "danger" && <Badge variant="danger"><AlertTriangleIcon aria-hidden />Falhou</Badge>}
                    {f.tone === "warning" && <Badge variant="warning"><ClockIcon aria-hidden />Travado</Badge>}
                    {f.tone === "neutral" && <Badge variant="outline"><ClockIcon aria-hidden />Na fila</Badge>}
                    <Button variant="outline" size="sm" shape="pill">{f.a}</Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

/* ---------------- AUD-001 · Trilha de auditoria ---------------- */

const TRILHA = [
  { quando: "03/11 14:32", quem: "Carlos Reis", acao: "Retirada registrada", alvo: "B-304 · 2 encomendas", tipo: "normal" },
  { quando: "03/11 14:20", quem: "Marta Andrade", acao: "Unidade trocada após aviso", alvo: "B-304 → B-034", tipo: "elevada" },
  { quando: "03/11 13:58", quem: "Joana Prates", acao: "Conflito resolvido: duplicado", alvo: "B-304", tipo: "elevada" },
  { quando: "03/11 12:10", quem: "Sérgio Lopes", acao: "Exportou relatório", alvo: "Retiradas de outubro", tipo: "acesso" },
  { quando: "03/11 11:42", quem: "Carlos Reis", acao: "Encomenda recebida", alvo: "B-304 · Mercado Livre", tipo: "normal" },
  { quando: "02/11 22:41", quem: "Marta Andrade", acao: "Aviso fora da janela", alvo: "A-112 · motivo informado", tipo: "elevada" },
] as const

function Auditoria() {
  return (
    <Shell
      ativo=""
      titulo="Auditoria"
      sub="Tudo o que foi feito, por quem e quando. Não dá para editar nem apagar."
      acoes={<Button variant="outline" shape="pill"><DownloadIcon aria-hidden />Exportar período</Button>}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <FilterCounters
                defaultValue="todos"
                items={[
                  { value: "todos", label: "Tudo", count: 1284 },
                  { value: "elevada", label: "Ações com motivo", count: 3, tone: "warning" },
                  { value: "acesso", label: "Acessos e exportações", count: 12 },
                ]}
              />
              <Button variant="outline" shape="pill" size="sm"><FilterIcon aria-hidden />Pessoa, unidade, período</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Quem</TableHead>
                  <TableHead>O que fez</TableHead>
                  <TableHead>Em quê</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TRILHA.map((r) => (
                  <TableRow key={r.quando + r.acao} data-state={r.acao.startsWith("Unidade") ? "selected" : undefined}>
                    <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">{r.quando}</TableCell>
                    <TableCell>{r.quem}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {r.acao}
                        {r.tipo === "elevada" && <Badge variant="warning"><ShieldAlertIcon aria-hidden />Com motivo</Badge>}
                        {r.tipo === "acesso" && <Badge variant="outline"><EyeIcon aria-hidden />Acesso</Badge>}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm whitespace-normal text-muted-foreground">{r.alvo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Unidade trocada após aviso</CardTitle>
            <CardDescription>03/11 14:20 · Marta Andrade · Gestora</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <DescriptionList layout="horizontal">
              <DescriptionItem label="Antes">B-304 · Mariana Souza</DescriptionItem>
              <DescriptionItem label="Depois">B-034 · Carla Nunes</DescriptionItem>
              <DescriptionItem label="Motivo">Etiqueta dizia 034, li 304 na pressa.</DescriptionItem>
              <DescriptionItem label="Aparelho">Painel web · São Paulo</DescriptionItem>
            </DescriptionList>
            <Timeline>
              <TimelineItem icon={<PencilIcon aria-hidden />} status="current">
                <TimelineTitle>Correção (evento novo)</TimelineTitle>
                <TimelineTime dateTime="2026-11-03T14:20">14:20</TimelineTime>
              </TimelineItem>
              <TimelineItem icon={<MessageCircleIcon aria-hidden />}>
                <TimelineTitle>Aviso “enviado por engano” para Mariana</TimelineTitle>
                <TimelineDescription>Sem revelar a unidade certa</TimelineDescription>
                <TimelineTime dateTime="2026-11-03T14:20">14:20</TimelineTime>
              </TimelineItem>
              <TimelineItem icon={<FileTextIcon aria-hidden />}>
                <TimelineTitle>Registro original preservado</TimelineTitle>
                <TimelineTime dateTime="2026-11-03T11:42">11:42</TimelineTime>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

/* ---------------- CFG-008 · Retenção e saída ---------------- */

function Retencao() {
  return (
    <Shell ativo="" titulo="Retenção e dados" sub="Quanto tempo cada dado fica guardado, e o que acontece se o condomínio sair.">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Prazos de guarda</CardTitle>
            <CardDescription>Depois do prazo o dado é anonimizado, não some do histórico.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dado</TableHead>
                  <TableHead>Guarda</TableHead>
                  <TableHead>Depois</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["Foto da etiqueta", "90 dias", "Apagada a imagem, fica o registro"],
                  ["Assinatura de retirada", "5 anos", "Anonimizada"],
                  ["Trilha de custódia", "5 anos", "Anonimizada"],
                  ["Contatos do morador", "Até sair", "Removidos 30 dias após sair"],
                  ["Auditoria", "5 anos", "Mantida"],
                ].map(([d, g, a]) => (
                  <TableRow key={d}>
                    <TableCell className="font-medium">{d}</TableCell>
                    <TableCell>
                      <NativeSelect size="sm" className="w-36" defaultValue={g} aria-label={`Prazo de ${d}`}>
                        <NativeSelectOption value={g}>{g}</NativeSelectOption>
                      </NativeSelect>
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">{a}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-3 text-xs text-muted-foreground">Prazos mínimos vêm do contrato e da LGPD. Encurtar abaixo deles fica bloqueado.</p>
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Pedidos de titular (LGPD)</CardTitle>
              <CardDescription>Morador pede cópia ou exclusão dos próprios dados.</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                <Item variant="outline">
                  <ItemMedia variant="icon"><FileTextIcon aria-hidden /></ItemMedia>
                  <ItemContent>
                    <ItemTitle>Cópia dos dados · Helena Prado</ItemTitle>
                    <ItemDescription>Pedido em 01/11 · prazo 16/11</ItemDescription>
                  </ItemContent>
                  <ItemActions><Button size="sm" shape="pill">Gerar arquivo</Button></ItemActions>
                </Item>
              </ItemGroup>
            </CardContent>
          </Card>
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Se o condomínio sair</CardTitle>
              <CardDescription>Exportação completa e prazo para encerrar.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm text-muted-foreground">O gestor baixa tudo (encomendas, retiradas, auditoria) em CSV e PDF. Depois de 30 dias a conta é anonimizada. Evidência nunca é apagada antes do prazo legal.</p>
              <div className="flex gap-2">
                <Button variant="outline" shape="pill"><ArchiveIcon aria-hidden />Exportar tudo</Button>
                <Button variant="ghost" shape="pill"><LinkIcon aria-hidden />Ver termo de saída</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- página ---------------- */

export function Gestao() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(PALETAS[0].vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Gestão</h1>
          <p className="max-w-[65ch] text-muted-foreground">Equipe, permissões, avisos, WhatsApp, auditoria e retenção, para o gestor no computador. Nomes e números são exemplos.</p>
        </header>
        <Moldura id="USR-001 + USR-003" titulo="Equipe e convite" nota="Conta individual, papel e onde trabalha. Convite com link que vence.">
          <Equipe />
        </Moldura>
        <Moldura id="USR-002" titulo="Papéis e permissões" nota="Matriz por papel; mudança fica marcada até salvar. Regras fixas à direita.">
          <Papeis />
        </Moldura>
        <Moldura id="CFG-002 + CFG-003" titulo="Janela de envio e modelos" nota="Horário por dia e texto de cada aviso com prévia.">
          <AvisosConfig />
        </Moldura>
        <Moldura id="CFG-004 + NOT-003" titulo="WhatsApp e falhas" nota="Estado da conexão e fila de falhas com a saída de cada uma.">
          <WhatsApp />
        </Moldura>
        <Moldura id="AUD-001" titulo="Auditoria" nota="Somente leitura. Ações com motivo em destaque e detalhe ao lado.">
          <Auditoria />
        </Moldura>
        <Moldura id="CFG-008" titulo="Retenção e dados" nota="Prazos de guarda, pedidos LGPD e saída do condomínio.">
          <Retencao />
        </Moldura>
      </div>
    </div>
  )
}

export { Shell as ShellGestao }
