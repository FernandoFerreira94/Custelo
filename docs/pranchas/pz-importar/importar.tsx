"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  Building2Icon,
  CheckCircle2Icon,
  DownloadIcon,
  DumbbellIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileUpIcon,
  HomeIcon,
  KeyRoundIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SparklesIcon,
  StoreIcon,
  Undo2Icon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react"

import { Busca, Moldura, PALETAS, Perfil, Trilho, vars } from "../pz-dash/painel"
import { Alert, AlertDescription, AlertTitle } from "@/registry/webcode/ui/alert"
import { Badge } from "@/registry/webcode/ui/badge"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Checkbox } from "@/registry/webcode/ui/checkbox"
import { DescriptionItem, DescriptionList } from "@/registry/webcode/ui/description-list"
import { EmptyState } from "@/registry/webcode/ui/empty"
import { Field, FieldLabel } from "@/registry/webcode/ui/field"
import { FileUpload } from "@/registry/webcode/ui/file-upload"
import { FilterCounters } from "@/registry/webcode/ui/filter-counters"
import { Input } from "@/registry/webcode/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { Label } from "@/registry/webcode/ui/label"
import { NativeSelect, NativeSelectOption } from "@/registry/webcode/ui/native-select"
import { RadioGroup, RadioGroupCard, RadioGroupCardContent, RadioGroupCardDescription, RadioGroupCardTitle } from "@/registry/webcode/ui/radio-group"
import { Result } from "@/registry/webcode/ui/result"
import { SegmentedBar } from "@/registry/webcode/ui/segmented-bar"
import { StatCard } from "@/registry/webcode/ui/stat-card"
import { Stepper } from "@/registry/webcode/ui/stepper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/webcode/ui/table"

// Importação por arquivo em TODOS os cadastros (04/11/2026). Generaliza IMP-001..004 (que eram só moradores).
// Paleta Névoa + Brasa, só WebCode UI. Nomes, telefones e números são exemplos.

const CARTAO = "rounded-3xl"
const ETAPAS = [{ title: "Enviar arquivo" }, { title: "Conferir e corrigir" }, { title: "Confirmar" }, { title: "Concluir" }]

const CADASTROS = [
  { id: "unidades", nome: "Unidades", desc: "Apartamento, casa, loja, sala", icon: <HomeIcon aria-hidden />, ordem: 1 },
  { id: "moradores", nome: "Moradores", desc: "Titular, morador, inquilino", icon: <UsersIcon aria-hidden />, ordem: 2 },
  { id: "lojistas", nome: "Lojistas", desc: "Loja e contato que recebe", icon: <StoreIcon aria-hidden />, ordem: 2 },
  { id: "funcionarios", nome: "Funcionários", desc: "Vira convite pendente", icon: <BriefcaseIcon aria-hidden />, ordem: 1 },
  { id: "autorizados", nome: "Autorizados a retirar", desc: "Em nome de um morador", icon: <KeyRoundIcon aria-hidden />, ordem: 3 },
  { id: "areas", nome: "Áreas comuns", desc: "Administração, academia", icon: <DumbbellIcon aria-hidden />, ordem: 1 },
]

