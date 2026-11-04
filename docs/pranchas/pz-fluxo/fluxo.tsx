"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ArrowRightLeftIcon,
  CameraIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  CircleHelpIcon,
  ClockIcon,
  CloudUploadIcon,
  EyeOffIcon,
  GitMergeIcon,
  ImageIcon,
  MapPinIcon,
  MessageCircleIcon,
  PackageCheckIcon,
  PackageIcon,
  PencilIcon,
  PrinterIcon,
  QrCodeIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UserIcon,
  WifiOffIcon,
  XIcon,
} from "lucide-react"

import { EstadoBadge, NEVOA, Prancha } from "../pranchas/pranchas"
import { Alert, AlertDescription, AlertTitle } from "@/registry/webcode/ui/alert"
import { Badge } from "@/registry/webcode/ui/badge"
import { Banner, BannerContent, BannerDescription, BannerTitle } from "@/registry/webcode/ui/banner"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { CheckboxCard, CheckboxCardContent, CheckboxCardDescription, CheckboxCardTitle } from "@/registry/webcode/ui/checkbox"
import { DescriptionItem, DescriptionList } from "@/registry/webcode/ui/description-list"
import { Field, FieldDescription, FieldLabel } from "@/registry/webcode/ui/field"
import { Input } from "@/registry/webcode/ui/input"
import { InputDocument } from "@/registry/webcode/ui/input-document"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { NavigationBar } from "@/registry/webcode/ui/navigation-bar"
import { Progress } from "@/registry/webcode/ui/progress"
import { QRCode } from "@/registry/webcode/ui/qr-code"
import { QuantityStepper } from "@/registry/webcode/ui/quantity-stepper"
import {
  RadioGroup,
  RadioGroupCard,
  RadioGroupCardContent,
  RadioGroupCardDescription,
  RadioGroupCardTitle,
} from "@/registry/webcode/ui/radio-group"
import { Result } from "@/registry/webcode/ui/result"
import { SearchBar } from "@/registry/webcode/ui/search-bar"
import { SignaturePad } from "@/registry/webcode/ui/signature-pad"
import { Stepper } from "@/registry/webcode/ui/stepper"
import { Textarea } from "@/registry/webcode/ui/textarea"
import { Timeline, TimelineDescription, TimelineItem, TimelineTime, TimelineTitle } from "@/registry/webcode/ui/timeline"
import { ToggleGroup, ToggleGroupItem } from "@/registry/webcode/ui/toggle-group"

// Pranchas do fluxo do porteiro (03/11/2026): recebimento, custódia e retirada no celular.
// Só componentes da WebCode UI, paleta Névoa. Nomes e números são exemplos.

const BUSCA = "rounded-full border bg-card"

function Voltar({ label }: { label: string }) {
  return (
    <Button variant="ghost" size="icon" aria-label={label}>
      <ChevronLeftIcon aria-hidden />
    </Button>
  )
}

function Fechar({ label = "Fechar" }: { label?: string }) {
  return (
    <Button variant="ghost" size="icon" aria-label={label}>
      <XIcon aria-hidden />
    </Button>
  )
}

