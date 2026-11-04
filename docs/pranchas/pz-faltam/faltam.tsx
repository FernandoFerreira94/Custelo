"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  BarChart3Icon,
  Building2Icon,
  CameraOffIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleHelpIcon,
  ClipboardListIcon,
  ClockIcon,
  CloudOffIcon,
  DatabaseIcon,
  FileDownIcon,
  FileTextIcon,
  HistoryIcon,
  InboxIcon,
  KeyRoundIcon,
  LinkIcon,
  LogOutIcon,
  MailIcon,
  MessageCircleIcon,
  PackageIcon,
  PlusIcon,
  RefreshCwIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SnowflakeIcon,
  Trash2Icon,
  UploadIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
  WifiOffIcon,
  XCircleIcon,
} from "lucide-react"

import { NEVOA, Prancha } from "../pranchas/pranchas"
import { ShellOrg, NAV_ORG } from "../pz-config/config"
import { Busca, Moldura, Perfil, Trilho } from "../pz-dash/painel"
import { ShellGestao } from "../pz-gestao/gestao"
import { Admin } from "../pz-plataforma/plataforma"
import { PzMarca, PzSimbolo } from "../pz-marca/marca"
import { Alert, AlertDescription, AlertTitle } from "@/registry/webcode/ui/alert"
import { Avatar, AvatarFallback } from "@/registry/webcode/ui/avatar"
import { Badge } from "@/registry/webcode/ui/badge"
import { Banner, BannerContent, BannerDescription, BannerTitle } from "@/registry/webcode/ui/banner"
import { BarChart } from "@/registry/webcode/ui/bar-chart"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Checkbox } from "@/registry/webcode/ui/checkbox"
import { EmptyState } from "@/registry/webcode/ui/empty"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/webcode/ui/field"
import { Input } from "@/registry/webcode/ui/input"
import { InputPhone } from "@/registry/webcode/ui/input-phone"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { Label } from "@/registry/webcode/ui/label"
import { NativeSelect, NativeSelectOption } from "@/registry/webcode/ui/native-select"
import { Progress } from "@/registry/webcode/ui/progress"
import {
  RadioGroup,
  RadioGroupCard,
  RadioGroupCardContent,
  RadioGroupCardDescription,
  RadioGroupCardTitle,
} from "@/registry/webcode/ui/radio-group"
import { Result } from "@/registry/webcode/ui/result"
import { SearchBar } from "@/registry/webcode/ui/search-bar"
import { Separator } from "@/registry/webcode/ui/separator"
import { Skeleton, SkeletonTable, SkeletonText } from "@/registry/webcode/ui/skeleton"
import { Spinner } from "@/registry/webcode/ui/spinner"
import { StatCard } from "@/registry/webcode/ui/stat-card"
import { Stepper } from "@/registry/webcode/ui/stepper"
import { Switch } from "@/registry/webcode/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/webcode/ui/table"
import { Textarea } from "@/registry/webcode/ui/textarea"

// Pranchas que faltavam no plano mestre (04/11/2026, seção 6.3). Névoa + Brasa, só WebCode UI, sem vidro.
// Estado sempre com cor + texto + ícone. Nomes, números e textos legais são exemplos.

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

/** Diálogo desenhado parado para a prancha. Na tela real é o Dialog/AlertDialog da biblioteca. */
function DialogoParado({ children, largura = "max-w-lg" }: { children: React.ReactNode; largura?: string }) {
  return (
    <div className="grid min-h-[560px] place-items-center rounded-[1.6rem] bg-sunken p-8">
      <Card className={`w-full ${largura} gap-4 rounded-3xl shadow-wc-lg`} role="dialog" aria-modal="false">{children}</Card>
    </div>
  )
}

/** Cartões pequenos com os estados de uma tela: carregando, vazio, erro. */
function Estados({ itens }: { itens: { titulo: string; children: React.ReactNode }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {itens.map((e) => (
        <Card key={e.titulo} className="gap-3 rounded-3xl py-4">
          <CardHeader className="px-4"><p className="text-xs font-semibold text-muted-foreground uppercase">{e.titulo}</p></CardHeader>
          <CardContent className="px-4">{e.children}</CardContent>
        </Card>
      ))}
    </div>
  )
}

/* =====================================================================
   1 · OPT-IN DO MORADOR (página pública, celular)
   ===================================================================== */

function Topo({ condominio = "Residencial Vila Verde" }: { condominio?: string }) {
  return (
    <header className="grid gap-3 px-5 pt-6">
      <PzMarca texto="text-xl" simbolo="size-8" />
      <p className="text-sm text-muted-foreground"><Building2Icon aria-hidden className="me-1 inline size-4" />{condominio}</p>
    </header>
  )
}

function PaginaPublica({ children, rodape }: { children: React.ReactNode; rodape?: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <Topo />
        <div className="grid gap-5 px-5 pt-5">{children}</div>
      </div>
      {rodape && <div className="grid gap-2 px-5 pt-3 pb-5">{rodape}</div>}
    </div>
  )
}

function OptInForm({ cartaz = false, enviando = false, invalido = false }: { cartaz?: boolean; enviando?: boolean; invalido?: boolean }) {
  return (
    <PaginaPublica
      rodape={
        <>
          <Button shape="pill" size="lg" disabled={enviando} aria-busy={enviando}>
            {enviando ? <><Spinner aria-hidden />Enviando…</> : "Quero receber avisos"}
          </Button>
          <p className="text-center text-xs text-muted-foreground"><a href="#privacidade" className="underline underline-offset-4">Política de privacidade</a></p>
        </>
      }
    >
      <div className="grid gap-1">
        <h1 className="font-display text-2xl font-bold">Quero receber avisos de encomenda</h1>
        <p className="text-sm text-muted-foreground">Quando chegar algo para você na portaria, a gente avisa.</p>
      </div>
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        {cartaz ? (
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="oc-bloco">Bloco</FieldLabel>
              <NativeSelect id="oc-bloco" defaultValue="b">
                <NativeSelectOption value="a">Bloco A</NativeSelectOption>
                <NativeSelectOption value="b">Bloco B</NativeSelectOption>
                <NativeSelectOption value="c">Bloco C</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="oc-apto">Apartamento</FieldLabel>
              <Input id="oc-apto" inputMode="numeric" defaultValue="304" />
            </Field>
          </div>
        ) : (
          <Card className="gap-1 rounded-2xl py-3">
            <CardContent className="flex items-center justify-between px-4">
              <span className="text-sm text-muted-foreground">Unidade</span>
              <span className="font-mono font-semibold">B-304</span>
            </CardContent>
          </Card>
        )}
        <Field>
          <FieldLabel htmlFor={`o-nome-${cartaz}`}>Seu nome</FieldLabel>
          <Input id={`o-nome-${cartaz}`} autoComplete="name" defaultValue="Mariana Souza" />
        </Field>
        <Field data-invalid={invalido || undefined}>
          <FieldLabel htmlFor={`o-zap-${cartaz}-${invalido}`}>WhatsApp</FieldLabel>
          <InputPhone id={`o-zap-${cartaz}-${invalido}`} accept="mobile" defaultValue={invalido ? "1134567" : "11987654321"} aria-invalid={invalido || undefined} aria-describedby={invalido ? "o-zap-erro" : undefined} />
          {invalido && <FieldError id="o-zap-erro">Esse número não parece de celular. Confira o DDD e os 9 dígitos.</FieldError>}
        </Field>
        <Field>
          <FieldLabel htmlFor={`o-mail-${cartaz}`}>E-mail (opcional)</FieldLabel>
          <Input id={`o-mail-${cartaz}`} type="email" autoComplete="email" placeholder="voce@email.com" />
        </Field>
        <div className="flex items-start gap-3 rounded-2xl border bg-card p-3">
          <Checkbox id={`o-aceite-${cartaz}`} defaultChecked className="mt-0.5" />
          <Label htmlFor={`o-aceite-${cartaz}`} className="leading-snug font-normal">
            Concordo em receber avisos de encomenda deste condomínio. Posso sair quando quiser respondendo SAIR.
          </Label>
        </div>
        {cartaz && <p className="text-xs text-muted-foreground">Pelo cartaz, a administração confirma seu cadastro antes do primeiro aviso.</p>}
      </form>
    </PaginaPublica>
  )
}

