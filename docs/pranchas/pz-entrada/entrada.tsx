"use client"

import * as React from "react"
import { PzMarca, PzSplash, PZ_SPLASH_CSS } from "../pz-marca/marca"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  HeadsetIcon,
  LockIcon,
  MailIcon,
  MessageCircleIcon,
  PackageIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Celular, Moldura, PALETAS, vars } from "../pz-dash/painel"
import { Badge } from "@/registry/webcode/ui/badge"
import { Banner, BannerContent, BannerDescription, BannerTitle } from "@/registry/webcode/ui/banner"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Checkbox } from "@/registry/webcode/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/registry/webcode/ui/field"
import { Input, InputPassword } from "@/registry/webcode/ui/input"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { Label } from "@/registry/webcode/ui/label"
import { PasswordStrength } from "@/registry/webcode/ui/password-strength"
import { Result } from "@/registry/webcode/ui/result"
import { Separator } from "@/registry/webcode/ui/separator"
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/webcode/ui/dialog"
import { RadioGroup, RadioGroupCard, RadioGroupCardContent, RadioGroupCardDescription, RadioGroupCardTitle } from "@/registry/webcode/ui/radio-group"
import { Textarea } from "@/registry/webcode/ui/textarea"
import { DescriptionItem, DescriptionList } from "@/registry/webcode/ui/description-list"

// Entrada do PacoteZap (03/11/2026): splash animado, login (desktop e celular), primeiro acesso,
// recuperar senha, sem acesso e suporte. Paleta Névoa, componentes da WebCode UI.
// O splash é a construção "IA primeiro" da logo final (CSS, ~4 s, só na 1ª abertura da sessão, pula com movimento reduzido).
// Contatos de suporte e nomes são exemplos.

const LINK = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"

/* ---------------- splash ---------------- */

const TAG_CSS = `
.pz-splash-tag { opacity: 0; animation: pz-foco .8s ease 3.6s forwards }
@media (prefers-reduced-motion: reduce) { .pz-splash-tag { animation: none; opacity: 1 } }
`

function Splash({ grande = false }: { grande?: boolean }) {
  const [rodada, setRodada] = React.useState(0)
  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-primary text-primary-foreground">
      <div key={rodada} aria-hidden className="flex flex-col items-center gap-2">
        <PzSplash className={grande ? "w-80" : "w-60"} />
        <span className={`pz-splash-tag opacity-80 ${grande ? "text-lg" : "text-base"}`}>Recebeu, avisou, entregou.</span>
      </div>
      <span className="sr-only">PacoteZap abrindo</span>
      <Button
        variant="secondary"
        shape="pill"
        size="sm"
        className="absolute right-4 bottom-6"
        onClick={() => setRodada((n) => n + 1)}
      >
        <RotateCcwIcon aria-hidden />
        Repetir animação
      </Button>
    </div>
  )
}

/* ---------------- peças ---------------- */

function Marca({ claro = false }: { claro?: boolean }) {
  return <PzMarca escuro={claro} />
}

const PROBLEMAS = [
  { v: "senha", t: "Esqueci a senha ou ela não funciona", d: "Aparece “E-mail ou senha incorretos”" },
  { v: "bloqueio", t: "Minha conta foi bloqueada", d: "Muitas tentativas seguidas; aparece um tempo de espera" },
  { v: "link", t: "O link do e-mail não abre ou expirou", d: "Link de acesso, convite ou troca de senha" },
  { v: "convite", t: "Não recebi o convite nem o e-mail", d: "Já olhei a caixa de spam" },
  { v: "semacesso", t: "Entrei, mas aparece “Sem acesso”", d: "A conta não está ligada a um condomínio" },
  { v: "condominio", t: "Meu condomínio não aparece na lista", d: "Trabalho em mais de um empreendimento" },
  { v: "carrega", t: "A página não carrega ou fica em branco", d: "Internet, navegador ou app desatualizado" },
  { v: "outro", t: "Outro problema", d: "Conte em poucas palavras abaixo" },
]

