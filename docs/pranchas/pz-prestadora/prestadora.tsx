"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  Building2Icon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  FileSignatureIcon,
  HomeIcon,
  KeyRoundIcon,
  LinkIcon,
  LockIcon,
  PauseCircleIcon,
  PlusIcon,
  QrCodeIcon,
  ScanLineIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
  WifiOffIcon,
  XCircleIcon,
} from "lucide-react"

import { NEVOA, Prancha } from "../pranchas/pranchas"
import { Busca, Moldura, Trilho } from "../pz-dash/painel"
import { ShellGestao } from "../pz-gestao/gestao"
import { PzMarca } from "../pz-marca/marca"
import { Alert, AlertDescription, AlertTitle } from "@/registry/webcode/ui/alert"
import { Avatar, AvatarFallback } from "@/registry/webcode/ui/avatar"
import { Badge } from "@/registry/webcode/ui/badge"
import { Banner, BannerContent, BannerDescription, BannerTitle } from "@/registry/webcode/ui/banner"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Checkbox } from "@/registry/webcode/ui/checkbox"
import { CopyButton } from "@/registry/webcode/ui/copy-button"
import { DescriptionItem, DescriptionList } from "@/registry/webcode/ui/description-list"
import { EmptyState } from "@/registry/webcode/ui/empty"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/webcode/ui/field"
import { Input, InputPassword } from "@/registry/webcode/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS_AND_CHARS } from "@/registry/webcode/ui/input-otp"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { Label } from "@/registry/webcode/ui/label"
import { NativeSelect, NativeSelectOption } from "@/registry/webcode/ui/native-select"
import { QRCode } from "@/registry/webcode/ui/qr-code"
import { Result } from "@/registry/webcode/ui/result"
import { Skeleton, SkeletonText } from "@/registry/webcode/ui/skeleton"
import { Spinner } from "@/registry/webcode/ui/spinner"
import { StatCard } from "@/registry/webcode/ui/stat-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/webcode/ui/table"
import { Textarea } from "@/registry/webcode/ui/textarea"

// Prestadora, contratos e login por local (D20, 04/11/2026). Névoa + Brasa, só WebCode UI, sem vidro.
// Estado sempre com cor + texto + ícone. Nomes, códigos e e-mails são exemplos.
// Regras: sem busca pública por nome; lista de condomínios só depois do login; lista de funcionários só no aparelho.

const CARTAO = "rounded-3xl"

function Grupo({ id, titulo, texto, children }: { id: string; titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-4">
      <div className="grid gap-1">
        <h2 id={id} className="font-display text-3xl font-bold">{titulo}</h2>
        <p className="max-w-3xl text-muted-foreground">{texto}</p>
      </div>
      <div className="grid gap-8">{children}</div>
    </section>
  )
}

function Linha({ children }: { children: React.ReactNode }) {
  return <div className="relative flex gap-8 overflow-x-auto pb-6">{children}</div>
}

function TelaCelular({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col gap-4 overflow-y-auto bg-muted px-4 pt-8 pb-8">{children}</div>
}

/* ============ LOC-001 · Entrar com o código do local (celular) ============ */

type EstadoCodigo = "vazio" | "conferindo" | "erro" | "bloqueado" | "ok" | "offline"

function EntrarComCodigo({ estado = "vazio" }: { estado?: EstadoCodigo }) {
  const valor = estado === "vazio" ? "" : estado === "erro" ? "GX4T2P" : estado === "bloqueado" ? "GX4T2P" : "GIRA2K"
  if (estado === "ok") {
    return (
      <TelaCelular>
        <PzMarca />
        <Card className={`${CARTAO} shadow-wc-md`}>
          <CardContent className="grid gap-4">
            <Result
              status="success"
              title="Aparelho pareado"
              description="Este aparelho agora é da portaria do Residencial Girassol 2. Não precisa digitar o código de novo."
            />
            <DescriptionList layout="horizontal" bordered>
              <DescriptionItem label="Local">Residencial Girassol 2</DescriptionItem>
              <DescriptionItem label="Aparelho">Portaria · celular da empresa</DescriptionItem>
              <DescriptionItem label="Pareado em">04/11 às 14:20</DescriptionItem>
            </DescriptionList>
            <Button shape="pill" size="lg">Continuar para o login</Button>
          </CardContent>
        </Card>
      </TelaCelular>
    )
  }
  return (
    <TelaCelular>
      <div className="flex items-center justify-between"><PzMarca /></div>
      <div className="grid gap-1">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Código do local</h2>
        <p className="text-muted-foreground">Peça ao gestor do condomínio. O código fica impresso no cartaz da portaria e vale uma vez por aparelho.</p>
      </div>
      {estado === "offline" && (
        <Banner variant="warning" className="rounded-2xl">
          <WifiOffIcon aria-hidden />
          <BannerContent>
            <BannerTitle>Sem internet</BannerTitle>
            <BannerDescription>Para parear o aparelho precisa de internet. Conecte e tente de novo.</BannerDescription>
          </BannerContent>
        </Banner>
      )}
      <Card className={`${CARTAO} shadow-wc-md`}>
        <CardContent className="grid gap-5">
          <Field>
            <FieldLabel htmlFor={`cod-${estado}`}>Código com 6 letras e números</FieldLabel>
            <InputOTP id={`cod-${estado}`} maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} defaultValue={valor} aria-invalid={estado === "erro" || estado === "bloqueado"} disabled={estado === "conferindo" || estado === "bloqueado"}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
            {estado === "erro" && <FieldError>Código não encontrado ou vencido. Confira com o gestor do condomínio.</FieldError>}
            {estado === "bloqueado" && (
              <FieldError>Muitas tentativas seguidas. Tente de novo em 2:00.</FieldError>
            )}
          </Field>
          <Button shape="pill" size="lg" disabled={estado === "vazio" || estado === "conferindo" || estado === "bloqueado" || estado === "offline"} aria-busy={estado === "conferindo"}>
            {estado === "conferindo" ? <><Spinner aria-hidden />Conferindo o código…</> : "Parear aparelho"}
          </Button>
          <Button variant="outline" shape="pill" size="lg" disabled={estado === "conferindo" || estado === "bloqueado"}>
            <ScanLineIcon aria-hidden />
            Ler o QR do cartaz
          </Button>
        </CardContent>
      </Card>
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheckIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
        Por segurança, o PacoteZap não mostra lista de condomínios nem busca por nome antes do login.
      </p>
      <p className="text-sm text-muted-foreground">Trabalha para uma empresa de portaria ou vigilância? <a href="#entrar" className="font-medium text-brand underline-offset-4 hover:underline">Entre com e-mail e senha</a>.</p>
    </TelaCelular>
  )
}