function Rodape({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2 px-4 pt-3 pb-5">{children}</div>
}

// Folha aberta, desenhada parada para a prancha. Na tela real é o Sheet (side="bottom") da biblioteca.
function Folha({ fundo, titulo, descricao, children, rodape }: { fundo: string; titulo: string; descricao?: string; children: React.ReactNode; rodape?: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-sunken">
      <p aria-hidden className="px-4 pt-4 pb-6 text-sm font-semibold text-muted-foreground">{fundo}</p>
      <section aria-label={titulo} className="flex min-h-0 flex-1 flex-col rounded-t-3xl border-t bg-card shadow-wc-lg">
        <span aria-hidden className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border-strong" />
        <header className="flex items-start gap-2 px-4 pt-3">
          <div className="grid flex-1 gap-1">
            <h3 className="font-display text-xl font-bold">{titulo}</h3>
            {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
          </div>
          <Fechar />
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start overflow-y-auto px-4 pt-4 pb-4">{children}</div>
        {rodape && <Rodape>{rodape}</Rodape>}
      </section>
    </div>
  )
}

/* ---------------- REC-004 · Escolher unidade ---------------- */

const UNIDADES = [
  ["B-304", "Mariana Souza, Pedro Souza", "Lida na etiqueta"],
  ["B-305", "Helena Prado", ""],
  ["B-034", "Carla Nunes, Davi Nunes", "Número parecido"],
  ["A-304", "Roberto Lima", "Mesmo número, outro bloco"],
] as const

function EscolherUnidade() {
  return (
    <Folha fundo="Confirmar destino · 8º do lote" titulo="Escolher unidade" descricao="A unidade vem primeiro. O nome só confirma.">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <SearchBar placeholder="Bloco e número, ex.: B 304" aria-label="Buscar unidade" inputClassName={BUSCA} />
        <ToggleGroup type="single" defaultValue="b" aria-label="Bloco" className="w-full min-w-0 flex-wrap justify-start gap-2" spacing={2}>
          {["Todos", "A", "B", "C", "D"].map((b) => (
            <ToggleGroupItem key={b} value={b.toLowerCase()} className="rounded-full px-4">{b === "Todos" ? b : `Bloco ${b}`}</ToggleGroupItem>
          ))}
        </ToggleGroup>
        <RadioGroup defaultValue="B-304" aria-label="Unidade" className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2">
          {UNIDADES.map(([u, quem, dica]) => (
            <RadioGroupCard key={u} value={u}>
              <RadioGroupCardContent>
                <RadioGroupCardTitle className="font-mono text-base">{u}</RadioGroupCardTitle>
                <RadioGroupCardDescription>{quem}</RadioGroupCardDescription>
                {dica && <RadioGroupCardDescription className="text-xs">{dica}</RadioGroupCardDescription>}
              </RadioGroupCardContent>
            </RadioGroupCard>
          ))}
        </RadioGroup>
        <Button variant="link" className="justify-self-start px-0">Não achei a unidade · registrar como não identificada</Button>
      </div>
    </Folha>
  )
}

/* ---------------- REC-006 · Entrada manual ---------------- */

function EntradaManual() {
  return (
    <Folha
      fundo="Receber · câmera indisponível"
      titulo="Registrar sem foto"
      descricao="Fica marcado como registro manual, com seu nome e o horário."
      rodape={<Button shape="pill" size="lg" className="w-full"><CheckCheckIcon aria-hidden />Salvar e próxima</Button>}
    >
      <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
        <Field>
          <FieldLabel htmlFor="m-unidade">Unidade</FieldLabel>
          <Input id="m-unidade" defaultValue="C-021" inputMode="text" autoComplete="off" />
          <FieldDescription>Ana Lima · Thiago Lima</FieldDescription>
        </Field>
        <div className="grid gap-2">
          <p className="text-sm font-medium">Transportadora</p>
          <ToggleGroup type="single" defaultValue="correios" aria-label="Transportadora" className="w-full min-w-0 flex-wrap justify-start gap-2" spacing={2}>
            {["Correios", "Mercado Livre", "Amazon", "Shopee", "Outra"].map((t) => (
              <ToggleGroupItem key={t} value={t.toLowerCase()} className="rounded-full px-4">{t}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p aria-hidden className="text-sm font-medium">Volumes</p>
          <QuantityStepper label="Volumes" defaultValue={1} min={1} max={20} />
        </div>
        <Field>
          <FieldLabel htmlFor="m-obs">Observação (opcional)</FieldLabel>
          <Textarea id="m-obs" rows={2} placeholder="Ex.: caixa amassada na lateral" />
        </Field>
      </form>
    </Folha>
  )
}

/* ---------------- REC-008 · Conclusão do lote / QR ---------------- */

// Teste de degradê pedido em 03/11: azul-claro da paleta no topo, cinza do fundo no meio, branco no fim.
const DEGRADE = { backgroundImage: "linear-gradient(180deg, var(--wc-accent-soft) 0%, var(--wc-bg) 45%, var(--wc-surface) 100%)" } as React.CSSProperties

function LoteConcluido() {
  return (
    <div className="flex h-full flex-col" style={DEGRADE}>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-10 pb-4">
        <Result status="success" title="8 encomendas recebidas" description="Lote das 14:10 · Portaria principal. Os avisos saem por WhatsApp agora." />
        <Card className="mt-6 gap-4 rounded-3xl py-5">
          <CardContent className="grid justify-items-center gap-3 px-4">
            <QRCode value="pz:loc:7F3A-B304" size={148} label="Código para achar o volume B-304" />
            <p className="font-mono text-lg font-semibold">B-304 · C2</p>
            <p className="text-center text-xs text-muted-foreground">O QR só ajuda a achar o volume na prateleira. Não libera retirada.</p>
            <Button variant="outline" shape="pill"><PrinterIcon aria-hidden />Imprimir etiquetas do lote</Button>
          </CardContent>
        </Card>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ["8", "registradas"],
            ["1", "sem foto"],
            ["0", "não identificadas"],
          ].map(([n, l]) => (
            <Card key={l} className="gap-0 rounded-2xl py-3">
              <CardContent className="px-2">
                <p className="font-display text-2xl font-bold">{n}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Rodape>
        <Button shape="pill" size="lg"><CameraIcon aria-hidden />Novo lote</Button>
        <Button variant="ghost" shape="pill">Ir para a fila</Button>
      </Rodape>
    </div>
  )
}

/* ---------------- REC-009 · Pendências no aparelho ---------------- */

function Pendencias() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar title="No aparelho" leading={<Voltar label="Voltar para a fila" />} />
        <div className="grid gap-4 px-4">
          <Banner variant="brand" className="rounded-2xl">
            <WifiOffIcon aria-hidden />
            <BannerContent>
              <BannerTitle>Sem conexão desde 13:52</BannerTitle>
              <BannerDescription>Pode continuar recebendo. Tudo vai sozinho quando a rede voltar.</BannerDescription>
            </BannerContent>
          </Banner>
          <Card className="gap-3 rounded-3xl py-4">
            <CardContent className="grid gap-2 px-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Enviados 2 de 5</span>
                <span className="text-muted-foreground">tentando de novo em 20 s</span>
              </div>
              <Progress value={40} aria-label="Enviados 2 de 5" />
            </CardContent>
          </Card>
          <ItemGroup className="gap-2">
            {[
              ["B-108", "Rafael Costa · 13:58"],
              ["D-410", "Lucas Martins · 13:55"],
              ["A-207", "Retirada · 13:54"],
            ].map(([u, d]) => (
              <Item key={u} variant="outline">
                <ItemMedia variant="icon"><PackageIcon aria-hidden /></ItemMedia>
                <ItemContent>
                  <ItemTitle className="font-mono text-base">{u}</ItemTitle>
                  <ItemDescription>{d}</ItemDescription>
                </ItemContent>
                <ItemActions><EstadoBadge estado="offline" /></ItemActions>
              </Item>
            ))}
            <Item variant="outline">
              <ItemMedia variant="icon"><GitMergeIcon aria-hidden /></ItemMedia>
              <ItemContent>
                <ItemTitle className="font-mono text-base">B-304</ItemTitle>
                <ItemDescription>Etiqueta repetida em outro aparelho</ItemDescription>
              </ItemContent>
              <ItemActions><Badge variant="warning"><AlertTriangleIcon aria-hidden />Conflito</Badge></ItemActions>
            </Item>
          </ItemGroup>
          <p className="text-xs text-muted-foreground">Nada daqui é apagado. Conflito vai para você decidir, nunca é descartado.</p>
        </div>
      </div>
      <Rodape>
        <Button variant="outline" shape="pill" size="lg"><RefreshCwIcon aria-hidden />Tentar enviar agora</Button>
      </Rodape>
    </div>
  )
}

/* ---------------- REC-010 · Resolver conflito ---------------- */

function Conflito() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar title="Resolver conflito" leading={<Voltar label="Voltar para pendências" />} />
        <div className="grid gap-4 px-4">
          <p className="text-sm text-muted-foreground">A mesma etiqueta foi registrada em dois aparelhos enquanto um estava sem rede. Os dois registros ficam guardados.</p>
          {[
            ["Este aparelho", "Carlos · 13:58 · B-304 · C2", "Mariana Souza"],
            ["Aparelho da recepção", "Joana · 14:01 · B-304 · Volume grande", "Qualquer morador"],
          ].map(([t, d, q]) => (
            <Card key={t} className="gap-2 rounded-3xl py-4">
              <CardHeader className="px-4">
                <CardDescription>{t}</CardDescription>
                <CardTitle className="text-base">{d}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 text-sm text-muted-foreground">Para: {q}</CardContent>
            </Card>
          ))}
          <div className="grid gap-2">
            <p className="text-sm font-medium">O que aconteceu?</p>
            <RadioGroup defaultValue="mesma" aria-label="Decisão" className="grid gap-2">
              <RadioGroupCard value="mesma">
                <RadioGroupCardContent>
                  <RadioGroupCardTitle>É a mesma encomenda</RadioGroupCardTitle>
                  <RadioGroupCardDescription>Vale o registro de 13:58. O outro vira “duplicado”, com o motivo.</RadioGroupCardDescription>
                </RadioGroupCardContent>
              </RadioGroupCard>
              <RadioGroupCard value="duas">
                <RadioGroupCardContent>
                  <RadioGroupCardTitle>São duas encomendas</RadioGroupCardTitle>
                  <RadioGroupCardDescription>Os dois seguem na fila.</RadioGroupCardDescription>
                </RadioGroupCardContent>
              </RadioGroupCard>
            </RadioGroup>
          </div>
        </div>
      </div>
      <Rodape>
        <Button shape="pill" size="lg">Confirmar decisão</Button>
      </Rodape>
    </div>
  )
}

/* ---------------- CUS-002 + CUS-003 · Detalhe e linha do tempo ---------------- */

function Detalhe() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar
          title="B-304"
          leading={<Voltar label="Voltar para a fila" />}
          trailing={<Button variant="ghost" size="icon" aria-label="Mostrar QR"><QrCodeIcon aria-hidden /></Button>}
        />
        <div className="grid gap-4 px-4">
          <Card className="gap-3 rounded-3xl py-4">
            <CardHeader className="px-4">
              <div className="flex flex-wrap items-center gap-2"><EstadoBadge estado="pronta" /><Badge variant="outline"><MapPinIcon aria-hidden />C2</Badge></div>
              <CardTitle className="text-lg">Mariana Souza</CardTitle>
              <CardDescription>Mercado Livre · 1 volume · há 2 h</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 px-4">
              <Button variant="outline" shape="pill"><ArrowRightLeftIcon aria-hidden />Mover</Button>
              <Button variant="outline" shape="pill"><PencilIcon aria-hidden />Corrigir</Button>
            </CardContent>
          </Card>
          <section aria-labelledby="t-linha" className="grid gap-3">
            <h3 id="t-linha" className="text-sm font-semibold">Linha do tempo</h3>
            <Card className="rounded-3xl py-4">
              <CardContent className="px-4">
                <Timeline>
                  <TimelineItem status="current" icon={<MessageCircleIcon aria-hidden />}>
                    <TimelineTitle>Aviso entregue no WhatsApp</TimelineTitle>
                    <TimelineDescription>Lido às 12:20</TimelineDescription>
                    <TimelineTime dateTime="2026-11-03T12:06">12:06</TimelineTime>
                  </TimelineItem>
                  <TimelineItem icon={<MapPinIcon aria-hidden />}>
                    <TimelineTitle>Guardada na C2</TimelineTitle>
                    <TimelineDescription>Carlos · Portaria principal</TimelineDescription>
                    <TimelineTime dateTime="2026-11-03T11:44">11:44</TimelineTime>
                  </TimelineItem>
                  <TimelineItem icon={<CameraIcon aria-hidden />}>
                    <TimelineTitle>Recebida com foto da etiqueta</TimelineTitle>
                    <TimelineDescription>Sugestão lida: B-304 · confirmada por Carlos</TimelineDescription>
                    <TimelineTime dateTime="2026-11-03T11:42">11:42</TimelineTime>
                  </TimelineItem>
                </Timeline>
              </CardContent>
            </Card>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheckIcon aria-hidden className="size-4" />Cada passo fica guardado. Correção cria um passo novo.</p>
          </section>
        </div>
      </div>
      <Rodape>
        <Button shape="pill" size="lg"><PackageCheckIcon aria-hidden />Entregar</Button>
      </Rodape>
    </div>
  )
}

