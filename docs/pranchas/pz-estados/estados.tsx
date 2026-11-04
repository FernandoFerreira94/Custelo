"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  CloudOffIcon,
  ConstructionIcon,
  InboxIcon,
  KeyRoundIcon,
  MessageCircleOffIcon,
  PackageIcon,
  RefreshCwIcon,
  SearchXIcon,
  WifiOffIcon,
} from "lucide-react"
import { toast } from "sonner"
import { BellRingIcon, CheckCircle2Icon, PackageCheckIcon } from "lucide-react"

import { Busca, Celular, Logo, Moldura, PALETAS, Perfil, Trilho, vars } from "../pz-dash/painel"
import { Alert, AlertDescription, AlertTitle } from "@/registry/webcode/ui/alert"
import { Banner, BannerContent, BannerDescription, BannerTitle } from "@/registry/webcode/ui/banner"
import { Button } from "@/registry/webcode/ui/button"
import { notify, NotificationBannerHost } from "@/registry/webcode/ui/notification-banner"
import { Badge } from "@/registry/webcode/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { EmptyState } from "@/registry/webcode/ui/empty"
import { Progress } from "@/registry/webcode/ui/progress"
import { Result } from "@/registry/webcode/ui/result"
import { Skeleton, SkeletonRow, SkeletonTable, SkeletonText } from "@/registry/webcode/ui/skeleton"
import { Spinner } from "@/registry/webcode/ui/spinner"

// Estados do sistema (03/11/2026): avisos rápidos, alertas, páginas de erro, carregamento, esqueleto e vazio.
// Paleta Névoa, só componentes da WebCode UI.

function Bloco({ id, titulo, texto, children }: { id: string; titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid min-w-0 gap-5">
      <div className="grid gap-1">
        <h2 id={id} className="font-display text-3xl font-bold">{titulo}</h2>
        <p className="max-w-[70ch] text-muted-foreground">{texto}</p>
      </div>
      {children}
    </section>
  )
}

/* ---------------- Avisos rápidos (toast) ---------------- */

// Os 3 avisos rápidos da biblioteca, para o Fernando escolher (03/11). Mesmo texto nos três.
const OPCOES = [
  {
    id: "A",
    nome: "Toast",
    uso: "Para o que a pessoa acabou de fazer: registrou, enviou, salvou, lote.",
    comp: "sonner",
    onde: "Embaixo, empilha vários.",
    bom: "Padrão de mercado, aguenta vários seguidos (lote).",
    sucesso: () => toast.success("B-304 registrada", { description: "Aviso sai por WhatsApp agora." }),
    erro: () => toast.error("Aviso para A-112 não chegou", { description: "Número sem WhatsApp.", action: { label: "Ver", onClick: () => {} } }),
    lote: () => toast.promise(new Promise((r) => setTimeout(r, 1800)), { loading: "Enviando 8 avisos…", success: "8 avisos enviados", error: "Falhou" }),
  },
  {
    id: "C",
    nome: "Banner de notificação",
    uso: "Para o que chega de fora: morador leu, retirada em outra portaria, WhatsApp caiu.",
    comp: "notification-banner",
    onde: "Desce do topo, como notificação do celular.",
    bom: "Bom para algo que chega de fora (morador leu, retirada em outra portaria).",
    sucesso: () => notify({ app: "PacoteZap", icon: <PackageCheckIcon />, time: "agora", title: "B-304 registrada", body: "Aviso sai por WhatsApp agora." }),
    erro: () => notify({ app: "PacoteZap", icon: <BellRingIcon />, time: "agora", title: "Aviso para A-112 não chegou", body: "Número sem WhatsApp. Toque para ver." }),
    lote: () => notify({ app: "PacoteZap", icon: <BellRingIcon />, time: "agora", title: "8 avisos enviados", body: "Lote das 14:10." }),
  },
]