function OptInSucesso() {
  return (
    <PaginaPublica rodape={<Button variant="ghost" shape="pill">Sair dos avisos</Button>}>
      <Result status="success" title="Pronto!" description="Você vai receber os avisos no (11) 98765-4321." />
      <Alert variant="info">
        <MessageCircleIcon aria-hidden />
        <AlertTitle>Como chega</AlertTitle>
        <AlertDescription>Uma mensagem do PacoteZap com a unidade e onde retirar. Nunca pedimos senha nem pagamento.</AlertDescription>
      </Alert>
    </PaginaPublica>
  )
}

function OptInVencido() {
  return (
    <PaginaPublica>
      <Result status="warning" title="Este link venceu" description="Convites valem 7 dias. Peça um novo na portaria ou use o QR do cartaz." />
      <Button variant="outline" shape="pill" size="lg"><RefreshCwIcon aria-hidden />Pedir novo link</Button>
    </PaginaPublica>
  )
}

function OptInJaCadastrado() {
  return (
    <PaginaPublica>
      <Result status="info" title="Este número já recebe avisos" description="(11) 9••••-4321 já está na B-304. Não precisa fazer nada." />
      <Button variant="outline" shape="pill" size="lg">Usar outro número</Button>
    </PaginaPublica>
  )
}

/* =====================================================================
   2 · PEDIDO DO TITULAR (LGPD)
   ===================================================================== */

function TitularPublico() {
  return (
    <PaginaPublica rodape={<Button shape="pill" size="lg">Enviar pedido</Button>}>
      <div className="grid gap-1">
        <h1 className="font-display text-2xl font-bold">Seus dados no PacoteZap</h1>
        <p className="text-sm text-muted-foreground">A administração do condomínio responde em até 15 dias.</p>
      </div>
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <RadioGroup defaultValue="copia" aria-label="O que você quer" className="grid gap-2">
          {[
            ["copia", "Receber uma cópia dos meus dados", FileDownIcon],
            ["corrigir", "Corrigir um dado", ClipboardListIcon],
            ["excluir", "Excluir meus dados", Trash2Icon],
            ["parar", "Parar de receber avisos", XCircleIcon],
          ].map(([v, t, Icon]) => {
            const I = Icon as typeof FileDownIcon
            return (
              <RadioGroupCard key={v as string} value={v as string}>
                <RadioGroupCardContent>
                  <RadioGroupCardTitle className="flex items-center gap-2"><I aria-hidden className="size-4" />{t as string}</RadioGroupCardTitle>
                </RadioGroupCardContent>
              </RadioGroupCard>
            )
          })}
        </RadioGroup>
        <Field>
          <FieldLabel htmlFor="t-nome">Nome</FieldLabel>
          <Input id="t-nome" autoComplete="name" defaultValue="Helena Prado" />
        </Field>
        <Field>
          <FieldLabel htmlFor="t-uni">Unidade</FieldLabel>
          <Input id="t-uni" defaultValue="B-305" />
        </Field>
        <Field>
          <FieldLabel htmlFor="t-contato">Contato para a resposta</FieldLabel>
          <Input id="t-contato" type="email" defaultValue="helena@email.com" />
          <FieldDescription>Só usamos para responder este pedido.</FieldDescription>
        </Field>
      </form>
    </PaginaPublica>
  )
}

function TitularEnviado() {
  return (
    <PaginaPublica>
      <Result status="success" title="Pedido registrado" description="A administração responde até 19/11 no e-mail helena@email.com." />
      <Card className="gap-1 rounded-2xl py-3">
        <CardContent className="flex items-center justify-between px-4">
          <span className="text-sm text-muted-foreground">Protocolo</span>
          <span className="font-mono font-semibold">LGPD-2611-0007</span>
        </CardContent>
      </Card>
    </PaginaPublica>
  )
}

const PEDIDOS = [
  { quem: "Helena Prado · B-305", tipo: "Cópia dos dados", chegou: "Página pública", prazo: "19/11", situacao: "novo" },
  { quem: "Roberto Lima · A-304", tipo: "Excluir dados", chegou: "Portaria", prazo: "12/11", situacao: "bloqueado" },
  { quem: "Carla Nunes · B-034", tipo: "Parar avisos", chegou: "WhatsApp", prazo: "18/11", situacao: "novo" },
] as const