/* ---------------- CUS-004 · Correção crítica ---------------- */

function Correcao() {
  return (
    <Folha
      fundo="B-304 · Mariana Souza"
      titulo="Trocar unidade"
      descricao="O aviso já saiu. Trocar agora pede motivo e fica na auditoria."
      rodape={<Button variant="destructive" shape="pill" size="lg" className="w-full">Trocar para B-034</Button>}
    >
      <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Card className="gap-1 rounded-2xl py-3 text-center"><CardContent className="px-2"><p className="text-xs text-muted-foreground">De</p><p className="font-mono text-lg font-semibold">B-304</p></CardContent></Card>
          <ArrowRightLeftIcon aria-hidden className="size-5 text-muted-foreground" />
          <Card className="gap-1 rounded-2xl py-3 text-center"><CardContent className="px-2"><p className="text-xs text-muted-foreground">Para</p><p className="font-mono text-lg font-semibold">B-034</p></CardContent></Card>
        </div>
        <Field>
          <FieldLabel htmlFor="c-motivo">Motivo (obrigatório)</FieldLabel>
          <Textarea id="c-motivo" rows={3} defaultValue="Etiqueta dizia 034, li 304 na pressa." />
        </Field>
        <Alert variant="warning">
          <EyeOffIcon aria-hidden />
          <AlertTitle>O que a Mariana vai receber</AlertTitle>
          <AlertDescription>“O aviso das 12:06 foi enviado por engano.” Ela não fica sabendo para quem era a encomenda.</AlertDescription>
        </Alert>
        <p className="text-xs text-muted-foreground">O registro antigo continua na linha do tempo, marcado como corrigido.</p>
      </form>
    </Folha>
  )
}