/* ============ LOC-002 · Quem vai entrar neste aparelho (celular) ============ */

const PESSOAS = [
  { n: "Carlos Mendes", m: "c•••••@selva.com.br", u: "hoje, 07:58", i: "CM" },
  { n: "Rita Oliveira", m: "r••••@selva.com.br", u: "ontem, 18:02", i: "RO" },
  { n: "Jorge Lima", m: "j••••@selva.com.br", u: "há 6 dias", i: "JL" },
]

type EstadoLista = "lista" | "senha" | "senhaErrada" | "entrando" | "vazia" | "remover"

function ListaDoAparelho({ estado = "lista" }: { estado?: EstadoLista }) {
  const cabecalho = (
    <>
      <div className="flex items-center justify-between"><PzMarca /></div>
      <Item variant="outline" className="rounded-2xl bg-card">
        <ItemMedia variant="icon"><Building2Icon aria-hidden /></ItemMedia>
        <ItemContent>
          <ItemTitle>Residencial Girassol 2</ItemTitle>
          <ItemDescription>Portaria · aparelho pareado</ItemDescription>
        </ItemContent>
        <ItemActions><Badge variant="success"><CheckCircle2Icon aria-hidden />Pareado</Badge></ItemActions>
      </Item>
    </>
  )
  if (estado === "vazia") {
    return (
      <TelaCelular>
        {cabecalho}
        <Card className={`${CARTAO} shadow-wc-md`}>
          <CardContent className="grid gap-5">
            <EmptyState
              icon={<UsersIcon aria-hidden />}
              title="Ninguém entrou neste aparelho ainda"
              description="Digite seu e-mail e senha. Da próxima vez seu nome aparece aqui."
            />
            <Field>
              <FieldLabel htmlFor="ld-email">E-mail</FieldLabel>
              <Input id="ld-email" type="email" autoComplete="username" placeholder="voce@empresa.com.br" />
            </Field>
            <Field>
              <FieldLabel htmlFor="ld-senha">Senha</FieldLabel>
              <InputPassword id="ld-senha" autoComplete="current-password" />
            </Field>
            <Button shape="pill" size="lg">Entrar</Button>
          </CardContent>
        </Card>
      </TelaCelular>
    )
  }
  if (estado === "senha" || estado === "senhaErrada" || estado === "entrando") {
    return (
      <TelaCelular>
        {cabecalho}
        <Card className={`${CARTAO} shadow-wc-md`}>
          <CardHeader>
            <Button variant="ghost" size="sm" className="w-fit px-2"><ArrowLeftIcon aria-hidden />Trocar de pessoa</Button>
            <div className="mt-2 flex items-center gap-3">
              <Avatar size="lg"><AvatarFallback>CM</AvatarFallback></Avatar>
              <div>
                <CardTitle className="text-xl">Carlos Mendes</CardTitle>
                <CardDescription>c•••••@selva.com.br</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <Field>
              <FieldLabel htmlFor="ls-senha">Senha</FieldLabel>
              <InputPassword id="ls-senha" autoComplete="current-password" defaultValue={estado === "senha" ? "" : "exemplo-senha"} aria-invalid={estado === "senhaErrada"} disabled={estado === "entrando"} />
              {estado === "senhaErrada" && <FieldError>Senha incorreta. Restam 3 tentativas antes de esperar 5 minutos.</FieldError>}
            </Field>
            <Button shape="pill" size="lg" disabled={estado === "entrando"} aria-busy={estado === "entrando"}>
              {estado === "entrando" ? <><Spinner aria-hidden />Entrando…</> : "Entrar"}
            </Button>
            <FieldDescription className="text-center">A senha é sempre pedida, mesmo neste aparelho.</FieldDescription>
          </CardContent>
        </Card>
      </TelaCelular>
    )
  }
  return (
    <TelaCelular>
      {cabecalho}
      <div className="grid gap-1">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Quem vai entrar?</h2>
        <p className="text-muted-foreground">Só aparecem pessoas que já entraram neste aparelho.</p>
      </div>
      <ItemGroup className="gap-2">
        {PESSOAS.map((p) => (
          <Item key={p.n} variant="outline" className="min-h-14 rounded-2xl bg-card text-left shadow-wc-md" asChild>
            <button type="button">
              <ItemMedia><Avatar size="lg"><AvatarFallback>{p.i}</AvatarFallback></Avatar></ItemMedia>
              <ItemContent>
                <ItemTitle>{p.n}</ItemTitle>
                <ItemDescription>{p.m} · {p.u}</ItemDescription>
              </ItemContent>
            </button>
          </Item>
        ))}
      </ItemGroup>
      <Button variant="outline" shape="pill" size="lg"><PlusIcon aria-hidden />Usar outro e-mail</Button>
      {estado === "remover" ? (
        <Alert className="rounded-2xl">
          <Trash2Icon aria-hidden />
          <AlertTitle>Remover Jorge Lima deste aparelho?</AlertTitle>
          <AlertDescription>
            O nome some desta lista. A conta dele continua valendo e ele pode entrar de novo digitando o e-mail.
            <span className="mt-3 flex gap-2">
              <Button size="sm" variant="destructive" shape="pill">Remover</Button>
              <Button size="sm" variant="outline" shape="pill">Cancelar</Button>
            </span>
          </AlertDescription>
        </Alert>
      ) : (
        <Button variant="ghost" shape="pill" className="w-fit"><Trash2Icon aria-hidden />Remover alguém deste aparelho</Button>
      )}
      <p className="text-xs text-muted-foreground">Esta lista fica só neste aparelho e some sozinha depois de 30 dias sem uso.</p>
    </TelaCelular>
  )
}