function AjudaCorpo({ id }: { id: string }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm font-semibold">O que está acontecendo?</p>
        <RadioGroup defaultValue="senha" className="gap-2">
          {PROBLEMAS.map((p) => (
            <RadioGroupCard key={p.v} value={p.v} id={`${id}-${p.v}`}>
              <RadioGroupCardContent>
                <RadioGroupCardTitle>{p.t}</RadioGroupCardTitle>
                <RadioGroupCardDescription>{p.d}</RadioGroupCardDescription>
              </RadioGroupCardContent>
            </RadioGroupCard>
          ))}
        </RadioGroup>
      </div>
      <Field>
        <FieldLabel htmlFor={`${id}-detalhe`}>Quer contar mais? (opcional)</FieldLabel>
        <Textarea id={`${id}-detalhe`} rows={2} placeholder="Ex.: troquei de celular ontem e o link não abre" />
      </Field>
      <div className="grid gap-2">
        <p className="text-sm font-semibold">Vai junto com o pedido</p>
        <DescriptionList layout="horizontal" bordered>
          <DescriptionItem label="E-mail digitado">marina.alves@vilaverde.com.br</DescriptionItem>
          <DescriptionItem label="Último aviso na tela">E-mail ou senha incorretos · 14:12</DescriptionItem>
          <DescriptionItem label="Código" copyValue="AUTH-INVALID-7F3A">AUTH-INVALID-7F3A</DescriptionItem>
          <DescriptionItem label="Aparelho">Chrome 131 · Windows · app 1.0.3</DescriptionItem>
        </DescriptionList>
        <FieldDescription>Sua senha nunca é enviada.</FieldDescription>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button shape="pill" size="lg">
          <MessageCircleIcon aria-hidden />
          Enviar pelo WhatsApp
        </Button>
        <Button variant="outline" shape="pill" size="lg">
          <MailIcon aria-hidden />
          Enviar por e-mail
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Suporte de segunda a sábado, das 8h às 20h. Resposta por e-mail em até 1 dia útil.</p>
    </div>
  )
}

function BotaoAjuda({ id }: { id: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" shape="pill" size="icon-lg" aria-label="Precisa de ajuda para entrar?" title="Precisa de ajuda para entrar?">
          <HeadsetIcon aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent size="md" className="max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle>Precisa de ajuda para entrar?</DialogTitle>
          <DialogDescription>Escolha o que mais parece com o seu caso. Assim o suporte já sabe por onde começar.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <AjudaCorpo id={id} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

/** O mesmo diálogo, aberto e parado, para a prancha. */
function AjudaAberta() {
  return (
    <div className="relative grid min-h-[760px] place-items-center overflow-hidden rounded-[1.6rem] p-8">
      <Card className="w-full max-w-lg gap-4 rounded-3xl shadow-wc-lg">
        <CardHeader>
          <CardTitle className="text-xl">Precisa de ajuda para entrar?</CardTitle>
          <CardDescription>Escolha o que mais parece com o seu caso. Assim o suporte já sabe por onde começar.</CardDescription>
        </CardHeader>
        <CardContent>
          <AjudaCorpo id="estatico" />
        </CardContent>
      </Card>
    </div>
  )
}

function Rodape() {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <a href="#termos" className="underline-offset-4 hover:underline">Termos de uso</a>
      <a href="#privacidade" className="underline-offset-4 hover:underline">Privacidade e LGPD</a>
      <span>© 2026 WebCodeFF</span>
    </p>
  )
}

function FormEntrar({ id }: { id: string }) {
  return (
    <form className="grid grid-cols-[minmax(0,1fr)] gap-5" onSubmit={(e) => e.preventDefault()}>
      <Field>
        <FieldLabel htmlFor={`${id}-email`}>E-mail</FieldLabel>
        <Input id={`${id}-email`} type="email" autoComplete="username" defaultValue="marina.alves@vilaverde.com.br" />
      </Field>
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor={`${id}-senha`}>Senha</FieldLabel>
          <a href="#recuperar" className="text-sm font-medium text-brand underline-offset-4 hover:underline">
            Esqueci minha senha
          </a>
        </div>
        <InputPassword id={`${id}-senha`} autoComplete="current-password" defaultValue="exemplo-senha" />
      </Field>
      <div className="flex min-h-11 items-center gap-3">
        <Checkbox id={`${id}-manter`} defaultChecked />
        <Label htmlFor={`${id}-manter`}>Manter conectado neste aparelho</Label>
      </div>
      <Button type="submit" shape="pill" size="lg">
        Entrar
      </Button>
      <Separator>ou</Separator>
      <Button type="button" variant="outline" shape="pill" size="lg">
        <MailIcon aria-hidden />
        Receber link de acesso por e-mail
      </Button>
    </form>
  )
}

/* ---------------- desktop ---------------- */

/** Fundo sutil do painel azul: caixas em traço fino e a rota tracejada da portaria até a porta. SVG inline, sem imagem externa. */
function Fundo() {
  const traco = "color-mix(in oklab, var(--primary-foreground) 16%, var(--primary))"
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 -z-10 size-full [mask-image:linear-gradient(200deg,black,transparent_70%)]">
      <defs>
        <pattern id="pz-caixas" width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={traco} strokeWidth="1.2" strokeLinejoin="round">
            <path d="M28 12 42 19v16l-14 7-14-7V19z" />
            <path d="M14 19l14 7 14-7M28 26v16" />
            <path d="M21 15.5l14 7" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pz-caixas)" />
      <path d="M40 760 C 180 640, 260 700, 380 560 S 560 420, 640 300" fill="none" stroke={traco} strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />
    </svg>
  )
}