/* ---------------- CUS-007 · Não identificadas ---------------- */

function NaoIdentificadas() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar title="Não identificadas" large leading={<Voltar label="Voltar" />} trailing={<span className="pe-3 text-sm text-muted-foreground">3</span>} />
        <div className="grid gap-3 px-4">
          <p className="text-sm text-muted-foreground">Ninguém foi avisado ainda. Escolha a unidade para liberar o aviso.</p>
          {[
            ["Etiqueta ilegível", "Correios · ontem 17:40 · A1", "1 dia"],
            ["Nome sem unidade", "“Fernanda R.” · Shopee · hoje 09:12", "5 h"],
            ["Unidade que não existe", "“Bloco F 12” · Amazon · hoje 10:30", "4 h"],
          ].map(([t, d, h]) => (
            <Card key={t} className="gap-3 rounded-3xl py-4">
              <CardContent className="flex gap-3 px-4">
                <div aria-hidden className="grid size-16 shrink-0 place-items-center rounded-2xl border bg-sunken text-muted-foreground"><ImageIcon className="size-6" /></div>
                <div className="grid min-w-0 flex-1 gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{t}</p>
                    <Badge variant="outline"><ClockIcon aria-hidden />{h}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{d}</p>
                  <Button size="sm" shape="pill" className="mt-1 justify-self-start"><CircleHelpIcon aria-hidden />Identificar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground">A foto da etiqueta é privada: só a equipe vê, e nunca vai para morador.</p>
        </div>
      </div>
    </div>
  )
}

/* ---------------- RET-001 · Selecionar encomendas ---------------- */

const ETAPAS = [{ title: "Encomendas" }, { title: "Quem recebe" }, { title: "Assinatura" }]

function SelecionarRetirada() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar title="Entregar" leading={<Fechar label="Cancelar entrega" />} />
        <div className="grid gap-4 px-4">
          <Stepper steps={ETAPAS} current={0} variant="dots" />
          <SearchBar placeholder="Unidade" aria-label="Buscar unidade" inputClassName={BUSCA} defaultValue="B-304" />
          <p className="text-sm font-medium">B-304 · 3 na custódia</p>
          <div className="grid gap-2">
            {[
              ["ml", "Mercado Livre", "Mariana · C2 · hoje 11:42", true],
              ["cor", "Correios · caixa média", "Mariana · C2 · ontem 18:05", true],
              ["am", "Amazon", "Pedro · A1 · hoje 09:30", false],
            ].map(([v, t, d, on]) => (
              <CheckboxCard key={v as string} value={v as string} defaultChecked={on as boolean}>
                <CheckboxCardContent>
                  <CheckboxCardTitle>{t}</CheckboxCardTitle>
                  <CheckboxCardDescription>{d}</CheckboxCardDescription>
                </CheckboxCardContent>
              </CheckboxCard>
            ))}
          </div>
        </div>
      </div>
      <Rodape>
        <Button shape="pill" size="lg">Continuar com 2</Button>
      </Rodape>
    </div>
  )
}