function Avisos() {
  return (
    <div className="grid gap-6">
      <NotificationBannerHost />
      <div className="grid gap-6 lg:grid-cols-2">
        {OPCOES.map((o) => (
          <Card key={o.id} className="rounded-3xl">
            <CardHeader>
              <p className="font-mono text-xs text-muted-foreground">@webcode/{o.comp}</p>
              <CardTitle className="text-xl">{o.nome}</CardTitle>
              <CardDescription>{o.onde}</CardDescription>
              <CardAction><Badge variant="success"><CheckCircle2Icon aria-hidden />Escolhido</Badge></CardAction>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm font-medium">{o.uso}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" shape="pill" size="sm" onClick={o.sucesso}>Sucesso</Button>
                <Button variant="outline" shape="pill" size="sm" onClick={o.erro}>Erro</Button>
                <Button variant="outline" shape="pill" size="sm" onClick={o.lote}>Lote</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Complementos da biblioteca que entram de qualquer jeito: barra de progresso para importação (progress-toast). Falha de aviso também vira estado na fila e no painel; o aviso rápido nunca é o único lugar.</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <Alert variant="danger">
          <MessageCircleOffIcon aria-hidden />
          <AlertTitle>WhatsApp desconectado desde 13:40</AlertTitle>
          <AlertDescription>12 avisos esperando. A portaria continua recebendo normalmente.</AlertDescription>
        </Alert>
        <Alert variant="warning">
          <AlertTriangleIcon aria-hidden />
          <AlertTitle>3 encomendas passaram do prazo</AlertTitle>
          <AlertDescription>C-021, A-207 e D-410 estão há mais de 7 dias.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <RefreshCwIcon aria-hidden />
          <AlertTitle>Tudo sincronizado</AlertTitle>
          <AlertDescription>5 registros feitos sem rede foram enviados.</AlertDescription>
        </Alert>
        <Banner variant="brand" className="rounded-2xl">
          <WifiOffIcon aria-hidden />
          <BannerContent>
            <BannerTitle>Sem conexão</BannerTitle>
            <BannerDescription>Pode continuar. 3 registros salvos neste aparelho.</BannerDescription>
          </BannerContent>
        </Banner>
      </div>
    </div>
  )
}

/* ---------------- Páginas de erro ---------------- */

const ERROS = [
  { status: "404" as const, title: "Página não encontrada", description: "O endereço mudou ou não existe. Nada foi perdido.", acao: "Voltar para Hoje" },
  { status: "403" as const, title: "Sem permissão para esta área", description: "Seu papel não inclui esta tela. Peça ao gestor se precisar.", acao: "Voltar" },
  { status: "500" as const, title: "Algo deu errado do nosso lado", description: "Já fomos avisados. Código PZ-500-8F2A, informe ao suporte se repetir.", acao: "Tentar de novo" },
]

function Erros() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {ERROS.map((e) => (
          <Card key={e.status} className="rounded-3xl py-10">
            <CardContent>
              <Result
                status={e.status}
                title={e.title}
                description={e.description}
                extra={
                  <>
                    <Button shape="pill">{e.acao}</Button>
                    <Button variant="ghost" shape="pill">Falar com o suporte</Button>
                  </>
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="relative flex gap-8 overflow-x-auto pb-4">
        <Celular id="ERR-SESSAO" titulo="Sessão expirada" nota="Entra de novo sem perder o que estava salvo no aparelho.">
          <div className="flex h-full flex-col justify-center gap-6 bg-muted px-6">
            <Result
              status="warning"
              icon={<KeyRoundIcon aria-hidden />}
              title="Sua sessão terminou"
              description="Por segurança, entre de novo. Os 3 registros salvos no aparelho continuam aqui."
              extra={<Button shape="pill" size="lg">Entrar de novo</Button>}
            />
          </div>
        </Celular>
        <Celular id="ERR-OFFLINE" titulo="Sem internet ao abrir" nota="Abre do cache e deixa receber. Nunca trava o recebimento.">
          <div className="flex h-full flex-col justify-center gap-6 bg-muted px-6">
            <Result
              status="info"
              icon={<CloudOffIcon aria-hidden />}
              title="Você está sem internet"
              description="Dá para receber e entregar normalmente. Tudo vai sozinho quando a rede voltar."
              extra={
                <>
                  <Button shape="pill" size="lg">Continuar sem internet</Button>
                  <Button variant="ghost" shape="pill"><RefreshCwIcon aria-hidden />Tentar conectar</Button>
                </>
              }
            />
          </div>
        </Celular>
        <Celular id="ERR-MANUT" titulo="Manutenção" nota="Aviso com horário de volta. O app do porteiro segue funcionando sem rede.">
          <div className="flex h-full flex-col justify-center gap-6 bg-muted px-6">
            <Result
              status="info"
              icon={<ConstructionIcon aria-hidden />}
              title="Voltamos às 03:30"
              description="Manutenção programada. A portaria continua registrando no aparelho."
              extra={<Button variant="outline" shape="pill" size="lg">Ver status</Button>}
            />
          </div>
        </Celular>
      </div>
    </div>
  )
}

/* ---------------- Carregamento e esqueleto ---------------- */

function EsqueletoDesktop() {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-6" aria-busy="true" aria-label="Carregando painel">
      <Trilho />
      <div className="grid content-start gap-6">
        <header className="flex items-center justify-between gap-4">
          <Busca />
          <Perfil />
        </header>
        <div className="grid gap-2">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-full" />
        </div>
        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-5">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="rounded-3xl">
              <CardContent className="grid gap-4">
                <Skeleton delay={i * 80} className="h-5 w-32 rounded-full" />
                <Skeleton delay={i * 80} className="h-40 w-full rounded-2xl" />
                <SkeletonText lines={2} delay={i * 80} />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-3xl">
          <CardContent>
            <SkeletonTable rows={5} columns={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EsqueletoFila() {
  return (
    <div className="flex h-full flex-col gap-4 bg-muted px-4 pt-6" aria-busy="true" aria-label="Carregando fila">
      <Skeleton className="h-9 w-24 rounded-xl" />
      <Skeleton className="h-11 w-full rounded-full" />
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)}
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <Card key={i} className="rounded-3xl py-4">
          <CardContent className="px-4">
            <SkeletonRow delay={i * 60} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Carregando() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-muted px-8" role="status" aria-live="polite">
      <Logo nome />
      <Spinner size="lg" aria-hidden />
      <div className="grid w-full gap-2">
        <p className="text-center text-sm text-muted-foreground">Baixando a fila para usar sem internet…</p>
        <Progress value={64} aria-label="Preparando o aparelho, 64%" />
      </div>
    </div>
  )
}

function Botoes() {
  const [enviando, setEnviando] = React.useState(false)
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="text-xl">Dentro da tela</CardTitle>
        <CardDescription>Botão segura a largura enquanto carrega; ação longa mostra progresso.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button shape="pill" loading={enviando} onClick={() => { setEnviando(true); setTimeout(() => setEnviando(false), 1800) }}>
            Salvar morador
          </Button>
          <Button variant="outline" shape="pill" loading>Reenviando aviso</Button>
          <span className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner size="sm" aria-hidden />Atualizando a fila</span>
        </div>
        <div className="grid gap-2">
          <div className="flex justify-between text-sm"><span className="font-medium">Importando planilha</span><span className="text-muted-foreground">148 de 212</span></div>
          <Progress value={70} aria-label="Importando planilha, 148 de 212" />
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------- Vazio ---------------- */

function Vazios() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="rounded-3xl py-8">
        <CardContent>
          <EmptyState
            variant="first-use"
            icon={<PackageIcon aria-hidden />}
            title="Nenhuma encomenda na portaria"
            description="Quando chegar a primeira, ela aparece aqui."
            action={<Button shape="pill">Registrar encomenda</Button>}
          />
        </CardContent>
      </Card>
      <Card className="rounded-3xl py-8">
        <CardContent>
          <EmptyState
            variant="no-results"
            icon={<SearchXIcon aria-hidden />}
            title="Nada com “B-3045”"
            description="Confira o número ou busque pelo nome do morador."
            action={<Button variant="outline" shape="pill">Limpar busca</Button>}
          />
        </CardContent>
      </Card>
      <Card className="rounded-3xl py-8">
        <CardContent>
          <EmptyState
            variant="first-use"
            icon={<InboxIcon aria-hidden />}
            title="Sem falhas de aviso"
            description="Todos os avisos de hoje chegaram."
          />
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------- página ---------------- */

export function Estados() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(PALETAS[0].vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-14">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Estados do sistema</h1>
          <p className="max-w-[65ch] text-muted-foreground">Avisos, alertas, erros, carregamento, esqueleto e telas vazias. Estado nunca só por cor: sempre ícone e texto.</p>
        </header>
        <Bloco id="e-avisos" titulo="Avisos e alertas" texto="Decidido em 03/11: toast para ações da própria pessoa e banner para o que chega de fora. Clique para ver. Alerta fixo é para o que continua valendo até alguém resolver.">
          <Avisos />
        </Bloco>
        <Bloco id="e-erros" titulo="Páginas de erro" texto="Sempre explica o que houve e dá uma saída. Erro nunca mostra detalhe técnico, só um código para o suporte.">
          <Erros />
        </Bloco>
        <Bloco id="e-carregar" titulo="Carregamento e esqueleto" texto="Esqueleto no formato da tela que vai chegar. Spinner só para espera curta; progresso quando dá para medir.">
          <Moldura id="LOAD-DASH" titulo="Painel carregando" nota="Trilho e busca já aparecem; os cartões chegam no lugar do esqueleto.">
            <EsqueletoDesktop />
          </Moldura>
          <div className="relative flex gap-8 overflow-x-auto pb-4">
            <Celular id="LOAD-FILA" titulo="Fila carregando" nota="Mesmo formato dos cartões da fila.">
              <EsqueletoFila />
            </Celular>
            <Celular id="LOAD-1A-VEZ" titulo="Preparando o aparelho" nota="Primeira abertura: baixa a fila para funcionar sem rede.">
              <Carregando />
            </Celular>
          </div>
          <Botoes />
        </Bloco>
        <Bloco id="e-vazio" titulo="Telas vazias" texto="Diz por que está vazio e o próximo passo.">
          <Vazios />
        </Bloco>
      </div>
    </div>
  )
}