function PainelMarca() {
  return (
    <aside className="relative isolate flex flex-col justify-between gap-10 overflow-hidden rounded-[1.6rem] bg-primary p-10 text-primary-foreground">
      <Fundo />
      <Marca claro />
      <div className="grid gap-8">
        <h2 className="max-w-[16ch] font-display text-4xl leading-tight font-extrabold tracking-tight text-balance">
          A portaria registra. O morador fica sabendo.
        </h2>
        <div aria-hidden className="relative h-48 max-w-md">
          <div className="absolute inset-x-10 top-0 h-24 rounded-2xl" style={{ background: "color-mix(in oklab, var(--primary-foreground) 12%, var(--primary))" }} />
          <div className="absolute inset-x-5 top-5 h-24 rounded-2xl" style={{ background: "color-mix(in oklab, var(--primary-foreground) 24%, var(--primary))" }} />
          <div className="absolute inset-x-0 top-10 grid gap-3 rounded-2xl bg-card p-4 text-card-foreground shadow-wc-lg">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-accent text-brand">
                <PackageIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono font-semibold">B-304 · C2</p>
                <p className="text-sm text-muted-foreground">Mariana Souza · Mercado Livre</p>
              </div>
              <Badge variant="success">
                <CheckCircle2Icon aria-hidden />
                Avisada 11:43
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-2 opacity-90">
          <ShieldCheckIcon aria-hidden className="size-4" />
          Cada ação fica registrada com nome, data e hora.
        </span>
        <Badge variant="success">
          <CheckCircle2Icon aria-hidden />
          Todos os serviços funcionando
        </Badge>
      </div>
    </aside>
  )
}

function EntrarDesktop() {
  return (
    <div className="grid min-h-[820px] grid-cols-[1.05fr_1fr] gap-6">
      <PainelMarca />
      <div className="relative flex flex-col items-center justify-center gap-6 px-10 py-6">
        <div className="absolute top-4 right-4">
          <BotaoAjuda id="ajuda-d" />
        </div>
        <Card className="w-full max-w-[460px] gap-8 rounded-3xl px-2 py-8 shadow-wc-md">
          <CardContent className="grid gap-8">
            <div className="grid gap-2">
              <h2 className="font-display text-4xl font-extrabold tracking-tight">Entrar</h2>
              <p className="text-muted-foreground">Para gestores, síndicos e equipe da portaria.</p>
            </div>
            <FormEntrar id="d" />
            <p className="text-sm text-muted-foreground">
              Primeiro acesso? Abra o convite que chegou no seu e-mail. <a href="#convite" className="font-medium text-brand underline-offset-4 hover:underline">Não recebi o convite</a>
            </p>
          </CardContent>
        </Card>
        <div className="w-full max-w-[460px]">
          <Rodape />
        </div>
      </div>
    </div>
  )
}