/* ---------------- RET-002 · Quem recebe ---------------- */

function QuemRecebe() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar title="Quem está retirando?" leading={<Voltar label="Voltar para encomendas" />} />
        <div className="grid gap-4 px-4">
          <Stepper steps={ETAPAS} current={1} variant="dots" />
          <RadioGroup defaultValue="outra" aria-label="Quem retira" className="grid gap-2">
            {[
              ["mariana", "Mariana Souza", "Titular · destinatária das 2"],
              ["pedro", "Pedro Souza", "Morador da B-304"],
              ["outra", "Outra pessoa", "Familiar, vizinho, diarista…"],
            ].map(([v, t, d]) => (
              <RadioGroupCard key={v} value={v}>
                <UserIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <RadioGroupCardContent>
                  <RadioGroupCardTitle>{t}</RadioGroupCardTitle>
                  <RadioGroupCardDescription>{d}</RadioGroupCardDescription>
                </RadioGroupCardContent>
              </RadioGroupCard>
            ))}
          </RadioGroup>
          <Card className="gap-4 rounded-3xl py-4">
            <CardContent className="grid gap-4 px-4">
              <Field>
                <FieldLabel htmlFor="r-nome">Nome completo</FieldLabel>
                <Input id="r-nome" defaultValue="Lúcia Ferreira" autoComplete="off" />
              </Field>
              <Field>
                <FieldLabel htmlFor="r-doc">CPF (opcional)</FieldLabel>
                <InputDocument id="r-doc" accept="cpf" />
                <FieldDescription>Fica só no comprovante. Não aparece na fila.</FieldDescription>
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
      <Rodape>
        <Button shape="pill" size="lg">Continuar</Button>
      </Rodape>
    </div>
  )
}