function PedidosTitular() {
  return (
    <ShellGestao ativo="" titulo="Pedidos de titular (LGPD)" sub="Cópia, correção, exclusão e saída dos avisos. Cada ação fica na auditoria.">
      <div className="flex justify-end">
        <Button shape="pill"><PlusIcon aria-hidden />Registrar pedido</Button>
      </div>
      <Card className={CARTAO}>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Como chegou</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PEDIDOS.map((p) => (
                <TableRow key={p.quem}>
                  <TableCell className="font-medium">{p.quem}</TableCell>
                  <TableCell>{p.tipo}</TableCell>
                  <TableCell className="text-muted-foreground">{p.chegou}</TableCell>
                  <TableCell><Badge variant="outline"><ClockIcon aria-hidden />{p.prazo}</Badge></TableCell>
                  <TableCell className="text-right">
                    {p.tipo === "Cópia dos dados" && <Button size="sm" shape="pill"><FileDownIcon aria-hidden />Gerar arquivo</Button>}
                    {p.tipo === "Parar avisos" && <Button size="sm" shape="pill"><XCircleIcon aria-hidden />Parar avisos</Button>}
                    {p.situacao === "bloqueado" && (
                      <span className="inline-flex items-center gap-2">
                        <Badge variant="warning"><PackageIcon aria-hidden />1 encomenda na portaria</Badge>
                        <Button size="sm" variant="outline" shape="pill" disabled>Excluir dados</Button>
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-3 text-xs text-muted-foreground">Encomenda pendente impede a exclusão: primeiro ela é retirada ou devolvida.</p>
        </CardContent>
      </Card>
    </ShellGestao>
  )
}

function RegistrarPedido() {
  return (
    <div className="grid min-h-[620px] grid-cols-[1fr_440px] overflow-hidden rounded-[1.6rem] bg-sunken">
      <div aria-hidden className="p-8 text-sm font-semibold text-muted-foreground">CFG-008 · Pedidos de titular</div>
      <section aria-label="Registrar pedido" className="flex flex-col gap-5 border-s bg-card p-6 shadow-wc-lg">
        <header className="grid gap-1">
          <h3 className="font-display text-xl font-bold">Registrar pedido</h3>
          <p className="text-sm text-muted-foreground">Quando o morador pede na portaria, por e-mail ou WhatsApp.</p>
        </header>
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <Field>
            <FieldLabel htmlFor="rp-quem">Pessoa</FieldLabel>
            <SearchBar id="rp-quem" placeholder="Nome ou unidade" aria-label="Buscar pessoa" defaultValue="Roberto Lima · A-304" cancel="never" inputClassName="rounded-full border bg-card" />
          </Field>
          <Field>
            <FieldLabel htmlFor="rp-tipo">Pedido</FieldLabel>
            <NativeSelect id="rp-tipo" defaultValue="excluir">
              <NativeSelectOption value="copia">Cópia dos dados</NativeSelectOption>
              <NativeSelectOption value="corrigir">Corrigir dado</NativeSelectOption>
              <NativeSelectOption value="excluir">Excluir dados</NativeSelectOption>
              <NativeSelectOption value="parar">Parar avisos</NativeSelectOption>
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="rp-canal">Como chegou</FieldLabel>
              <NativeSelect id="rp-canal" defaultValue="portaria">
                <NativeSelectOption value="portaria">Portaria</NativeSelectOption>
                <NativeSelectOption value="email">E-mail</NativeSelectOption>
                <NativeSelectOption value="whatsapp">WhatsApp</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="rp-data">Data</FieldLabel>
              <Input id="rp-data" defaultValue="28/10/2026" inputMode="numeric" />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="rp-obs">Observação</FieldLabel>
            <Textarea id="rp-obs" rows={2} defaultValue="Pediu pessoalmente; mudou-se em outubro." />
          </Field>
          <Alert variant="info">
            <ClockIcon aria-hidden />
            <AlertTitle>Prazo: 12/11/2026</AlertTitle>
            <AlertDescription>15 dias a partir da data do pedido.</AlertDescription>
          </Alert>
        </form>
        <div className="mt-auto flex justify-end gap-2">
          <Button variant="ghost" shape="pill">Cancelar</Button>
          <Button shape="pill">Registrar</Button>
        </div>
      </section>
    </div>
  )
}

function ExcluirDados() {
  return (
    <DialogoParado>
      <CardHeader>
        <span aria-hidden className="grid size-12 place-items-center rounded-full bg-danger-soft text-danger"><Trash2Icon className="size-6" /></span>
        <CardTitle className="text-xl">Excluir dados de Carla Nunes?</CardTitle>
        <CardDescription>Nome, telefone e e-mail saem do cadastro. Isso não pode ser desfeito.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Alert variant="warning">
          <ScaleIcon aria-hidden />
          <AlertTitle>O histórico de custódia fica</AlertTitle>
          <AlertDescription>As encomendas recebidas e retiradas continuam guardadas até o fim do prazo legal (5 anos), com o nome trocado por “Morador excluído”.</AlertDescription>
        </Alert>
        <Field>
          <FieldLabel htmlFor="ex-motivo">Motivo (obrigatório)</FieldLabel>
          <Textarea id="ex-motivo" rows={2} defaultValue="Pedido do titular LGPD-2611-0005." />
        </Field>
        <Field>
          <FieldLabel htmlFor="ex-conf">Digite EXCLUIR para confirmar</FieldLabel>
          <Input id="ex-conf" defaultValue="EXCLUIR" autoComplete="off" />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" shape="pill">Cancelar</Button>
          <Button variant="destructive" shape="pill"><Trash2Icon aria-hidden />Excluir dados</Button>
        </div>
      </CardContent>
    </DialogoParado>
  )
}

/* =====================================================================
   3 · TERMOS E PRIVACIDADE
   ===================================================================== */

const SECOES = ["Quem somos", "Que dados usamos", "Para que usamos", "Quanto tempo guardamos", "Seus direitos", "Contato do encarregado"]

function Termos() {
  return (
    <div className="grid grid-cols-[240px_minmax(0,1fr)] gap-10 rounded-[1.6rem] bg-background p-10">
      <aside className="grid content-start gap-6">
        <PzMarca texto="text-xl" simbolo="size-8" />
        <nav aria-label="Nesta página" className="grid gap-1 text-sm">
          <p className="mb-1 font-semibold">Nesta página</p>
          {SECOES.map((s, i) => (
            <a key={s} href={`#pv-${i}`} className={`rounded-full px-3 py-2 ${i === 1 ? "bg-card font-medium shadow-wc-xs" : "text-muted-foreground hover:bg-accent"}`}>{s}</a>
          ))}
        </nav>
      </aside>
      <article className="grid max-w-[68ch] content-start gap-6">
        <header className="grid gap-2">
          <Badge variant="outline" className="w-fit">Versão 1.2 · vale desde 04/11/2026</Badge>
          <h1 className="font-display text-4xl font-bold">Política de privacidade</h1>
          <p className="text-muted-foreground">Texto de exemplo. A versão final vem do jurídico.</p>
        </header>
        {SECOES.slice(0, 3).map((s, i) => (
          <section key={s} id={`pv-${i}`} className="grid gap-2">
            <h2 className="font-display text-2xl font-bold">{i + 1}. {s}</h2>
            <p className="leading-relaxed text-muted-foreground">
              Exemplo de texto. O PacoteZap guarda o mínimo para registrar quem recebeu, onde a encomenda ficou e quem retirou. A foto da etiqueta é privada e só a equipe do condomínio vê.
            </p>
          </section>
        ))}
        <Separator />
        <p className="text-sm text-muted-foreground">Também: <a href="#termos" className="font-medium text-brand underline underline-offset-4">Termos de uso</a></p>
      </article>
    </div>
  )
}

function AceiteNovaVersao() {
  return (
    <DialogoParado largura="max-w-xl">
      <CardHeader>
        <PzSimbolo className="size-10" />
        <CardTitle className="text-xl">Atualizamos os termos</CardTitle>
        <CardDescription>Para continuar usando o PacoteZap, leia o que mudou e aceite a nova versão.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ul className="grid gap-2 rounded-2xl border bg-sunken p-4 text-sm">
          {["A foto da etiqueta agora fica 90 dias (antes eram 180).", "Novo canal de pedido LGPD pela página pública.", "O encarregado de dados mudou de contato."].map((t) => (
            <li key={t} className="flex items-start gap-2"><CheckCircle2Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />{t}</li>
          ))}
        </ul>
        <p className="text-sm">
          Leia completos: <a href="#termos" className="font-medium text-brand underline underline-offset-4">Termos de uso</a> e{" "}
          <a href="#privacidade" className="font-medium text-brand underline underline-offset-4">Política de privacidade</a>.
        </p>
        <div className="flex items-start gap-3">
          <Checkbox id="ac-ok" className="mt-0.5" />
          <Label htmlFor="ac-ok" className="font-normal">Li e aceito os termos de uso e a política de privacidade (versão 1.2).</Label>
        </div>
        <div className="flex justify-between gap-2">
          <Button variant="ghost" shape="pill"><LogOutIcon aria-hidden />Sair</Button>
          <Button shape="pill" size="lg" disabled>Li e aceito</Button>
        </div>
        <p className="text-xs text-muted-foreground">Sem aceitar, não dá para entrar. O aceite fica registrado com data e versão.</p>
      </CardContent>
    </DialogoParado>
  )
}

function CheckboxEntrada() {
  return (
    <div className="grid min-h-[260px] place-items-center rounded-[1.6rem] bg-sunken p-8">
      <Card className="w-full max-w-md gap-3 rounded-3xl py-5">
        <CardContent className="grid gap-4 px-5">
          <div className="flex items-start gap-3">
            <Checkbox id="en-termos" defaultChecked className="mt-0.5" />
            <Label htmlFor="en-termos" className="block leading-snug font-normal">
              <span>Li e aceito os</span>{" "} <a href="#termos" className="font-medium text-brand underline underline-offset-4">termos de uso</a> e a{" "}
              <a href="#privacidade" className="font-medium text-brand underline underline-offset-4">política de privacidade</a>.
            </Label>
          </div>
          <Button shape="pill" size="lg">Entrar</Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* =====================================================================
   4 · IMPLANTAÇÃO — PASSOS FINAIS
   ===================================================================== */

const PASSOS = [
  { title: "Dados", description: "Feito" },
  { title: "Endereço", description: "Feito" },
  { title: "Blocos e unidades", description: "212 unidades" },
  { title: "Moradores", description: "184 importados" },
  { title: "Equipe", description: "3 convites" },
  { title: "Regras", description: "Padrão" },
  { title: "WhatsApp", description: "Para depois" },
  { title: "Revisão", description: "Agora" },
]

function Implantacao({ atual, children }: { atual: number; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-6">
      <Card className={`${CARTAO} self-start`}>
        <CardHeader>
          <CardTitle>Implantação</CardTitle>
          <CardDescription>Residencial Vila Verde. Dá para sair e voltar.</CardDescription>
        </CardHeader>
        <CardContent><Stepper steps={PASSOS} current={atual} orientation="vertical" /></CardContent>
      </Card>
      <div className="grid min-w-0 content-start gap-6">{children}</div>
    </div>
  )
}

function Revisao() {
  const itens: [string, string, "ok" | "falta" | "opcional", string][] = [
    ["Blocos e unidades", "212 unidades em 3 blocos", "ok", ""],
    ["Moradores", "184 de 212 unidades com alguém", "ok", "28 sem morador: os avisos vão para a portaria"],
    ["Equipe", "1 gestor e 2 porteiros convidados", "ok", "1 convite ainda não aceito"],
    ["Regras", "Prazo 7 dias · avisos das 7h às 22h", "ok", ""],
    ["WhatsApp", "Número ainda não conectado", "falta", "Sem isso, os avisos saem só por e-mail"],
  ]
  return (
    <Implantacao atual={7}>
      <div>
        <h2 className="font-display text-4xl font-bold">Revisão e ativação</h2>
        <p className="text-muted-foreground">O condomínio só fica pronto para operar quando você ativar.</p>
      </div>
      <Card className={CARTAO}>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-4">
            <Progress value={80} aria-label="4 de 5 itens prontos" className="flex-1" />
            <span className="text-sm font-medium">4 de 5 prontos</span>
          </div>
          <ItemGroup className="gap-2">
            {itens.map(([t, d, s, n]) => (
              <Item key={t} variant="outline" className="rounded-2xl">
                <ItemMedia variant="icon" className={s === "ok" ? "text-success" : "text-warning"}>
                  {s === "ok" ? <CheckCircle2Icon aria-hidden /> : <AlertTriangleIcon aria-hidden />}
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{t} <Badge variant={s === "ok" ? "success" : "warning"}>{s === "ok" ? "Pronto" : "Falta"}</Badge></ItemTitle>
                  <ItemDescription>{d}{n && ` · ${n}`}</ItemDescription>
                </ItemContent>
                <ItemActions><Button size="sm" variant={s === "falta" ? "default" : "outline"} shape="pill">{s === "falta" ? "Conectar" : "Ver"}</Button></ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Pode ativar sem WhatsApp e conectar depois.</p>
        <Button shape="pill" size="lg">Começar a operar<ArrowRightIcon aria-hidden /></Button>
      </div>
    </Implantacao>
  )
}

function PassosMeio() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className={CARTAO}>
        <CardHeader>
          <CardTitle>4 · Importar moradores</CardTitle>
          <CardDescription>Planilha ou PDF da administradora. Pode pular e cadastrar depois.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid place-items-center gap-2 rounded-2xl border border-dashed bg-sunken p-6 text-center">
            <UploadIcon aria-hidden className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Arraste a planilha ou o PDF</p>
            <p className="text-xs text-muted-foreground">.xlsx, .csv ou .pdf até 10 MB</p>
          </div>
          <div className="flex justify-between"><Button variant="ghost" shape="pill">Pular por agora</Button><Button variant="outline" shape="pill"><FileDownIcon aria-hidden />Baixar modelo</Button></div>
        </CardContent>
      </Card>
      <Card className={CARTAO}>
        <CardHeader>
          <CardTitle>5 · Convidar a equipe</CardTitle>
          <CardDescription>Cada pessoa recebe um link que vale 7 dias.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {[["carlos@vilaverde.com.br", "Porteiro", "Aceito"], ["rita@vilaverde.com.br", "Porteira", "Enviado"], ["marina.alves@vilaverde.com.br", "Gestora", "Aceito"]].map(([e, p, s]) => (
            <div key={e} className="flex items-center gap-2 text-sm">
              <span className="flex-1 truncate">{e}</span>
              <Badge variant="outline">{p}</Badge>
              <Badge variant={s === "Aceito" ? "success" : "soft"}>{s === "Aceito" ? <CheckCircle2Icon aria-hidden /> : <MailIcon aria-hidden />}{s}</Badge>
            </div>
          ))}
          <Button variant="outline" shape="pill" className="justify-self-start"><UserPlusIcon aria-hidden />Convidar mais</Button>
        </CardContent>
      </Card>
      <Card className={CARTAO}>
        <CardHeader>
          <CardTitle>6 · Regras</CardTitle>
          <CardDescription>Já vêm preenchidas com o padrão. Mude só se precisar.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field><FieldLabel htmlFor="r-prazo">Lembrar depois de</FieldLabel><Input id="r-prazo" defaultValue="3 dias" /></Field>
            <Field><FieldLabel htmlFor="r-dev">Devolver depois de</FieldLabel><Input id="r-dev" defaultValue="30 dias" /></Field>
          </div>
          <Field><FieldLabel htmlFor="r-janela">Janela de envio</FieldLabel><Input id="r-janela" defaultValue="7h às 22h, todos os dias" /></Field>
        </CardContent>
      </Card>
      <Card className={CARTAO}>
        <CardHeader>
          <CardTitle>7 · Conectar o WhatsApp</CardTitle>
          <CardDescription>Entre com a conta do Facebook da administração. Leva uns 3 minutos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Alert variant="warning">
            <AlertTriangleIcon aria-hidden />
            <AlertTitle>Ainda não conectado</AlertTitle>
            <AlertDescription>Sem o WhatsApp os avisos saem por e-mail. Dá para conectar depois em Configurações.</AlertDescription>
          </Alert>
          <div className="flex justify-between"><Button variant="ghost" shape="pill">Fazer depois</Button><Button shape="pill"><MessageCircleIcon aria-hidden />Conectar WhatsApp</Button></div>
        </CardContent>
      </Card>
    </div>
  )
}

/* =====================================================================
   5 · BANNER DE INTEGRAÇÃO FORA DO AR
   ===================================================================== */

function PortariaComAvisos() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="grid gap-0">
        <Banner variant="danger" className="px-4 py-3">
          <WifiOffIcon aria-hidden />
          <BannerContent>
            <BannerTitle>Sem internet</BannerTitle>
            <BannerDescription>Pode seguir registrando. Sobe quando a rede voltar.</BannerDescription>
          </BannerContent>
        </Banner>
        <Banner variant="warning" className="px-4 py-2">
          <MessageCircleIcon aria-hidden />
          <BannerContent>
            <BannerDescription>WhatsApp fora · os avisos ficam na fila. <a href="#mais" className="font-medium underline underline-offset-4">+1 aviso</a></BannerDescription>
          </BannerContent>
        </Banner>
      </div>
      <div className="grid gap-3 px-4 pt-5">
        <p className="text-xs text-muted-foreground">Portaria principal · Vila Verde</p>
        <h3 className="font-display text-2xl font-bold">Turno da tarde</h3>
        <Card className="gap-2 rounded-3xl bg-primary py-5 text-primary-foreground">
          <CardContent className="grid gap-3 px-5">
            <p className="text-lg font-semibold">Chegou encomenda?</p>
            <Button shape="pill" size="lg" variant="secondary">Registrar encomenda</Button>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">Regra: “Sem internet” fica sempre em cima. As integrações juntam numa linha só, com o total.</p>
      </div>
    </div>
  )
}

function AvisosAbertos() {
  const lista: [typeof MessageCircleIcon, string, string][] = [
    [MessageCircleIcon, "WhatsApp fora do ar", "Os avisos ficam na fila e saem quando voltar. 12 na fila."],
    [CameraOffIcon, "Leitura da etiqueta lenta", "Digite a unidade. A foto continua sendo salva."],
    [CloudOffIcon, "Fotos sem subir", "Pode seguir registrando. 3 fotos esperando."],
  ]
  return (
    <div className="flex h-full flex-col bg-sunken">
      <p aria-hidden className="px-4 pt-4 pb-6 text-sm font-semibold text-muted-foreground">Toque em “+1 aviso”</p>
      <section aria-label="Avisos do sistema" className="flex min-h-0 flex-1 flex-col gap-3 rounded-t-3xl border-t bg-card px-4 pt-3 pb-5 shadow-wc-lg">
        <span aria-hidden className="mx-auto h-1.5 w-10 rounded-full bg-border-strong" />
        <h3 className="font-display text-xl font-bold">O que está fora agora</h3>
        {lista.map(([I, t, d]) => (
          <Alert key={t} variant="warning">
            <I aria-hidden />
            <AlertTitle>{t}</AlertTitle>
            <AlertDescription>{d}</AlertDescription>
          </Alert>
        ))}
        <p className="text-xs text-muted-foreground">Não dá para fechar enquanto o problema existe. Some sozinho quando volta, com um toast “WhatsApp voltou”.</p>
      </section>
    </div>
  )
}

function GestaoComAviso() {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-6">
      <Trilho ativo="Hoje" />
      <div className="grid min-w-0 content-start gap-6">
        <Banner variant="warning" appearance="floating" className="rounded-2xl">
          <MessageCircleIcon aria-hidden />
          <BannerContent>
            <BannerTitle>WhatsApp fora do ar desde 14:05</BannerTitle>
            <BannerDescription>Os avisos ficam na fila e saem quando voltar. 12 esperando. A Meta informa instabilidade.</BannerDescription>
          </BannerContent>
          <Button size="sm" variant="outline" shape="pill">Ver fila</Button>
        </Banner>
        <header className="flex items-center justify-between gap-4">
          <Busca />
          <Perfil />
        </header>
        <div>
          <h2 className="font-display text-4xl font-bold">Hoje</h2>
          <p className="text-muted-foreground">O aviso fica acima de tudo, em todas as telas da gestão, até o serviço voltar.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   6 · MENU DO PERFIL
   ===================================================================== */

function MenuPerfil() {
  const grupos: [typeof UsersIcon, string][][] = [
    [[UsersIcon, "Equipe"], [HistoryIcon, "Auditoria"], [DatabaseIcon, "Dados e LGPD"]],
    [[CircleHelpIcon, "Ajuda"], [LogOutIcon, "Sair"]],
  ]
  return (
    <div className="relative grid min-h-[620px] grid-cols-[56px_1fr] gap-6">
      <Trilho ativo="Hoje" />
      <div className="grid min-w-0 content-start gap-6">
        <header className="flex items-center justify-between gap-4">
          <Busca />
          <div className="flex items-center gap-2">
            <Button variant="outline" shape="pill"><Building2Icon aria-hidden />Residencial Vila Verde<ChevronDownIcon aria-hidden /></Button>
            <Avatar size="lg" className="ring-2 ring-ring ring-offset-2"><AvatarFallback>MA</AvatarFallback></Avatar>
          </div>
        </header>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
      </div>
      <Card role="menu" aria-label="Menu do perfil" className="absolute top-16 right-0 w-80 gap-0 rounded-3xl py-2 shadow-wc-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar size="lg"><AvatarFallback>MA</AvatarFallback></Avatar>
          <div className="grid">
            <p className="font-semibold">Marina Alves</p>
            <p className="text-sm text-muted-foreground">Gestora · Vila Verde</p>
          </div>
        </div>
        <Separator />
        <div className="grid gap-1 p-2">
          <p className="px-3 pt-1 text-xs font-semibold text-muted-foreground">Trocar empreendimento</p>
          {[["Residencial Vila Verde", true], ["Edifício Aurora", false], ["Condomínio Jardins", false]].map(([n, on]) => (
            <Button key={n as string} variant="ghost" className="justify-start rounded-2xl" role="menuitemradio" aria-checked={on as boolean}>
              <Building2Icon aria-hidden />{n as string}{on && <BadgeCheckIcon aria-hidden className="ms-auto text-brand" />}
            </Button>
          ))}
        </div>
        {grupos.map((g, gi) => (
          <React.Fragment key={gi}>
            <Separator />
            <div className="grid gap-1 p-2">
              {g.map(([I, t]) => (
                <Button key={t} variant="ghost" className={`justify-start rounded-2xl ${t === "Sair" ? "text-danger" : ""}`} role="menuitem"><I aria-hidden />{t}</Button>
              ))}
            </div>
          </React.Fragment>
        ))}
      </Card>
    </div>
  )
}

/* =====================================================================
   7 · SUGESTÕES DE CADASTRO
   ===================================================================== */

const SUGESTOES = [
  { nome: "Fernanda Ramos", uni: "C-021", origem: "Recebimento", quando: "hoje 09:12", quem: "Carlos", estado: "nova" },
  { nome: "Joana Pereira", uni: "A-112", origem: "Retirada", quando: "ontem 11:05", quem: "Rita", estado: "nova" },
  { nome: "Davi Nunes", uni: "B-034", origem: "Recebimento", quando: "02/11 18:40", quem: "Carlos", estado: "feito" },
] as const

function Sugestoes() {
  return (
    <ShellGestao ativo="Unidades e pessoas" titulo="Sugestões de cadastro" sub="A portaria registrou alguém que não está cadastrado. Você confirma; ninguém é cadastrado sozinho.">
      <Card className={CARTAO}>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome sugerido</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>De onde veio</TableHead>
                <TableHead>Quando</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SUGESTOES.map((s) => (
                <TableRow key={s.nome}>
                  <TableCell className="font-medium">{s.nome}</TableCell>
                  <TableCell className="font-mono font-semibold">{s.uni}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.origem === "Recebimento" ? <PackageIcon aria-hidden /> : <UserCheckIcon aria-hidden />}{s.origem}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.quando} · {s.quem}</TableCell>
                  <TableCell className="text-right">
                    {s.estado === "feito" ? (
                      <Badge variant="success"><CheckCircle2Icon aria-hidden />Já cadastrado por Marina</Badge>
                    ) : (
                      <span className="inline-flex gap-2">
                        <Button size="sm" variant="ghost" shape="pill">Recusar</Button>
                        <Button size="sm" shape="pill"><UserPlusIcon aria-hidden />Cadastrar</Button>
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Estados
        itens={[
          { titulo: "Carregando", children: <SkeletonTable rows={3} columns={4} /> },
          { titulo: "Vazio", children: <EmptyState variant="first-use" icon={<InboxIcon />} title="Nenhuma sugestão" description="Quando a portaria registrar alguém sem cadastro, aparece aqui." /> },
          { titulo: "Recusar (motivo)", children: <Field><FieldLabel htmlFor="sg-mot">Por que recusar?</FieldLabel><NativeSelect id="sg-mot" defaultValue="visita"><NativeSelectOption value="visita">Era visita, não mora aqui</NativeSelectOption><NativeSelectOption value="dup">Já existe com outro nome</NativeSelectOption><NativeSelectOption value="outro">Outro</NativeSelectOption></NativeSelect></Field> },
        ]}
      />
    </ShellGestao>
  )
}

/* =====================================================================
   8 · ENCOMENDA EXCEPCIONAL
   ===================================================================== */

function SeloExcecao({ tipo }: { tipo: "perecivel" | "grande" | "outro" }) {
  if (tipo === "perecivel") return <Badge variant="warning"><SnowflakeIcon aria-hidden />Perecível</Badge>
  if (tipo === "grande") return <Badge variant="soft"><PackageIcon aria-hidden />Volume grande</Badge>
  return <Badge variant="outline"><AlertTriangleIcon aria-hidden />Atenção</Badge>
}

function MarcarExcecao() {
  return (
    <div className="flex h-full flex-col bg-sunken">
      <p aria-hidden className="px-4 pt-4 pb-6 text-sm font-semibold text-muted-foreground">Confirmar · B-304 · Mercado Livre</p>
      <section aria-label="Encomenda especial" className="flex min-h-0 flex-1 flex-col gap-4 rounded-t-3xl border-t bg-card px-4 pt-3 pb-5 shadow-wc-lg">
        <span aria-hidden className="mx-auto h-1.5 w-10 rounded-full bg-border-strong" />
        <div className="grid gap-1">
          <h3 className="font-display text-xl font-bold">É uma encomenda especial?</h3>
          <p className="text-sm text-muted-foreground">O selo aparece na fila e no detalhe. Não muda nenhuma regra.</p>
        </div>
        <RadioGroup defaultValue="perecivel" aria-label="Tipo" className="grid gap-2">
          {[["nao", "Não, é comum", ""], ["perecivel", "Perecível", "Comida, remédio, flores"], ["grande", "Volume grande", "Não cabe na prateleira"], ["outro", "Outro", "Escreva o motivo"]].map(([v, t, d]) => (
            <RadioGroupCard key={v} value={v}>
              <RadioGroupCardContent>
                <RadioGroupCardTitle>{t}</RadioGroupCardTitle>
                {d && <RadioGroupCardDescription>{d}</RadioGroupCardDescription>}
              </RadioGroupCardContent>
            </RadioGroupCard>
          ))}
        </RadioGroup>
        <Field>
          <FieldLabel htmlFor="ex-mot">Motivo curto (opcional)</FieldLabel>
          <Input id="ex-mot" defaultValue="Caixa térmica, manter em pé" />
        </Field>
        <Button shape="pill" size="lg" className="mt-auto">Confirmar</Button>
      </section>
    </div>
  )
}

function FilaComSelo() {
  const fila: [string, string, string, "perecivel" | "grande" | null][] = [
    ["B-304", "Mariana Souza", "Mercado Livre · C2 · 11:42", "perecivel"],
    ["D-410", "Lucas Martins", "Amazon · VG · 10:15", "grande"],
    ["A-112", "João Pereira", "Correios · A1 · 09:30", null],
  ]
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="grid gap-3 px-4 pt-6">
        <h3 className="font-display text-3xl font-bold">Fila</h3>
        {fila.map(([u, n, d, s]) => (
          <Card key={u} className="gap-2 rounded-3xl py-4">
            <CardContent className="grid gap-1 px-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-semibold">{u}</p>
                {s && <SeloExcecao tipo={s} />}
              </div>
              <p className="font-medium">{n}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* =====================================================================
   9 · CUSTOS DO PROVEDOR (SAAS-002)
   ===================================================================== */

function Custos() {
  return (
    <Admin ativo="Planos e limites" titulo="Custos do provedor" sub="Quanto custa cada mensagem e cada leitura. Entra no cálculo de margem por conta.">
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Custo atual</CardTitle>
            <CardDescription>Mudança vale a partir da data escolhida; o histórico não muda.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Vale a partir de</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["WhatsApp · utilidade", "R$ 0,0420", "01/11/2026"],
                  ["WhatsApp · autenticação", "R$ 0,0315", "01/11/2026"],
                  ["WhatsApp · marketing", "R$ 0,3125", "01/11/2026"],
                  ["Leitura de etiqueta (OCR)", "R$ 0,0080", "15/10/2026"],
                ].map(([i, c, d]) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{i}</TableCell>
                    <TableCell><Input aria-label={`Custo de ${i}`} defaultValue={c} className="w-32" /></TableCell>
                    <TableCell><Input aria-label={`Data de ${i}`} defaultValue={d} className="w-36" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end"><Button shape="pill">Salvar custos</Button></div>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>Quem mudou, quando e de quanto para quanto.</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {[
                ["WhatsApp · utilidade", "R$ 0,0380 → R$ 0,0420", "01/11 · Fernando"],
                ["Leitura de etiqueta", "R$ 0,0100 → R$ 0,0080", "15/10 · Fernando"],
                ["WhatsApp · marketing", "R$ 0,2900 → R$ 0,3125", "01/07 · Fernando"],
              ].map(([t, d, q]) => (
                <Item key={t + q} variant="outline" className="rounded-2xl">
                  <ItemMedia variant="icon"><HistoryIcon aria-hidden /></ItemMedia>
                  <ItemContent>
                    <ItemTitle>{t}</ItemTitle>
                    <ItemDescription>{d} · {q}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </Admin>
  )
}

/* =====================================================================
   10 · RELATÓRIOS DA ORGANIZAÇÃO
   ===================================================================== */

const POR_LOCAL = [
  { local: "Vila Verde", recebidas: 412, retiradas: 398 },
  { local: "Aurora", recebidas: 186, retiradas: 181 },
  { local: "Jardins", recebidas: 301, retiradas: 287 },
  { local: "Serra Azul", recebidas: 156, retiradas: 145 },
]

function RelatoriosOrg() {
  return (
    <ShellOrg ativo="Relatórios" itens={NAV_ORG} rotulo="Organização" titulo="Relatórios da organização" sub="Os números de todos os empreendimentos somados, e cada um ao lado do outro.">
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect aria-label="Empreendimento" defaultValue="todos" className="w-60">
          <NativeSelectOption value="todos">Todos os empreendimentos</NativeSelectOption>
          <NativeSelectOption value="vv">Residencial Vila Verde</NativeSelectOption>
        </NativeSelect>
        <NativeSelect aria-label="Período" defaultValue="30" className="w-44">
          <NativeSelectOption value="30">Últimos 30 dias</NativeSelectOption>
          <NativeSelectOption value="90">Últimos 90 dias</NativeSelectOption>
        </NativeSelect>
        <Button variant="outline" shape="pill" className="ms-auto"><FileDownIcon aria-hidden />Exportar</Button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Recebidas" value="1.055" delta={6.4} period="vs. 30 dias antes" />
        <StatCard label="Retiradas" value="1.011" delta={5.9} period="vs. 30 dias antes" />
        <StatCard label="Tempo até retirar" value="1,6 dia" delta={-8} goodWhen="down" period="mediana" />
        <StatCard label="Falhas de aviso" value="1,8%" delta={-0.4} goodWhen="down" period="das mensagens" />
      </div>
      <Card className={CARTAO}>
        <CardHeader>
          <CardTitle>Comparação entre empreendimentos</CardTitle>
          <CardDescription>Recebidas e retiradas no período.</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart data={POR_LOCAL} index="local" series={[{ key: "recebidas", label: "Recebidas" }, { key: "retiradas", label: "Retiradas" }]} height={240} />
        </CardContent>
      </Card>
      <Card className={CARTAO}>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empreendimento</TableHead>
                <TableHead className="text-right">Recebidas</TableHead>
                <TableHead className="text-right">Retiradas</TableHead>
                <TableHead className="text-right">Paradas +7 dias</TableHead>
                <TableHead className="text-right">Falha de aviso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[["Residencial Vila Verde", "412", "398", "6", "1,2%"], ["Edifício Aurora", "186", "181", "2", "0,9%"], ["Condomínio Jardins", "301", "287", "11", "3,1%"], ["Residencial Serra Azul", "156", "145", "8", "1,6%"]].map(([n, r, t, p, f]) => (
                <TableRow key={n}>
                  <TableCell className="font-medium">{n}</TableCell>
                  <TableCell className="text-right tabular-nums">{r}</TableCell>
                  <TableCell className="text-right tabular-nums">{t}</TableCell>
                  <TableCell className="text-right tabular-nums">{p}</TableCell>
                  <TableCell className="text-right tabular-nums">{f === "3,1%" ? <Badge variant="warning"><AlertTriangleIcon aria-hidden />{f}</Badge> : f}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ShellOrg>
  )
}

/* =====================================================================
   11 · APROVAR ACESSO DE SUPORTE
   ===================================================================== */

function AprovarSuporte() {
  return (
    <DialogoParado>
      <CardHeader>
        <span aria-hidden className="grid size-12 place-items-center rounded-full bg-accent-soft text-brand"><KeyRoundIcon className="size-6" /></span>
        <CardTitle className="text-xl">O suporte pediu acesso</CardTitle>
        <CardDescription>Nada muda sem a sua aprovação. Tudo o que o suporte fizer fica na auditoria.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 rounded-2xl border bg-sunken p-4 text-sm">
          <dt className="text-muted-foreground">Quem pede</dt><dd>Ana Ribeiro · suporte PacoteZap</dd>
          <dt className="text-muted-foreground">Motivo</dt><dd>Avisos de WhatsApp falhando na B-304 (chamado #482)</dd>
          <dt className="text-muted-foreground">Por quanto tempo</dt><dd>2 horas, até 16:30</dd>
          <dt className="text-muted-foreground">Pode</dt><dd>Ver encomendas e avisos. Não vê fotos de etiqueta nem muda cadastros.</dd>
        </dl>
        <div className="flex items-center gap-3">
          <Switch id="sp-foto" aria-label="Permitir ver fotos de etiqueta" />
          <Label htmlFor="sp-foto" className="font-normal">Permitir ver fotos de etiqueta também</Label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" shape="pill">Negar</Button>
          <Button shape="pill"><ShieldCheckIcon aria-hidden />Aprovar por 2 horas</Button>
        </div>
      </CardContent>
    </DialogoParado>
  )
}

/* =====================================================================
   MONTAGEM
   ===================================================================== */

export function Faltam() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={NEVOA} className="min-h-dvh bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)] gap-16">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 04/11/2026 · WebCode UI · Névoa + Brasa</p>
          <h1 className="font-display text-5xl font-bold">Piloto e implantação</h1>
          <p className="max-w-3xl text-muted-foreground">As 11 telas que faltavam no plano mestre (seção 6.3). As três primeiras travam o piloto. Textos legais e números são exemplos.</p>
        </header>

        <Grupo id="f-optin" titulo="1 · Opt-in do morador" texto="Página pública, sem login. Chega pelo link do convite (unidade já vem) ou pelo QR do cartaz (o morador escolhe a unidade e o gestor confirma). Não mostra nada de outros moradores.">
          <Linha>
            <Prancha id="OPT-001" titulo="Pelo link do convite"><OptInForm /></Prancha>
            <Prancha id="OPT-001" titulo="Pelo QR do cartaz"><OptInForm cartaz /></Prancha>
            <Prancha id="OPT-001" titulo="Número inválido"><OptInForm invalido /></Prancha>
            <Prancha id="OPT-001" titulo="Enviando"><OptInForm enviando /></Prancha>
            <Prancha id="OPT-002" titulo="Pronto"><OptInSucesso /></Prancha>
            <Prancha id="OPT-003" titulo="Link vencido"><OptInVencido /></Prancha>
            <Prancha id="OPT-004" titulo="Já cadastrado"><OptInJaCadastrado /></Prancha>
          </Linha>
        </Grupo>

        <Grupo id="f-lgpd" titulo="2 · Pedido do titular (LGPD)" texto="2a: página pública do morador. 2b: o gestor registra o pedido que chegou por outro canal. Ações por pedido na CFG-008, com exclusão bloqueada se houver encomenda pendente.">
          <Linha>
            <Prancha id="LGPD-001" titulo="Seus dados (público)"><TitularPublico /></Prancha>
            <Prancha id="LGPD-002" titulo="Pedido registrado"><TitularEnviado /></Prancha>
          </Linha>
          <Moldura id="CFG-008" titulo="Pedidos de titular" nota="Cada pedido com a ação certa. Encomenda pendente impede excluir.">
            <PedidosTitular />
          </Moldura>
          <Moldura id="CFG-008 · folha" titulo="Registrar pedido" nota="Abre do botão “Registrar pedido”. Prazo calculado na hora.">
            <RegistrarPedido />
          </Moldura>
          <Moldura id="CFG-008 · diálogo" titulo="Excluir dados" nota="Ação crítica: motivo, digitar EXCLUIR e explicar o que fica guardado.">
            <ExcluirDados />
          </Moldura>
        </Grupo>

        <Grupo id="f-termos" titulo="3 · Termos e privacidade" texto="Páginas públicas /termos e /privacidade no visual da entrada. Aceite no primeiro acesso e a cada versão nova; sem aceitar, não entra.">
          <Moldura id="LEG-001" titulo="Política de privacidade" nota="Leitura longa: índice, seções, versão e data.">
            <Termos />
          </Moldura>
          <Moldura id="LEG-002" titulo="Atualizamos os termos" nota="Resumo do que mudou. O botão só liga depois de marcar.">
            <AceiteNovaVersao />
          </Moldura>
          <Moldura id="AUTH-001" titulo="Checkbox da entrada" nota="Agora com link para as duas páginas.">
            <CheckboxEntrada />
          </Moldura>
        </Grupo>

        <Grupo id="f-impl" titulo="4 · Implantação: passos finais" texto="Continua o “Cadastrar condomínio”. Dá para sair e voltar; cada passo mostra o que já foi feito. O condomínio só fica pronto para operar no fim.">
          <Moldura id="IMP-020" titulo="Revisão e ativação" nota="Checklist do que está pronto e do que falta, com atalho para cada passo.">
            <Revisao />
          </Moldura>
          <Moldura id="IMP-016..019" titulo="Moradores, equipe, regras e WhatsApp" nota="Os quatro passos do meio. Moradores e WhatsApp podem ser pulados.">
            <PassosMeio />
          </Moldura>
        </Grupo>

        <Grupo id="f-banner" titulo="5 · Integração fora do ar" texto="Posição: logo abaixo da barra de status no celular e acima do cabeçalho na gestão. Não fecha enquanto o problema existe. “Sem internet” tem prioridade; as integrações juntam numa linha com o total.">
          <Linha>
            <Prancha id="SYS-001" titulo="Portaria com dois avisos"><PortariaComAvisos /></Prancha>
            <Prancha id="SYS-002" titulo="Lista de avisos"><AvisosAbertos /></Prancha>
          </Linha>
          <Moldura id="SYS-003" titulo="Gestão com WhatsApp fora" nota="Faixa no topo de todas as telas, com atalho para a fila.">
            <GestaoComAviso />
          </Moldura>
        </Grupo>

        <Grupo id="f-perfil" titulo="6 · Menu do perfil" texto="Abre no avatar. Caminho para Equipe, Auditoria e Dados, que já têm prancha.">
          <Moldura id="NAV-001" titulo="Menu do perfil aberto" nota="Nome e papel, trocar empreendimento, atalhos e sair.">
            <MenuPerfil />
          </Moldura>
        </Grupo>

        <Grupo id="f-sug" titulo="7 · Sugestões de cadastro" texto="Vem do “Para resolver” do painel. Cadastrar abre o formulário já preenchido; recusar pede motivo.">
          <Moldura id="PES-010" titulo="Sugestões de cadastro" nota="Lista, estados de carregando e vazio, e o motivo da recusa.">
            <Sugestoes />
          </Moldura>
        </Grupo>

        <Grupo id="f-exc" titulo="8 · Encomenda excepcional" texto="Marca no recebimento e no detalhe. Só destaque: cor + ícone + texto, sem regra automática.">
          <Linha>
            <Prancha id="REC-003" titulo="Marcar como especial"><MarcarExcecao /></Prancha>
            <Prancha id="CUS-001" titulo="Selo na fila"><FilaComSelo /></Prancha>
          </Linha>
        </Grupo>

        <Grupo id="f-custo" titulo="9 · Custos do provedor" texto="No admin, junto de Planos e limites. Cada custo com a data em que passa a valer e o histórico.">
          <Moldura id="SAAS-002" titulo="Custos do provedor" nota="WhatsApp por categoria da Meta e leitura de etiqueta.">
            <Custos />
          </Moldura>
        </Grupo>

        <Grupo id="f-rel" titulo="10 · Relatórios da organização" texto="Os números de REL-001..003 somando todos os condomínios, com filtro e comparação.">
          <Moldura id="ORG-005" titulo="Relatórios da organização" nota="Totais, comparação em barras e tabela por empreendimento.">
            <RelatoriosOrg />
          </Moldura>
        </Grupo>

        <Grupo id="f-sup" titulo="11 · Aprovar acesso de suporte" texto="Diálogo de ação crítica: quem pede, motivo, tempo e o que pode fazer.">
          <Moldura id="CFG-009" titulo="Aprovar acesso de suporte" nota="Aprovar tem prazo; negar não pede motivo.">
            <AprovarSuporte />
          </Moldura>
        </Grupo>
      </div>
    </div>
  )
}