/* ============ LOC-003 · Escolher o condomínio (prestadora, depois do login) ============ */

type EstadoEscolha = "lista" | "carregando" | "semContrato" | "erro" | "suspenso"

const CONTRATOS_FUNC = [
  { n: "Residencial Girassol 1", p: "Porteiro", s: "ativo" },
  { n: "Residencial Girassol 2", p: "Porteiro", s: "ativo" },
  { n: "Edifício Mirante", p: "Porteiro", s: "suspenso" },
]

function EscolherCondominio({ estado = "lista" }: { estado?: EstadoEscolha }) {
  return (
    <TelaCelular>
      <PzMarca />
      <div className="grid gap-1">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Onde você trabalha hoje?</h2>
        <p className="text-muted-foreground">Carlos Mendes · Selva Vigilância</p>
      </div>
      {estado === "carregando" && (
        <div role="status" aria-label="Carregando seus condomínios" className="grid gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          <SkeletonText lines={1} />
        </div>
      )}
      {estado === "semContrato" && (
        <Card className={`${CARTAO} shadow-wc-md`}>
          <CardContent>
            <Result
              status="warning"
              icon={<LockIcon aria-hidden className="size-8" />}
              title="Você ainda não tem condomínio liberado"
              description="Sua conta da Selva existe, mas nenhum contrato ativo está ligado a você. Peça ao gestor da Selva para atribuir você a um condomínio."
              extra={<Button shape="pill" size="lg" variant="outline">Pedir ao gestor da Selva</Button>}
            />
          </CardContent>
        </Card>
      )}
      {estado === "erro" && (
        <Card className={`${CARTAO} shadow-wc-md`}>
          <CardContent>
            <Result
              status="error"
              icon={<WifiOffIcon aria-hidden className="size-8" />}
              title="Não conseguimos carregar agora"
              description="Parece falta de internet ou instabilidade. Seus dados estão salvos. Tente de novo."
              extra={<Button shape="pill" size="lg">Tentar de novo</Button>}
            />
          </CardContent>
        </Card>
      )}
      {(estado === "lista" || estado === "suspenso") && (
        <>
          <ItemGroup className="gap-2">
            {CONTRATOS_FUNC.filter((c) => estado === "suspenso" || c.s === "ativo").map((c, i) => {
              const off = c.s === "suspenso"
              return (
                <Item key={c.n} variant="outline" className={`min-h-16 rounded-2xl bg-card text-left ${off ? "opacity-80" : "shadow-wc-md"}`} asChild>
                  <button type="button" disabled={off} aria-disabled={off}>
                    <ItemMedia variant="icon"><Building2Icon aria-hidden /></ItemMedia>
                    <ItemContent>
                      <ItemTitle>{c.n}</ItemTitle>
                      <ItemDescription>{off ? "Contrato suspenso pelo condomínio" : `${c.p} · contrato ativo`}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      {off ? <Badge variant="warning"><PauseCircleIcon aria-hidden />Suspenso</Badge> : i === 0 ? <Badge variant="soft"><ClockIcon aria-hidden />Último usado</Badge> : null}
                    </ItemActions>
                  </button>
                </Item>
              )
            })}
          </ItemGroup>
          <div className="flex min-h-11 items-center gap-3">
            <Checkbox id="lembrar-local" defaultChecked />
            <Label htmlFor="lembrar-local" className="leading-snug">Lembrar a escolha neste aparelho</Label>
          </div>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheckIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            Você vê só os condomínios em que a Selva liberou o seu acesso.
          </p>
        </>
      )}
    </TelaCelular>
  )
}