function CartaoAuth({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <figure className="m-0 grid min-w-0 content-start gap-3">
      <figcaption className="text-sm font-semibold">
        <span className="font-mono">{id}</span> · {titulo}
      </figcaption>
      <div className="grid min-h-[560px] place-items-center rounded-[1.6rem] bg-muted p-6">
        <Card className="w-full max-w-[380px] rounded-3xl shadow-wc-md">{children}</Card>
      </div>
    </figure>
  )
}

function Convite() {
  const [senha, setSenha] = React.useState("Vila#2026")
  return (
    <>
      <CardHeader>
        <Marca />
        <CardTitle className="mt-4 font-display text-2xl font-extrabold tracking-tight">Bem-vinda, Marina</CardTitle>
        <CardDescription>Fernando te convidou como gestora do Residencial Vila Verde. Crie sua senha para entrar.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <Field>
          <FieldLabel htmlFor="cv-email">E-mail</FieldLabel>
          <Input id="cv-email" defaultValue="marina.alves@vilaverde.com.br" readOnly />
        </Field>
        <Field>
          <FieldLabel htmlFor="cv-senha">Nova senha</FieldLabel>
          <InputPassword id="cv-senha" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <PasswordStrength value={senha} />
        </Field>
        <div className="flex items-start gap-3">
          <Checkbox id="cv-termos" defaultChecked className="mt-0.5" />
          <Label htmlFor="cv-termos" className="leading-snug font-normal">
            Li os Termos de uso e a Política de privacidade
          </Label>
        </div>
        <Button shape="pill" size="lg">
          Criar senha e entrar
        </Button>
        <FieldDescription>Convite válido até 10/11/2026.</FieldDescription>
      </CardContent>
    </>
  )
}

function Recuperar() {
  return (
    <>
      <CardHeader>
        <Button variant="ghost" size="sm" className="w-fit px-2">
          <ArrowLeftIcon aria-hidden />
          Voltar
        </Button>
        <CardTitle className="mt-2 font-display text-2xl font-extrabold tracking-tight">Recuperar senha</CardTitle>
        <CardDescription>Mandamos um link para criar uma senha nova.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <Field>
          <FieldLabel htmlFor="rc-email">E-mail da conta</FieldLabel>
          <Input id="rc-email" type="email" defaultValue="marina.alves@vilaverde.com.br" />
        </Field>
        <Button shape="pill" size="lg">
          Enviar link
        </Button>
        <Banner variant="success" className="rounded-2xl">
          <MailIcon aria-hidden />
          <BannerContent>
            <BannerTitle>Confira seu e-mail</BannerTitle>
            <BannerDescription>Se existir uma conta com esse e-mail, o link chega em alguns minutos. Ele vale por 1 hora.</BannerDescription>
          </BannerContent>
        </Banner>
        <Button variant="ghost" shape="pill">
          Reenviar em 0:45
        </Button>
      </CardContent>
    </>
  )
}

function SemAcesso({ compacto = false }: { compacto?: boolean }) {
  return (
    <CardContent className={compacto ? "grid gap-4 px-0" : "grid gap-4"}>
      <Result
        status="warning"
        icon={<LockIcon aria-hidden className="size-8" />}
        title="Você ainda não tem acesso aqui"
        description="Sua conta existe, mas não está ligada a nenhum empreendimento. Quem libera é o gestor do condomínio."
      />
      <div className="grid gap-2">
        <Button shape="pill" size="lg">
          Pedir acesso ao gestor
        </Button>
        <Button variant="outline" shape="pill" size="lg">
          Entrar com outra conta
        </Button>
      </div>
      <FieldDescription className="text-center">Conectado como carlos.porteiro@vilaverde.com.br</FieldDescription>
    </CardContent>
  )
}

/* ---------------- celular ---------------- */