function Shell({ titulo, sub, acoes, children }: { titulo: string; sub: string; acoes?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-6">
      <Trilho ativo="Unidades e pessoas" />
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

function Fluxo({ etapa, titulo, sub, acoes, children }: { etapa: number; titulo: string; sub: string; acoes?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Shell titulo={titulo} sub={sub} acoes={acoes}>
      <Card className={CARTAO}>
        <CardContent>
          <Stepper steps={ETAPAS} current={etapa} />
        </CardContent>
      </Card>
      {children}
    </Shell>
  )
}

/* ---------------- IMP-010 · entrada em todo cadastro ---------------- */

function Entrada() {
  return (
    <Shell
      titulo="Lojistas"
      sub="Shopping Aurora · 3 pisos · 84 lojas"
      acoes={
        <>
          <Button variant="outline" shape="pill" size="lg"><DownloadIcon aria-hidden />Baixar arquivo de exemplo</Button>
          <Button variant="outline" shape="pill" size="lg"><FileUpIcon aria-hidden />Importar arquivo</Button>
          <Button variant="elevated" shape="pill" size="lg"><PlusIcon aria-hidden />Cadastrar lojista</Button>
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)_420px] items-start gap-6">
        <Card className={CARTAO}>
          <CardContent className="py-10">
            <EmptyState
              variant="first-use"
              icon={<StoreIcon aria-hidden />}
              title="Nenhum lojista ainda"
              description="Cadastre um por um ou traga todos de uma vez num arquivo. Baixe o exemplo, preencha e envie: você confere tudo antes de entrar."
              action={<Button shape="pill" size="lg"><FileUpIcon aria-hidden />Importar arquivo</Button>}
              secondaryAction={<Button variant="outline" shape="pill" size="lg"><DownloadIcon aria-hidden />Baixar arquivo de exemplo</Button>}
            />
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Importar em todo cadastro</CardTitle>
            <CardDescription>Mesmo botão e mesmo fluxo. A ordem evita erro: a unidade precisa existir antes da pessoa.</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {CADASTROS.map((c) => (
                <Item key={c.id} variant="outline" size="sm">
                  <ItemMedia variant="icon">{c.icon}</ItemMedia>
                  <ItemContent>
                    <ItemTitle>{c.nome}</ItemTitle>
                    <ItemDescription>Passo {c.ordem} · {c.desc}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button size="icon-sm" variant="ghost" shape="pill" aria-label={`Baixar exemplo de ${c.nome}`}><DownloadIcon aria-hidden /></Button>
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

/* ---------------- IMP-011 · enviar arquivo ---------------- */

const COLS_UNIDADES = [
  { c: "Tipo", ob: true, ex: "Apartamento, Casa, Loja, Sala" },
  { c: "Bloco/Torre/Quadra", ob: false, ex: "A · vazio se não tiver" },
  { c: "Número", ob: true, ex: "112 · 01 · L-04" },
  { c: "Andar", ob: false, ex: "11 · térreo = 0" },
  { c: "Como aparece na etiqueta", ob: false, ex: "A112; Bl A ap 112" },
]

function Enviar() {
  return (
    <Fluxo etapa={0} titulo="Importar unidades" sub="Residencial Jardins · Excel, CSV ou PDF">
      <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>O que você vai cadastrar</CardTitle>
            <CardDescription>Já vem marcado pela tela de onde você veio. Troque se precisar.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <RadioGroup defaultValue="unidades" className="grid grid-cols-3 gap-3">
              {CADASTROS.map((c) => (
                <RadioGroupCard key={c.id} value={c.id}>
                  <RadioGroupCardContent>
                    <RadioGroupCardTitle>{c.nome}</RadioGroupCardTitle>
                    <RadioGroupCardDescription>{c.desc}</RadioGroupCardDescription>
                  </RadioGroupCardContent>
                </RadioGroupCard>
              ))}
            </RadioGroup>
            <FileUpload accept=".xlsx,.xls,.csv,.pdf" maxSize={10 * 1024 * 1024} maxFiles={1} hint="Arraste aqui ou escolha · Excel e CSV até 5 MB (5.000 linhas) · PDF até 10 MB (20 páginas)" />
            <div className="grid grid-cols-2 gap-3">
              <Item variant="outline">
                <ItemMedia variant="icon"><FileSpreadsheetIcon aria-hidden /></ItemMedia>
                <ItemContent>
                  <ItemTitle>Excel ou CSV · leitura exata</ItemTitle>
                  <ItemDescription>Cada coluna vai para o seu campo. Erro aparece na linha certa.</ItemDescription>
                </ItemContent>
              </Item>
              <Item variant="outline">
                <ItemMedia variant="icon"><SparklesIcon aria-hidden /></ItemMedia>
                <ItemContent>
                  <ItemTitle>PDF · leitura assistida</ItemTitle>
                  <ItemDescription>A IA lê a lista e sugere cada linha. Nada entra sem o seu ok.</ItemDescription>
                </ItemContent>
              </Item>
            </div>
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Arquivo de exemplo · Unidades</CardTitle>
              <CardDescription>Já vem com as colunas certas, listas para escolher e uma aba de instruções.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ul className="grid gap-2 text-sm">
                {COLS_UNIDADES.map((c) => (
                  <li key={c.c} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <span>
                      <span className="block font-medium">{c.c}</span>
                      <span className="block text-xs text-muted-foreground">{c.ex}</span>
                    </span>
                    {c.ob ? <Badge variant="danger">Obrigatória</Badge> : <Badge variant="outline">Opcional</Badge>}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button shape="pill"><DownloadIcon aria-hidden />Baixar Excel</Button>
                <Button variant="outline" shape="pill"><DownloadIcon aria-hidden />Baixar CSV</Button>
              </div>
            </CardContent>
          </Card>
          <Alert>
            <AlertTriangleIcon aria-hidden />
            <AlertTitle>Três cuidados que evitam quase todo erro</AlertTitle>
            <AlertDescription>Preencha só a aba &ldquo;Preencha aqui&rdquo;. Não renomeie colunas. Número da unidade como está na porta (01 continua 01).</AlertDescription>
          </Alert>
        </div>
      </div>
    </Fluxo>
  )
}

/* ---------------- IMP-012 · conferir e corrigir por linha ---------------- */

type Sit = "pronta" | "ajustada" | "erro" | "duplicada" | "ignorada"
const LINHAS: { l: number; tipo: string; bloco: string; num: string; sit: Sit; msg?: string; campo?: string }[] = [
  { l: 2, tipo: "Apartamento", bloco: "A", num: "112", sit: "ignorada", msg: "Igual à linha de exemplo do modelo" },
  { l: 3, tipo: "Apartamento", bloco: "A", num: "101", sit: "pronta" },
  { l: 4, tipo: "Apartamento", bloco: "A", num: "102", sit: "ajustada", msg: "“Apto” virou Apartamento" },
  { l: 5, tipo: "Apartamento", bloco: "A", num: "", sit: "erro", msg: "Número é obrigatório", campo: "Número" },
  { l: 6, tipo: "Cobertura", bloco: "A", num: "1501", sit: "erro", msg: "Tipo fora da lista: use Apartamento, Casa, Loja, Sala ou Outro", campo: "Tipo" },
  { l: 7, tipo: "Apartamento", bloco: "B", num: "201", sit: "duplicada", msg: "B-201 já existe no sistema" },
  { l: 8, tipo: "Apartamento", bloco: "B", num: "202", sit: "pronta" },
]

function SitBadge({ s }: { s: Sit }) {
  if (s === "pronta") return <Badge variant="success"><CheckCircle2Icon aria-hidden />Pronta</Badge>
  if (s === "ajustada") return <Badge variant="soft"><RefreshCwIcon aria-hidden />Ajustada</Badge>
  if (s === "erro") return <Badge variant="danger"><XCircleIcon aria-hidden />Corrigir</Badge>
  if (s === "duplicada") return <Badge variant="warning"><AlertTriangleIcon aria-hidden />Duplicada</Badge>
  return <Badge variant="outline">Ignorada</Badge>
}

function Conferir() {
  const [filtro, setFiltro] = React.useState<string | null>("todas")
  return (
    <Fluxo etapa={1} titulo="Importar unidades" sub="Residencial Jardins · unidades-jardins.xlsx · 248 linhas" acoes={<Button shape="pill" size="lg">Revisar e confirmar<ArrowRightIcon aria-hidden /></Button>}>
      <div className="grid grid-cols-4 gap-4">
        <StatCard variant="compact" label="Linhas lidas" value="248" />
        <StatCard variant="compact" label="Prontas ou ajustadas" value="236" />
        <StatCard variant="compact" label="Precisam de você" value="9" />
        <StatCard variant="compact" label="Ignoradas" value="3" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <FilterCounters
              value={filtro}
              onValueChange={setFiltro}
              items={[
                { value: "todas", label: "Todas", count: 248 },
                { value: "erro", label: "Corrigir", count: 6, tone: "danger" },
                { value: "duplicada", label: "Duplicadas", count: 3, tone: "warning" },
                { value: "ignorada", label: "Ignoradas", count: 3, tone: "neutral" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Linha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-20">Bloco</TableHead>
                  <TableHead className="w-24">Número</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">O que fazer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LINHAS.map((r) => (
                  <TableRow key={r.l}>
                    <TableCell className="font-mono tabular-nums text-muted-foreground">{r.l}</TableCell>
                    <TableCell>
                      {r.campo === "Tipo" ? (
                        <NativeSelect aria-label={`Tipo da linha ${r.l}`} aria-invalid defaultValue="">
                          <NativeSelectOption value="">Cobertura?</NativeSelectOption>
                          <NativeSelectOption value="apto">Apartamento</NativeSelectOption>
                          <NativeSelectOption value="outro">Outro</NativeSelectOption>
                        </NativeSelect>
                      ) : (
                        r.tipo
                      )}
                    </TableCell>
                    <TableCell>{r.bloco}</TableCell>
                    <TableCell className="font-semibold">
                      {r.campo === "Número" ? <Input aria-label={`Número da linha ${r.l}`} aria-invalid placeholder="ex.: 103" className="w-24" /> : r.num}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <SitBadge s={r.sit} />
                      {r.msg && <span className={`mt-1 block text-xs ${r.sit === "erro" ? "text-danger" : "text-muted-foreground"}`}>{r.msg}</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.sit === "erro" && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" shape="pill">Corrigir</Button>
                          <Button size="sm" variant="ghost" shape="pill">Deixar de fora</Button>
                        </div>
                      )}
                      {r.sit === "duplicada" && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" shape="pill">Manter a atual</Button>
                          <Button size="sm" variant="ghost" shape="pill">Atualizar</Button>
                        </div>
                      )}
                      {r.sit === "ignorada" && <Button size="sm" variant="ghost" shape="pill">Incluir</Button>}
                      {(r.sit === "pronta" || r.sit === "ajustada") && (
                        <Button size="icon-sm" variant="ghost" shape="pill" aria-label={`Editar linha ${r.l}`}><PencilIcon aria-hidden /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Muitos erros?</CardTitle>
              <CardDescription>Baixe só as linhas com problema, com uma coluna &ldquo;O que corrigir&rdquo;. Arrume no Excel e envie de novo: as prontas não se perdem.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" shape="pill"><DownloadIcon aria-hidden />Baixar 9 linhas para corrigir</Button>
            </CardContent>
          </Card>
          <Alert>
            <CheckCircle2Icon aria-hidden />
            <AlertTitle>Linha com erro não trava as outras</AlertTitle>
            <AlertDescription>Duplicado nunca é juntado sozinho: você decide manter ou atualizar.</AlertDescription>
          </Alert>
        </div>
      </div>
    </Fluxo>
  )
}

/* ---------------- IMP-013 · PDF assistido ---------------- */

const PDF_LINHAS = [
  "CONDOMÍNIO RESIDENCIAL JARDINS",
  "Relação de moradores · Bloco A · out/2026",
  "",
  "Apto 101 .... João S. Pereira ...... (11) 9 8877-6655",
  "Apto 102 .... Marta e Luís Rocha ... (11) 9 9123-4400",
  "Apto 103 .... Família Okada ........ —",
  "Ap. 1O4 ..... Renata Viana ......... (11) 9 7001-2233",
  "Apto 105 .... VAGO",
]

const PDF_SUG: { l: string; un: string; nome: string; tel: string; conf: "alta" | "baixa"; nota?: string }[] = [
  { l: "pág. 1 · 4", un: "A-101", nome: "João S. Pereira", tel: "(11) 98877-6655", conf: "alta" },
  { l: "pág. 1 · 5", un: "A-102", nome: "Marta Rocha", tel: "(11) 99123-4400", conf: "baixa", nota: "Dois nomes na linha. Criamos duas pessoas?" },
  { l: "pág. 1 · 6", un: "A-103", nome: "Família Okada", tel: "—", conf: "baixa", nota: "Não é nome de pessoa. Informe o titular." },
  { l: "pág. 1 · 7", un: "A-104", nome: "Renata Viana", tel: "(11) 97001-2233", conf: "baixa", nota: "Lido “1O4” com letra O. Você quis dizer 104?" },
]

function PdfAssistido() {
  return (
    <Fluxo etapa={1} titulo="Importar moradores" sub="Residencial Jardins · relacao-moradores.pdf · 6 páginas" acoes={<Button shape="pill" size="lg">Revisar e confirmar<ArrowRightIcon aria-hidden /></Button>}>
      <div className="grid grid-cols-[420px_minmax(0,1fr)] items-start gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Arquivo original</CardTitle>
            <CardDescription>Página 1 de 6 · a linha selecionada fica marcada.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1 rounded-2xl border bg-background p-4 font-mono text-xs leading-relaxed">
              {PDF_LINHAS.map((t, i) => (
                <p key={i} className={`min-h-4 rounded px-1 ${i === 6 ? "bg-accent text-accent-foreground ring-1 ring-ring" : ""}`}>{t}</p>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Alert>
            <SparklesIcon aria-hidden />
            <AlertTitle>Leitura assistida: 63 sugestões em 6 páginas</AlertTitle>
            <AlertDescription>A IA sugere, você confirma. O PDF fica guardado só até o fim da importação e depois é apagado.</AlertDescription>
          </Alert>
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Sugestões</CardTitle>
              <CardDescription>Leitura alta pode ser aceita em bloco; leitura baixa pede você linha a linha.</CardDescription>
              <CardAction><Button variant="outline" shape="pill" size="sm"><CheckCircle2Icon aria-hidden />Aceitar 51 de leitura alta</Button></CardAction>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Origem</TableHead>
                    <TableHead className="w-20">Unidade</TableHead>
                    <TableHead>Morador</TableHead>
                    <TableHead>Leitura</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PDF_SUG.map((r) => (
                    <TableRow key={r.l} className={r.un === "A-104" ? "bg-accent/40" : undefined}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.l}</TableCell>
                      <TableCell className="font-semibold">{r.un}</TableCell>
                      <TableCell className="whitespace-normal">
                        <span className="block">{r.nome}</span>
                        <span className="block text-xs text-muted-foreground">{r.tel}</span>
                        {r.nota && <span className="block text-xs text-muted-foreground">{r.nota}</span>}
                      </TableCell>
                      <TableCell>{r.conf === "alta" ? <Badge variant="success">Alta</Badge> : <Badge variant="warning"><SparklesIcon aria-hidden />Confira</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" shape="pill">Confirmar</Button>
                          <Button size="icon-sm" variant="ghost" shape="pill" aria-label={`Editar ${r.un}`}><PencilIcon aria-hidden /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Fluxo>
  )
}

/* ---------------- IMP-014 · confirmar ---------------- */

function Confirmar() {
  return (
    <Fluxo etapa={2} titulo="Importar unidades" sub="Residencial Jardins · unidades-jardins.xlsx">
      <div className="grid grid-cols-[minmax(0,1fr)_420px] items-start gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle className="text-2xl">Confira antes de gravar</CardTitle>
            <CardDescription>Isto é o que vai acontecer no Residencial Jardins.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <SegmentedBar
              label="O que acontece com as 248 linhas"
              segments={[
                { label: "Criar", value: 233, color: 1 },
                { label: "Atualizar", value: 3, color: 2 },
                { label: "De fora", value: 12, color: 4 },
              ]}
              size="lg"
            />
            <DescriptionList>
              <DescriptionItem label="Unidades novas">233</DescriptionItem>
              <DescriptionItem label="Unidades atualizadas">3 (você escolheu atualizar)</DescriptionItem>
              <DescriptionItem label="Linhas de fora">12 · 3 ignoradas, 9 deixadas de fora</DescriptionItem>
              <DescriptionItem label="Mensagens enviadas">Nenhuma</DescriptionItem>
            </DescriptionList>
            <div className="flex items-start gap-3">
              <Checkbox id="imp-ok" defaultChecked />
              <Label htmlFor="imp-ok" className="leading-snug">Conferi a prévia. Os dados vieram da administradora e posso cadastrá-los.</Label>
            </div>
            <div className="flex gap-2">
              <Button shape="pill" size="lg"><CheckCircle2Icon aria-hidden />Importar 236 unidades</Button>
              <Button variant="ghost" shape="pill" size="lg">Voltar e corrigir</Button>
            </div>
          </CardContent>
        </Card>
        <Alert>
          <Undo2Icon aria-hidden />
          <AlertTitle>Dá para desfazer o lote</AlertTitle>
          <AlertDescription>Por 24 h, enquanto nenhuma encomenda usar esses cadastros. Depois disso, cada correção vira registro na auditoria.</AlertDescription>
        </Alert>
      </div>
    </Fluxo>
  )
}

/* ---------------- IMP-015 · resultado ---------------- */

function Concluir() {
  return (
    <Fluxo etapa={3} titulo="Importar unidades" sub="Residencial Jardins · unidades-jardins.xlsx">
      <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-6">
        <Card className={CARTAO}>
          <CardContent className="py-6">
            <Result
              status="success"
              title="236 unidades cadastradas"
              description="12 linhas ficaram de fora e estão no relatório. Próximo passo: trazer quem mora nelas."
              extra={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button shape="pill" size="lg"><UsersIcon aria-hidden />Importar moradores</Button>
                  <Button variant="outline" shape="pill" size="lg"><DownloadIcon aria-hidden />Baixar relatório</Button>
                  <Button variant="ghost" shape="pill" size="lg"><Undo2Icon aria-hidden />Desfazer lote</Button>
                </div>
              }
            />
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Resumo do lote</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList>
              <DescriptionItem label="Cadastro">Unidades</DescriptionItem>
              <DescriptionItem label="Arquivo">unidades-jardins.xlsx · Excel</DescriptionItem>
              <DescriptionItem label="Feito por">Ana Souza · gestora</DescriptionItem>
              <DescriptionItem label="Quando">04/11/2026 · 10:42</DescriptionItem>
              <DescriptionItem label="Desfazer até">05/11/2026 · 10:42</DescriptionItem>
              <DescriptionItem label="Registro">Lote #IMP-0042 na auditoria</DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>
      </div>
    </Fluxo>
  )
}

/* ---------------- página ---------------- */

export function Importar() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(PALETAS[0].vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 04/11/2026 · WebCode UI · paleta Névoa + Brasa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Importar cadastros por arquivo</h1>
          <p className="max-w-[70ch] text-muted-foreground">
            Unidades, moradores, lojistas, funcionários, autorizados e áreas comuns entram por Excel, CSV ou PDF. Todo cadastro tem o botão de importar e o
            arquivo de exemplo. Excel e CSV são leitura exata; PDF é leitura assistida. Sempre com prévia e confirmação. Nomes e números são exemplos.
          </p>
        </header>
        <Moldura id="IMP-010" titulo="Botão em todo cadastro" nota="Importar arquivo e baixar exemplo ao lado de Cadastrar; no vazio, viram o convite principal.">
          <Entrada />
        </Moldura>
        <Moldura id="IMP-011" titulo="Enviar arquivo" nota="Tipo de cadastro, arquivo e o exemplo daquele cadastro com colunas obrigatórias.">
          <Enviar />
        </Moldura>
        <Moldura id="IMP-012" titulo="Conferir e corrigir por linha" nota="Erro na linha certa, corrigido ali mesmo ou baixado para arrumar no Excel.">
          <Conferir />
        </Moldura>
        <Moldura id="IMP-013" titulo="PDF assistido" nota="Original ao lado das sugestões. Leitura baixa pede confirmação linha a linha.">
          <PdfAssistido />
        </Moldura>
        <Moldura id="IMP-014" titulo="Confirmar" nota="O que vai ser criado, atualizado e deixado de fora, antes de gravar.">
          <Confirmar />
        </Moldura>
        <Moldura id="IMP-015" titulo="Concluir" nota="Resultado, relatório, desfazer e o próximo cadastro da ordem.">
          <Concluir />
        </Moldura>
      </div>
    </div>
  )
}