/* ---------------- RET-003 · Assinatura ---------------- */

function Assinatura() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavigationBar title="Assinatura" leading={<Voltar label="Voltar para quem recebe" />} />
        <div className="grid gap-4 px-4">
          <Stepper steps={ETAPAS} current={2} variant="dots" />
          <Card className="gap-2 rounded-3xl py-4">
            <CardContent className="px-4">
              <DescriptionList layout="horizontal">
                <DescriptionItem label="Unidade">B-304</DescriptionItem>
                <DescriptionItem label="Saem">2 encomendas</DescriptionItem>
                <DescriptionItem label="Retira">Lúcia Ferreira</DescriptionItem>
              </DescriptionList>
            </CardContent>
          </Card>
          <SignaturePad label="Assinatura de Lúcia Ferreira" placeholder="Assine com o dedo" />
          <p className="text-xs text-muted-foreground">Ao assinar, Lúcia confirma que recebeu as 2 encomendas. Mariana recebe o comprovante no WhatsApp.</p>
        </div>
      </div>
      <Rodape>
        <Button shape="pill" size="lg"><CheckCheckIcon aria-hidden />Registrar retirada</Button>
      </Rodape>
    </div>
  )
}

/* ---------------- RET-004 · Comprovante ---------------- */

function Comprovante() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-10 pb-4">
        <Result status="success" title="Retirada registrada" description="2 encomendas da B-304 saíram às 14:32." />
        <Card className="mt-6 gap-3 rounded-3xl py-4">
          <CardContent className="px-4">
            <DescriptionList layout="horizontal">
              <DescriptionItem label="Retirou">Lúcia Ferreira</DescriptionItem>
              <DescriptionItem label="Em nome de">Mariana Souza</DescriptionItem>
              <DescriptionItem label="Entregou">Carlos · Portaria principal</DescriptionItem>
              <DescriptionItem label="Comprovante" copyValue="RT-2611-0432">RT-2611-0432</DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>
        <Banner variant="success" className="mt-4 rounded-2xl">
          <CheckCircle2Icon aria-hidden />
          <BannerContent>
            <BannerDescription>Comprovante enviado para Mariana no WhatsApp.</BannerDescription>
          </BannerContent>
        </Banner>
        <Banner variant="info" className="mt-3 rounded-2xl">
          <CloudUploadIcon aria-hidden />
          <BannerContent>
            <BannerDescription>Sem rede? A retirada fica salva no aparelho e o comprovante sai quando voltar.</BannerDescription>
          </BannerContent>
        </Banner>
      </div>
      <Rodape>
        <Button shape="pill" size="lg">Voltar para a fila</Button>
      </Rodape>
    </div>
  )
}