function EntrarCelular() {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-muted px-4 pt-8 pb-6">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
        <div className="flex items-center justify-between">
          <Marca />
          <BotaoAjuda id="ajuda-m" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Boa tarde.</h2>
          <p className="mt-1 text-muted-foreground">Entre para registrar e entregar as encomendas da portaria.</p>
        </div>
        <Card className="gap-0 rounded-3xl py-5 shadow-wc-md">
          <CardContent className="px-5">
            <FormEntrar id="m" />
          </CardContent>
        </Card>
        <Rodape />
      </div>
    </div>
  )
}

function SemAcessoCelular() {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-muted px-4 pt-12 pb-6">
      <div className="mb-4 flex justify-end">
        <BotaoAjuda id="ajuda-s" />
      </div>
      <Card className="rounded-3xl shadow-wc-md">
        <SemAcesso />
      </Card>
    </div>
  )
}

/* ---------------- página ---------------- */

export function Entrada() {
  const nevoa = PALETAS[0]
  // O diálogo abre num portal no <body>: leva o tema e a paleta para lá também.
  React.useEffect(() => {
    const b = document.body
    b.setAttribute("data-wc-theme", "custelo")
    b.setAttribute("data-mode", "light")
    const v = vars(nevoa.vars) as Record<string, string>
    for (const [k, val] of Object.entries(v)) b.style.setProperty(k, val)
  }, [nevoa])
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(nevoa.vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <link rel="stylesheet" href={LINK} />
      <style>{PZ_SPLASH_CSS + TAG_CSS}</style>
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-balance">Entrada do PacoteZap</h1>
          <p className="max-w-[65ch] text-muted-foreground">
            Splash animado, login no computador e no celular, primeiro acesso, recuperar senha, sem acesso e ajuda (ícone de headset). O splash roda só na
            primeira abertura da sessão e some com movimento reduzido.
          </p>
        </header>

        <section className="grid min-w-0 gap-6" aria-labelledby="t-cel">
          <h2 id="t-cel" className="text-2xl font-semibold">Celular · portaria</h2>
          <div className="relative -mx-4 flex gap-8 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
            <Celular id="SPLASH" titulo="Abertura" nota="O brilho de IA pulsa, o pino abre em volta, o raio pisca e o nome foca (~4 s).">
              <Splash />
            </Celular>
            <Celular id="AUTH-001" titulo="Entrar" nota="E-mail e senha, link por e-mail e suporte à vista.">
              <EntrarCelular />
            </Celular>
            <Celular id="AUTH-006" titulo="Sem acesso" nota="Conta sem empreendimento: pede acesso ou troca de conta.">
              <SemAcessoCelular />
            </Celular>
          </div>
        </section>

        <section className="grid min-w-0 gap-6" aria-labelledby="t-desk">
          <h2 id="t-desk" className="text-2xl font-semibold">Computador · gestão</h2>
          <Moldura id="SPLASH" titulo="Abertura no computador" nota="A mesma abertura, maior. No computador aparece só no primeiro acesso do dia.">
            <div className="h-[560px] overflow-hidden rounded-[1.6rem]">
              <Splash grande />
            </div>
          </Moldura>
          <Moldura id="AUTH-001" titulo="Entrar" nota="Tela dividida: marca e prova do produto à esquerda, formulário e suporte à direita.">
            <EntrarDesktop />
          </Moldura>
          <Moldura id="AUTH-AJUDA" titulo="Ajuda para entrar (aberta)" nota="O ícone de headset abre este diálogo. A pessoa escolhe o caso e o pedido já vai com o código do erro.">
            <AjudaAberta />
          </Moldura>
          <div className="grid gap-6 lg:grid-cols-3">
            <CartaoAuth id="AUTH-002 + AUTH-004" titulo="Convite e criar senha">
              <Convite />
            </CartaoAuth>
            <CartaoAuth id="AUTH-003" titulo="Recuperar senha">
              <Recuperar />
            </CartaoAuth>
            <CartaoAuth id="AUTH-006" titulo="Sem acesso">
              <SemAcesso />
            </CartaoAuth>
          </div>
        </section>
      </div>
    </div>
  )
}