/* ============ Desktop · telas de contrato e pareamento ============ */

function StatusContrato({ s }: { s: "ativo" | "proposto" | "suspenso" | "encerrado" }) {
  if (s === "ativo") return <Badge variant="success"><CheckCircle2Icon aria-hidden />Ativo</Badge>
  if (s === "proposto") return <Badge variant="warning"><ClockIcon aria-hidden />Aguardando aceite</Badge>
  if (s === "suspenso") return <Badge variant="warning"><PauseCircleIcon aria-hidden />Suspenso</Badge>
  return <Badge variant="outline"><XCircleIcon aria-hidden />Encerrado</Badge>
}

/* CTR-001 · Contratos de serviço (gestor do condomínio) */

type EstadoContratos = "lista" | "carregando" | "vazio" | "erro"

function ContratosCondominio({ estado = "lista" }: { estado?: EstadoContratos }) {
  return (
    <ShellGestao
      ativo="Configurações"
      titulo="Contratos de serviço"
      sub="Residencial Girassol 2 · empresas que trabalham na sua portaria"
      acoes={<Button size="lg" shape="pill" variant="outline"><LinkIcon aria-hidden />Convidar empresa</Button>}
    >
      {estado === "lista" && (
        <Banner variant="warning" className="rounded-2xl">
          <ClockIcon aria-hidden />
          <BannerContent>
            <BannerTitle>Selva Vigilância pediu para atender este condomínio</BannerTitle>
            <BannerDescription>Nada muda até você aceitar. Eles só poderão pôr porteiros e auditores, nunca gestores.</BannerDescription>
          </BannerContent>
          <Button size="sm" shape="pill">Revisar pedido</Button>
        </Banner>
      )}
      <Card className={CARTAO}>
        <CardContent className="grid gap-4">
          {estado === "carregando" && (
            <div role="status" aria-label="Carregando contratos" className="grid gap-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          )}
          {estado === "vazio" && (
            <EmptyState
              icon={<FileSignatureIcon aria-hidden />}
              title="Nenhuma empresa contratada ainda"
              description="Se a portaria é terceirizada, convide a empresa. Ela escolhe quem trabalha aqui e você continua mandando no acesso."
              action={<Button shape="pill"><LinkIcon aria-hidden />Convidar empresa</Button>}
            />
          )}
          {estado === "erro" && (
            <Result
              status="error"
              title="Não conseguimos carregar os contratos"
              description="Foi um problema de conexão. Nenhum contrato foi alterado."
              extra={<Button shape="pill">Tentar de novo</Button>}
            />
          )}
          {estado === "lista" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Pode atribuir</TableHead>
                  <TableHead>Funcionários</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Selva Vigilância</TableCell>
                  <TableCell>Portaria</TableCell>
                  <TableCell>Porteiro, auditor</TableCell>
                  <TableCell>3 ativos</TableCell>
                  <TableCell>04/11/2026</TableCell>
                  <TableCell><StatusContrato s="ativo" /></TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" shape="pill">Abrir</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Selva Vigilância</TableCell>
                  <TableCell>Vigilância noturna</TableCell>
                  <TableCell>Porteiro</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>aguardando</TableCell>
                  <TableCell><StatusContrato s="proposto" /></TableCell>
                  <TableCell className="text-right"><Button size="sm" shape="pill">Aceitar</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Guarda Forte</TableCell>
                  <TableCell>Portaria</TableCell>
                  <TableCell>Porteiro</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>02/2026 a 09/2026</TableCell>
                  <TableCell><StatusContrato s="encerrado" /></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" shape="pill">Ver histórico</Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {estado === "lista" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheckIcon aria-hidden className="size-4" />
          As encomendas e o histórico são sempre do condomínio, mesmo se o contrato acabar.
        </p>
      )}
    </ShellGestao>
  )
}

/* CTR-002 · Detalhe do contrato: funcionários, suspender e encerrar */

function DetalheContrato({ dialogo = "nenhum" }: { dialogo?: "nenhum" | "suspender" | "encerrar" }) {
  return (
    <ShellGestao
      ativo="Configurações"
      titulo="Selva Vigilância · Portaria"
      sub="Contrato ativo desde 04/11/2026 · Residencial Girassol 2"
      acoes={
        <>
          <Button variant="outline" size="lg" shape="pill">Pausar contrato</Button>
          <Button variant="destructive" size="lg" shape="pill"><XCircleIcon aria-hidden />Encerrar contrato</Button>
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Funcionários da Selva neste condomínio</CardTitle>
            <CardDescription>Quem a Selva atribuiu. Você pode suspender qualquer pessoa na hora.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Último acesso</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { n: "Carlos Mendes", i: "CM", p: "Porteiro", u: "hoje, 07:58", s: true },
                  { n: "Rita Oliveira", i: "RO", p: "Porteiro", u: "ontem, 18:02", s: true },
                  { n: "Jorge Lima", i: "JL", p: "Auditor", u: "há 6 dias", s: false },
                ].map((f) => (
                  <TableRow key={f.n}>
                    <TableCell><span className="flex items-center gap-3"><Avatar size="sm"><AvatarFallback>{f.i}</AvatarFallback></Avatar>{f.n}</span></TableCell>
                    <TableCell>{f.p}</TableCell>
                    <TableCell>{f.u}</TableCell>
                    <TableCell>
                      {f.s ? <Badge variant="success"><CheckCircle2Icon aria-hidden />Ativo</Badge> : <Badge variant="warning"><PauseCircleIcon aria-hidden />Suspenso por você</Badge>}
                    </TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm" shape="pill">{f.s ? "Suspender" : "Liberar"}</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader><CardTitle>O que este contrato permite</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <DescriptionList layout="vertical">
              <DescriptionItem label="Serviço">Portaria</DescriptionItem>
              <DescriptionItem label="Papéis liberados">Porteiro e auditor</DescriptionItem>
              <DescriptionItem label="Quem escolhe as pessoas">A Selva (você pode suspender)</DescriptionItem>
              <DescriptionItem label="Cobrança">Pelo condomínio, no plano atual</DescriptionItem>
            </DescriptionList>
            <p className="text-sm text-muted-foreground">Gestor e administrador nunca podem ser atribuídos por contrato.</p>
          </CardContent>
        </Card>
      </div>
      {dialogo !== "nenhum" && (
        <div className="grid min-h-[420px] place-items-center rounded-[1.6rem] bg-sunken p-8">
          <Card className={`w-full max-w-lg gap-4 ${CARTAO} shadow-wc-lg`} role="dialog" aria-modal="false">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><AlertTriangleIcon aria-hidden className="size-5 text-danger" />{dialogo === "encerrar" ? "Encerrar o contrato com a Selva?" : "Suspender Jorge Lima?"}</CardTitle>
              <CardDescription>
                {dialogo === "encerrar"
                  ? "Os 3 funcionários da Selva saem deste condomínio agora e saem dos aparelhos. O histórico de encomendas e retiradas continua com o condomínio."
                  : "Jorge perde o acesso a este condomínio agora. Os registros dele continuam no histórico. Você pode liberar depois."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field>
                <FieldLabel htmlFor={`mot-${dialogo}`}>Motivo (fica na auditoria)</FieldLabel>
                <Textarea id={`mot-${dialogo}`} rows={2} placeholder="Ex.: troca de prestadora a partir de 01/12" />
                <FieldDescription>Mínimo de 10 letras.</FieldDescription>
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="outline" shape="pill">Voltar</Button>
                <Button variant="destructive" shape="pill">{dialogo === "encerrar" ? "Encerrar contrato" : "Suspender"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ShellGestao>
  )
}

/* PAR-001 · Pareamento de aparelhos (gestor do condomínio) */

type EstadoPar = "codigo" | "vencido" | "gerando" | "aparelhos"

function Pareamento({ estado = "codigo" }: { estado?: EstadoPar }) {
  return (
    <ShellGestao
      ativo="Configurações"
      titulo="Aparelhos da portaria"
      sub="Residencial Girassol 2 · quem pode entrar por este condomínio"
      acoes={<Button size="lg" shape="pill"><QrCodeIcon aria-hidden />Gerar código novo</Button>}
    >
      <div className="grid grid-cols-[400px_minmax(0,1fr)] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Código para parear um aparelho</CardTitle>
            <CardDescription>Digite o código ou leia o QR no aparelho novo. Vale por 15 minutos.</CardDescription>
          </CardHeader>
          <CardContent className="grid justify-items-center gap-4">
            {estado === "gerando" ? (
              <div role="status" aria-label="Gerando código" className="grid justify-items-center gap-3">
                <Skeleton className="size-[200px] rounded-2xl" />
                <Skeleton className="h-8 w-40" />
              </div>
            ) : estado === "vencido" ? (
              <>
                <div className="grid size-[200px] place-items-center rounded-2xl border border-dashed bg-muted text-muted-foreground">
                  <ClockIcon aria-hidden className="size-10" />
                </div>
                <Badge variant="warning"><ClockIcon aria-hidden />Código vencido às 14:35</Badge>
                <p className="text-center text-sm text-muted-foreground">Por segurança o código não vale mais. Gere um novo.</p>
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-white p-3 shadow-wc-md"><QRCode value="https://pacotezap.app/p/GIRA2K" size={176} label="QR de pareamento GIRA2K" /></div>
                <p className="font-mono text-3xl font-bold tracking-[0.3em]">GIRA2K</p>
                <div className="flex items-center gap-2">
                  <CopyButton value="GIRA2K" label="Copiar código" showLabel />
                  <Badge variant="soft"><ClockIcon aria-hidden />Vence em 14:20</Badge>
                </div>
              </>
            )}
            <Button size="lg" shape="pill" className="w-full" disabled={estado === "gerando"}>
              {estado === "gerando" ? <><Spinner aria-hidden />Gerando…</> : "Imprimir cartaz da portaria"}
            </Button>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Aparelhos pareados</CardTitle>
            <CardDescription>Se um celular for perdido, remova aqui. Ele sai na hora.</CardDescription>
          </CardHeader>
          <CardContent>
            {estado === "aparelhos" || estado === "codigo" || estado === "vencido" || estado === "gerando" ? (
              <ItemGroup className="gap-2">
                {[
                  { n: "Celular da portaria principal", d: "Selva Vigilância · usado hoje, 07:58", ok: true },
                  { n: "Computador da administração", d: "Gestão · usado ontem, 17:40", ok: true },
                  { n: "Celular antigo da portaria", d: "Sem uso há 31 dias", ok: false },
                ].map((a) => (
                  <Item key={a.n} variant="outline" className="rounded-2xl">
                    <ItemMedia variant="icon"><SmartphoneIcon aria-hidden /></ItemMedia>
                    <ItemContent>
                      <ItemTitle>{a.n}</ItemTitle>
                      <ItemDescription>{a.d}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      {a.ok ? <Badge variant="success"><CheckCircle2Icon aria-hidden />Em uso</Badge> : <Badge variant="warning"><ClockIcon aria-hidden />Parado</Badge>}
                      <Button variant="outline" size="sm" shape="pill"><Trash2Icon aria-hidden />Remover</Button>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ShellGestao>
  )
}

/* ============ Painel da prestadora (desktop) ============ */

const NAV_PREST = [
  { label: "Condomínios", icon: <Building2Icon aria-hidden /> },
  { label: "Funcionários", icon: <UsersIcon aria-hidden /> },
  { label: "Início", icon: <HomeIcon aria-hidden /> },
]

function ShellPrestadora({ ativo, titulo, sub, acoes, children }: { ativo: string; titulo: string; sub: string; acoes?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-6">
      <Trilho ativo={ativo} itens={NAV_PREST} label="Menu da prestadora" />
      <div className="grid min-w-0 content-start gap-6">
        <header className="flex items-center justify-between gap-4">
          <Busca />
          <div className="flex items-center gap-2">
            <Button variant="outline" shape="pill"><KeyRoundIcon aria-hidden />Selva Vigilância<ChevronDownIcon aria-hidden /></Button>
            <Avatar size="lg"><AvatarFallback>SG</AvatarFallback></Avatar>
          </div>
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

type EstadoPrest = "lista" | "carregando" | "vazio" | "erro"

function PainelPrestadora({ estado = "lista" }: { estado?: EstadoPrest }) {
  return (
    <ShellPrestadora
      ativo="Condomínios"
      titulo="Condomínios que a Selva atende"
      sub="Contratos, funcionários e pedidos. Os dados das encomendas são de cada condomínio e não aparecem aqui."
      acoes={<Button size="lg" shape="pill"><UserPlusIcon aria-hidden />Atribuir funcionário</Button>}
    >
      {estado === "lista" && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Condomínios ativos" value="2" />
          <StatCard label="Funcionários atribuídos" value="7" />
          <StatCard label="Pedidos aguardando aceite" value="1" />
        </div>
      )}
      <Card className={CARTAO}>
        <CardContent className="grid gap-4">
          {estado === "carregando" && (
            <div role="status" aria-label="Carregando condomínios" className="grid gap-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          )}
          {estado === "vazio" && (
            <EmptyState
              icon={<Building2Icon aria-hidden />}
              title="A Selva ainda não atende nenhum condomínio aqui"
              description="Peça o contrato ao condomínio. Ele aceita e depois você atribui os funcionários."
              action={<Button shape="pill"><LinkIcon aria-hidden />Propor contrato a um condomínio</Button>}
            />
          )}
          {estado === "erro" && (
            <Result status="error" title="Não conseguimos carregar os contratos" description="Foi um problema de conexão. Nada foi alterado." extra={<Button shape="pill">Tentar de novo</Button>} />
          )}
          {estado === "lista" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Condomínio</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Funcionários</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Residencial Girassol 1</TableCell>
                  <TableCell>Portaria</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell><StatusContrato s="ativo" /></TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" shape="pill">Gerenciar</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Residencial Girassol 2</TableCell>
                  <TableCell>Portaria</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell><StatusContrato s="ativo" /></TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" shape="pill">Gerenciar</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Edifício Mirante</TableCell>
                  <TableCell>Vigilância noturna</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell><StatusContrato s="proposto" /></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" shape="pill">Cancelar pedido</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Torre Central</TableCell>
                  <TableCell>Portaria</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell><StatusContrato s="encerrado" /></TableCell>
                  <TableCell className="text-right"><span className="text-sm text-muted-foreground">Encerrado pelo condomínio</span></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </ShellPrestadora>
  )
}

/* Atribuir funcionário (folha aberta) */

type EstadoAtribuir = "form" | "enviando" | "erroPapel" | "sucesso"

function AtribuirFuncionario({ estado = "form" }: { estado?: EstadoAtribuir }) {
  return (
    <ShellPrestadora ativo="Funcionários" titulo="Atribuir funcionário" sub="Escolha a pessoa, o condomínio e o papel. O condomínio pode suspender depois." acoes={null}>
      <div className="grid min-h-[560px] place-items-center rounded-[1.6rem] bg-sunken p-8">
        <Card className={`w-full max-w-xl gap-4 ${CARTAO} shadow-wc-lg`}>
          {estado === "sucesso" ? (
            <CardContent>
              <Result
                status="success"
                title="Carlos Mendes foi atribuído"
                description="Ele já vê o Residencial Girassol 2 na lista depois do login. O gestor do condomínio recebeu o aviso."
                extra={<Button shape="pill">Atribuir outro funcionário</Button>}
              />
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Atribuir a um condomínio</CardTitle>
                <CardDescription>A pessoa precisa ter conta na Selva. Se não tiver, convide pelo e-mail.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <Field>
                  <FieldLabel htmlFor="at-pessoa">Funcionário</FieldLabel>
                  <NativeSelect id="at-pessoa" defaultValue="carlos">
                    <NativeSelectOption value="carlos">Carlos Mendes · c•••••@selva.com.br</NativeSelectOption>
                    <NativeSelectOption value="rita">Rita Oliveira · r••••@selva.com.br</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field>
                  <FieldLabel htmlFor="at-cond">Condomínio</FieldLabel>
                  <NativeSelect id="at-cond" defaultValue="g2">
                    <NativeSelectOption value="g1">Residencial Girassol 1 · Portaria</NativeSelectOption>
                    <NativeSelectOption value="g2">Residencial Girassol 2 · Portaria</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field>
                  <FieldLabel htmlFor="at-papel">Papel</FieldLabel>
                  <NativeSelect id="at-papel" defaultValue={estado === "erroPapel" ? "gestor" : "porteiro"} aria-invalid={estado === "erroPapel"}>
                    <NativeSelectOption value="porteiro">Porteiro</NativeSelectOption>
                    <NativeSelectOption value="auditor">Auditor (só ver)</NativeSelectOption>
                    {estado === "erroPapel" && <NativeSelectOption value="gestor">Gestor</NativeSelectOption>}
                  </NativeSelect>
                  {estado === "erroPapel" ? (
                    <FieldError>Este contrato não permite o papel Gestor. Escolha Porteiro ou Auditor.</FieldError>
                  ) : (
                    <FieldDescription>Só os papéis liberados no contrato aparecem aqui.</FieldDescription>
                  )}
                </Field>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" shape="pill">Cancelar</Button>
                  <Button shape="pill" disabled={estado === "enviando" || estado === "erroPapel"} aria-busy={estado === "enviando"}>
                    {estado === "enviando" ? <><Spinner aria-hidden />Atribuindo…</> : "Atribuir"}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </ShellPrestadora>
  )
}

/* ============ Página ============ */

export function Prestadora() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={NEVOA} className="min-h-dvh bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)] gap-16">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 04/11/2026 · WebCode UI · Névoa + Brasa · D20</p>
          <h1 className="font-display text-5xl font-bold">Prestadora e login por local</h1>
          <p className="max-w-3xl text-muted-foreground">
            Empresas como a Selva atendem vários condomínios por contrato. O condomínio aceita e pode encerrar quando quiser. O aparelho da portaria entra por código ou QR
            (sem busca por nome), a lista de condomínios só aparece depois do login e a lista de funcionários fica só no aparelho. Nomes e códigos são exemplos.
          </p>
        </header>

        <Grupo id="p-codigo" titulo="1 · Entrar com o código do local" texto="Primeira vez no aparelho. O gestor do condomínio gera o código (PAR-001); o aparelho lembra o local e a etapa some nas próximas vezes.">
          <Linha>
            <Prancha id="LOC-001" titulo="Digitar o código"><EntrarComCodigo estado="vazio" /></Prancha>
            <Prancha id="LOC-001" titulo="Conferindo"><EntrarComCodigo estado="conferindo" /></Prancha>
            <Prancha id="LOC-001" titulo="Código inválido ou vencido"><EntrarComCodigo estado="erro" /></Prancha>
            <Prancha id="LOC-001" titulo="Muitas tentativas"><EntrarComCodigo estado="bloqueado" /></Prancha>
            <Prancha id="LOC-001" titulo="Sem internet"><EntrarComCodigo estado="offline" /></Prancha>
            <Prancha id="LOC-001" titulo="Aparelho pareado"><EntrarComCodigo estado="ok" /></Prancha>
          </Linha>
        </Grupo>

        <Grupo id="p-lista" titulo="2 · Quem vai entrar neste aparelho" texto="Depois de pareado, a tela de senha mostra quem já entrou ali, para não digitar o e-mail. A lista vive só no aparelho, a senha é sempre pedida e dá para remover pessoas. Some sozinha após 30 dias sem uso.">
          <Linha>
            <Prancha id="LOC-002" titulo="Escolher a pessoa"><ListaDoAparelho estado="lista" /></Prancha>
            <Prancha id="LOC-002" titulo="Pedir a senha"><ListaDoAparelho estado="senha" /></Prancha>
            <Prancha id="LOC-002" titulo="Senha incorreta"><ListaDoAparelho estado="senhaErrada" /></Prancha>
            <Prancha id="LOC-002" titulo="Entrando"><ListaDoAparelho estado="entrando" /></Prancha>
            <Prancha id="LOC-002" titulo="Remover do aparelho"><ListaDoAparelho estado="remover" /></Prancha>
            <Prancha id="LOC-002" titulo="Aparelho sem ninguém"><ListaDoAparelho estado="vazia" /></Prancha>
          </Linha>
        </Grupo>

        <Grupo id="p-escolha" titulo="3 · Escolher o condomínio (quem é da prestadora)" texto="Só depois do login. Mostra apenas os contratos daquele funcionário. A escolha pode ficar guardada no aparelho. Contrato suspenso aparece, mas não abre.">
          <Linha>
            <Prancha id="LOC-003" titulo="Lista de condomínios"><EscolherCondominio estado="lista" /></Prancha>
            <Prancha id="LOC-003" titulo="Carregando"><EscolherCondominio estado="carregando" /></Prancha>
            <Prancha id="LOC-003" titulo="Contrato suspenso"><EscolherCondominio estado="suspenso" /></Prancha>
            <Prancha id="LOC-003" titulo="Sem condomínio liberado"><EscolherCondominio estado="semContrato" /></Prancha>
            <Prancha id="LOC-003" titulo="Erro de conexão"><EscolherCondominio estado="erro" /></Prancha>
          </Linha>
        </Grupo>

        <Grupo id="p-contratos" titulo="4 · Contratos no painel do condomínio" texto="O gestor do condomínio manda no acesso: aceita o pedido da empresa, suspende pessoas e encerra o contrato quando quiser. O histórico de encomendas fica sempre com o condomínio.">
          <Moldura id="CTR-001" titulo="Contratos de serviço" nota="Lista com pedido aguardando aceite, contratos ativos e encerrados.">
            <ContratosCondominio estado="lista" />
          </Moldura>
          <Moldura id="CTR-001 · carregando" titulo="Carregando" nota="Esqueleto no lugar da tabela.">
            <ContratosCondominio estado="carregando" />
          </Moldura>
          <Moldura id="CTR-001 · vazio" titulo="Nenhuma empresa contratada" nota="Primeiro uso: convida a empresa.">
            <ContratosCondominio estado="vazio" />
          </Moldura>
          <Moldura id="CTR-001 · erro" titulo="Erro ao carregar" nota="Diz que nada foi alterado e oferece tentar de novo.">
            <ContratosCondominio estado="erro" />
          </Moldura>
          <Moldura id="CTR-002" titulo="Detalhe do contrato" nota="Funcionários da empresa neste condomínio, com suspender e liberar.">
            <DetalheContrato />
          </Moldura>
          <Moldura id="CTR-002 · suspender" titulo="Suspender funcionário" nota="Motivo obrigatório, fica na auditoria. A pessoa sai na hora.">
            <DetalheContrato dialogo="suspender" />
          </Moldura>
          <Moldura id="CTR-002 · encerrar" titulo="Encerrar contrato" nota="Ação crítica. Diz o efeito: os funcionários saem agora e o histórico fica com o condomínio.">
            <DetalheContrato dialogo="encerrar" />
          </Moldura>
        </Grupo>

        <Grupo id="p-pareamento" titulo="5 · QR de pareamento do aparelho" texto="O gestor do condomínio gera o código de 6 letras e números, com QR, que vale 15 minutos. Também remove aparelhos perdidos.">
          <Moldura id="PAR-001" titulo="Código e aparelhos pareados" nota="QR e código para o aparelho novo; lista de aparelhos com remover.">
            <Pareamento estado="codigo" />
          </Moldura>
          <Moldura id="PAR-001 · gerando" titulo="Gerando" nota="Esqueleto no QR enquanto o código nasce.">
            <Pareamento estado="gerando" />
          </Moldura>
          <Moldura id="PAR-001 · vencido" titulo="Código vencido" nota="Mostra que venceu e pede um novo.">
            <Pareamento estado="vencido" />
          </Moldura>
        </Grupo>

        <Grupo id="p-prestadora" titulo="6 · Painel da prestadora" texto="Para o gestor da Selva: seus condomínios, pedidos e funcionários. Não mostra nenhum dado de encomenda ou morador, só contratos e pessoas.">
          <Moldura id="PRE-001" titulo="Condomínios que a Selva atende" nota="Resumo e tabela de contratos, inclusive pedido aguardando e contrato encerrado pelo condomínio.">
            <PainelPrestadora estado="lista" />
          </Moldura>
          <Moldura id="PRE-001 · carregando" titulo="Carregando" nota="Esqueleto no lugar da tabela.">
            <PainelPrestadora estado="carregando" />
          </Moldura>
          <Moldura id="PRE-001 · vazio" titulo="Nenhum condomínio ainda" nota="Pede o contrato ao condomínio.">
            <PainelPrestadora estado="vazio" />
          </Moldura>
          <Moldura id="PRE-001 · erro" titulo="Erro ao carregar" nota="Nada foi alterado; tenta de novo.">
            <PainelPrestadora estado="erro" />
          </Moldura>
          <Moldura id="PRE-002" titulo="Atribuir funcionário" nota="Pessoa, condomínio e papel. Só aparecem papéis liberados no contrato.">
            <AtribuirFuncionario estado="form" />
          </Moldura>
          <Moldura id="PRE-002 · enviando" titulo="Atribuindo" nota="Botão desabilitado com indicador.">
            <AtribuirFuncionario estado="enviando" />
          </Moldura>
          <Moldura id="PRE-002 · erro" titulo="Papel não permitido" nota="Mensagem diz o que aconteceu e o que escolher.">
            <AtribuirFuncionario estado="erroPapel" />
          </Moldura>
          <Moldura id="PRE-002 · pronto" titulo="Funcionário atribuído" nota="Confirma e avisa que o gestor do condomínio foi notificado.">
            <AtribuirFuncionario estado="sucesso" />
          </Moldura>
        </Grupo>
      </div>
    </div>
  )
}