/* ---------------- Montagem ---------------- */

function Grupo({ id, titulo, texto, children }: { id: string; titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-4">
      <div className="grid gap-1">
        <h2 id={id} className="font-display text-2xl font-bold">{titulo}</h2>
        <p className="max-w-2xl text-muted-foreground">{texto}</p>
      </div>
      <div className="relative flex gap-8 overflow-x-auto pb-6">{children}</div>
    </section>
  )
}

export function Fluxo() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={NEVOA} className="min-h-dvh bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="mx-auto grid max-w-[1600px] gap-14">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-bold">Receber e entregar</h1>
          <p className="max-w-2xl text-muted-foreground">O resto do fluxo do porteiro no celular: escolher unidade, registrar sem foto, fechar o lote, trabalhar sem rede, corrigir e entregar. Role cada linha para o lado.</p>
        </header>
        <Grupo id="g-rec" titulo="Recebimento" texto="Unidade primeiro, nome depois. Sem câmera ou sem rede o recebimento continua.">
          <Prancha id="REC-004" titulo="Escolher unidade"><EscolherUnidade /></Prancha>
          <Prancha id="REC-006" titulo="Registrar sem foto"><EntradaManual /></Prancha>
          <Prancha id="REC-008" titulo="Lote concluído e QR"><LoteConcluido /></Prancha>
          <Prancha id="REC-009" titulo="Pendências no aparelho"><Pendencias /></Prancha>
          <Prancha id="REC-010" titulo="Resolver conflito"><Conflito /></Prancha>
        </Grupo>
        <Grupo id="g-cus" titulo="Custódia" texto="Tudo vira passo na linha do tempo. Correção cria passo novo e não revela o destino certo ao contato errado.">
          <Prancha id="CUS-002 + 003" titulo="Detalhe e linha do tempo"><Detalhe /></Prancha>
          <Prancha id="CUS-004" titulo="Correção depois do aviso"><Correcao /></Prancha>
          <Prancha id="CUS-007" titulo="Não identificadas"><NaoIdentificadas /></Prancha>
        </Grupo>
        <Grupo id="g-ret" titulo="Retirada" texto="Três passos: o que sai, quem leva e a assinatura. O QR só localiza o volume.">
          <Prancha id="RET-001" titulo="Escolher encomendas"><SelecionarRetirada /></Prancha>
          <Prancha id="RET-002" titulo="Quem retira"><QuemRecebe /></Prancha>
          <Prancha id="RET-003" titulo="Assinatura"><Assinatura /></Prancha>
          <Prancha id="RET-004" titulo="Comprovante"><Comprovante /></Prancha>
        </Grupo>
      </div>
    </div>
  )
}
