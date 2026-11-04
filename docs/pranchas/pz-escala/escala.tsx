"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FilterIcon,
  MailIcon,
  PencilIcon,
  RefreshCwIcon,
  SparklesIcon,
  XCircleIcon,
} from "lucide-react"

import { Busca, Moldura, PALETAS, Perfil, Trilho, vars } from "../pz-dash/painel"
import { Alert, AlertDescription, AlertTitle } from "@/registry/webcode/ui/alert"
import { Badge } from "@/registry/webcode/ui/badge"
import { BarChart } from "@/registry/webcode/ui/bar-chart"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Checkbox } from "@/registry/webcode/ui/checkbox"
import { DateRangePicker } from "@/registry/webcode/ui/date-picker"
import { DescriptionItem, DescriptionList } from "@/registry/webcode/ui/description-list"
import { Field, FieldDescription, FieldLabel } from "@/registry/webcode/ui/field"
import { FileUpload } from "@/registry/webcode/ui/file-upload"
import { FilterCounters } from "@/registry/webcode/ui/filter-counters"
import { HeatmapChart } from "@/registry/webcode/ui/heatmap-chart"
import { Input } from "@/registry/webcode/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { Label } from "@/registry/webcode/ui/label"
import { LineChart } from "@/registry/webcode/ui/line-chart"
import { NativeSelect, NativeSelectOption } from "@/registry/webcode/ui/native-select"
import { Progress } from "@/registry/webcode/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/registry/webcode/ui/radio-group"
import { Result } from "@/registry/webcode/ui/result"
import { SegmentedBar } from "@/registry/webcode/ui/segmented-bar"
import { StatCard } from "@/registry/webcode/ui/stat-card"
import { Stepper } from "@/registry/webcode/ui/stepper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/webcode/ui/table"

// Importação de moradores e relatórios do PacoteZap (03/11/2026). Paleta Névoa, só WebCode UI.
// Nomes, telefones e números são exemplos.

const CARTAO = "rounded-3xl"
const ETAPAS = [{ title: "Enviar planilha" }, { title: "Conferir" }, { title: "Corrigir" }, { title: "Concluir" }]

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

function Importacao({ etapa, children, acoes }: { etapa: number; children: React.ReactNode; acoes?: React.ReactNode }) {
  return (
    <Shell ativo="Unidades e pessoas" titulo="Importar moradores" sub="Residencial Jardins · planilha moradores-out.xlsx" acoes={acoes}>
      <Card className={CARTAO}>
        <CardContent>
          <Stepper steps={ETAPAS} current={etapa} />
        </CardContent>
      </Card>
      {children}
    </Shell>
  )
}

/* ---------------- IMP-001 ---------------- */

function Upload() {
  return (
    <Importacao etapa={0}>
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Envie a planilha da administradora</CardTitle>
            <CardDescription>CSV ou Excel, até 5 MB. Nada entra no sistema antes de você conferir.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FileUpload accept=".csv,.xlsx,.xls" maxSize={5 * 1024 * 1024} maxFiles={1} hint="Arraste aqui ou escolha o arquivo · CSV, XLSX · até 5 MB" />
            <Field>
              <FieldLabel htmlFor="imp-destino">Para onde vão os moradores</FieldLabel>
              <NativeSelect id="imp-destino" defaultValue="jardins">
                <NativeSelectOption value="jardins">Residencial Jardins · 3 torres, 240 unidades</NativeSelectOption>
                <NativeSelectOption value="aurora">Edifício Aurora · 64 unidades</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Item variant="outline">
              <ItemMedia variant="icon"><SparklesIcon aria-hidden /></ItemMedia>
              <ItemContent>
                <ItemTitle>Lemos qualquer formato</ItemTitle>
                <ItemDescription>&ldquo;Bl. A apto 112&rdquo;, &ldquo;A-112&rdquo; ou &ldquo;Torre A / 112&rdquo; viram a mesma unidade. A sugestão aparece para você confirmar.</ItemDescription>
              </ItemContent>
            </Item>
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Modelo de planilha</CardTitle>
              <CardDescription>Se preferir começar do zero.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <ul className="grid gap-1.5 text-sm">
                {["Bloco ou torre", "Unidade", "Nome do morador", "Telefone (WhatsApp)", "E-mail (opcional)", "Tipo: titular, dependente, inquilino"].map((c) => (
                  <li key={c} className="flex items-center gap-2"><CheckCircle2Icon aria-hidden className="size-4 text-success" />{c}</li>
                ))}
              </ul>
              <Button variant="outline" shape="pill"><DownloadIcon aria-hidden />Baixar modelo</Button>
            </CardContent>
          </Card>
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Importações anteriores</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                <Item variant="outline" size="sm">
                  <ItemMedia variant="icon"><FileSpreadsheetIcon aria-hidden /></ItemMedia>
                  <ItemContent>
                    <ItemTitle>moradores-torre-b.csv</ItemTitle>
                    <ItemDescription>12/10 · 118 importados · 2 ignorados</ItemDescription>
                  </ItemContent>
                  <ItemActions><Badge variant="success"><CheckCircle2Icon aria-hidden />Concluída</Badge></ItemActions>
                </Item>
                <Item variant="outline" size="sm">
                  <ItemMedia variant="icon"><FileSpreadsheetIcon aria-hidden /></ItemMedia>
                  <ItemContent>
                    <ItemTitle>inquilinos-set.xlsx</ItemTitle>
                    <ItemDescription>28/09 · parou na conferência</ItemDescription>
                  </ItemContent>
                  <ItemActions><Button size="sm" variant="ghost" shape="pill">Retomar</Button></ItemActions>
                </Item>
              </ItemGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </Importacao>
  )
}

/* ---------------- IMP-002 ---------------- */

const COLUNAS = [
  { arquivo: "BLOCO", exemplo: "A", campo: "bloco" },
  { arquivo: "APTO", exemplo: "112", campo: "unidade" },
  { arquivo: "PROPRIETARIO", exemplo: "Helena Prado", campo: "nome" },
  { arquivo: "CEL", exemplo: "11987654321", campo: "telefone" },
  { arquivo: "OBS", exemplo: "inquilino até 03/27", campo: "ignorar" },
]

const PREVIA = [
  { linha: 2, unidade: "A-112", nome: "Helena Prado", tel: "+55 11 98765-4321", situacao: "pronta" as const },
  { linha: 3, unidade: "A-114", nome: "Rafael Moura", tel: "+55 11 99812-0044", situacao: "normalizada" as const, nota: "Telefone sem DDD; usamos 11 do condomínio" },
  { linha: 4, unidade: "B-201", nome: "Carla Nunes", tel: "+55 11 97001-3321", situacao: "sugestao" as const, nota: "Na planilha: “Bl B ap 21”. Você quis dizer B-201?" },
  { linha: 5, unidade: "B-203", nome: "Diego Alves", tel: "+55 11 96630-1287", situacao: "pronta" as const },
  { linha: 6, unidade: "C-010", nome: "Joana Reis", tel: "—", situacao: "aviso" as const, nota: "Sem telefone: recebe aviso só pelo porteiro" },
]

function Situacao({ s }: { s: (typeof PREVIA)[number]["situacao"] }) {
  if (s === "pronta") return <Badge variant="success"><CheckCircle2Icon aria-hidden />Pronta</Badge>
  if (s === "normalizada") return <Badge variant="soft"><RefreshCwIcon aria-hidden />Ajustada</Badge>
  if (s === "sugestao") return <Badge variant="soft"><SparklesIcon aria-hidden />Sugestão</Badge>
  return <Badge variant="warning"><AlertTriangleIcon aria-hidden />Atenção</Badge>
}

function Previa() {
  return (
    <Importacao etapa={1} acoes={<Button shape="pill" size="lg">Ir para correções<ArrowRightIcon aria-hidden /></Button>}>
      <div className="grid grid-cols-4 gap-4">
        <StatCard variant="compact" label="Linhas lidas" value="412" />
        <StatCard variant="compact" label="Prontas" value="371" />
        <StatCard variant="compact" label="Ajustadas ou sugeridas" value="27" />
        <StatCard variant="compact" label="Precisam de você" value="14" />
      </div>
      <div className="grid grid-cols-[360px_minmax(0,1fr)] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Colunas do arquivo</CardTitle>
            <CardDescription>Reconhecemos sozinhos; troque se estiver errado.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {COLUNAS.map((c) => (
              <div key={c.arquivo} className="grid grid-cols-[minmax(0,1fr)_150px] items-center gap-3">
                <div className="min-w-0">
                  <Label htmlFor={`col-${c.arquivo}`} className="font-mono">{c.arquivo}</Label>
                  <p className="truncate text-xs text-muted-foreground">ex.: {c.exemplo}</p>
                </div>
                <NativeSelect id={`col-${c.arquivo}`} defaultValue={c.campo}>
                  <NativeSelectOption value="bloco">Bloco</NativeSelectOption>
                  <NativeSelectOption value="unidade">Unidade</NativeSelectOption>
                  <NativeSelectOption value="nome">Nome</NativeSelectOption>
                  <NativeSelectOption value="telefone">Telefone</NativeSelectOption>
                  <NativeSelectOption value="email">E-mail</NativeSelectOption>
                  <NativeSelectOption value="ignorar">Não importar</NativeSelectOption>
                </NativeSelect>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Prévia</CardTitle>
            <CardDescription>Sugestões da leitura automática só entram depois do seu ok.</CardDescription>
            <CardAction><Button variant="outline" shape="pill" size="sm"><CheckCircle2Icon aria-hidden />Aceitar 19 sugestões</Button></CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Linha</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Morador</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PREVIA.map((r) => (
                  <TableRow key={r.linha}>
                    <TableCell className="font-mono tabular-nums text-muted-foreground">{r.linha}</TableCell>
                    <TableCell className="font-semibold">{r.unidade}</TableCell>
                    <TableCell className="whitespace-normal">
                      <span className="block">{r.nome}</span>
                      <span className="block text-xs text-muted-foreground">{r.tel}</span>
                      {r.nota && <span className="block text-xs text-muted-foreground">{r.nota}</span>}
                    </TableCell>
                    <TableCell><Situacao s={r.situacao} /></TableCell>
                    <TableCell className="text-right">
                      {r.situacao === "sugestao" ? (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" shape="pill">Confirmar</Button>
                          <Button size="sm" variant="ghost" shape="pill">Trocar</Button>
                        </div>
                      ) : (
                        <Button size="icon-sm" variant="ghost" shape="pill" aria-label={`Editar linha ${r.linha}`}><PencilIcon aria-hidden /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Importacao>
  )
}

/* ---------------- IMP-003 ---------------- */

function Inconsistencias() {
  const [filtro, setFiltro] = React.useState<string | null>("erro")
  return (
    <Importacao etapa={2} acoes={<Button shape="pill" size="lg">Importar 398 moradores<ArrowRightIcon aria-hidden /></Button>}>
      <FilterCounters
        value={filtro}
        onValueChange={setFiltro}
        items={[
          { value: "erro", label: "Erros", count: 5, tone: "danger" },
          { value: "duplicado", label: "Duplicados", count: 3, tone: "warning" },
          { value: "aviso", label: "Avisos", count: 6, tone: "info" },
        ]}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Erros por linha</CardTitle>
            <CardDescription>Corrija aqui mesmo ou deixe a linha de fora. Linha com erro não trava as outras.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { l: 41, problema: "Unidade D-905 não existe no Residencial Jardins", campo: "Unidade", valor: "D-905" },
              { l: 87, problema: "Telefone com 8 dígitos", campo: "Telefone", valor: "9876-5432" },
              { l: 133, problema: "Nome vazio", campo: "Nome", valor: "" },
            ].map((e) => (
              <Item key={e.l} variant="outline" className="items-start">
                <ItemMedia variant="icon" className="text-danger"><XCircleIcon aria-hidden /></ItemMedia>
                <ItemContent className="grid gap-2">
                  <ItemTitle>Linha {e.l} · {e.problema}</ItemTitle>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-2">
                    <Field>
                      <FieldLabel htmlFor={`fix-${e.l}`}>{e.campo}</FieldLabel>
                      <Input id={`fix-${e.l}`} defaultValue={e.valor} aria-invalid />
                    </Field>
                    <Button shape="pill">Corrigir</Button>
                    <Button variant="ghost" shape="pill">Deixar de fora</Button>
                  </div>
                </ItemContent>
              </Item>
            ))}
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle>Possível duplicado</CardTitle>
              <CardDescription>Mesma unidade, nome parecido.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border bg-card p-3 text-sm">
                  <p className="text-xs text-muted-foreground">Já cadastrado</p>
                  <p className="font-semibold">Marcos Lima</p>
                  <p className="text-muted-foreground">B-108 · (11) 9•••-•210</p>
                </div>
                <div className="rounded-2xl border bg-card p-3 text-sm">
                  <p className="text-xs text-muted-foreground">Na planilha · linha 58</p>
                  <p className="font-semibold">Marcos A. Lima</p>
                  <p className="text-muted-foreground">B-108 · (11) 9•••-•210</p>
                </div>
              </div>
              <RadioGroup defaultValue="manter" className="gap-2">
                {[
                  { v: "manter", t: "É a mesma pessoa · manter o cadastro" },
                  { v: "atualizar", t: "É a mesma pessoa · atualizar o nome" },
                  { v: "novo", t: "São pessoas diferentes · criar novo" },
                ].map((o) => (
                  <div key={o.v} className="flex items-center gap-2">
                    <RadioGroupItem value={o.v} id={`dup-${o.v}`} />
                    <Label htmlFor={`dup-${o.v}`}>{o.t}</Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">Nunca juntamos cadastros sozinhos.</p>
            </CardContent>
          </Card>
          <Alert>
            <AlertTriangleIcon aria-hidden />
            <AlertTitle>Ninguém recebe mensagem agora</AlertTitle>
            <AlertDescription>Importar não envia convite. Você escolhe depois quem convidar.</AlertDescription>
          </Alert>
        </div>
      </div>
    </Importacao>
  )
}

/* ---------------- IMP-004 ---------------- */

function RelatorioLote() {
  return (
    <Importacao etapa={3}>
      <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-6">
        <Card className={CARTAO}>
          <CardContent className="grid gap-6 py-4">
            <Result
              status="success"
              title="398 moradores importados"
              description="Residencial Jardins · 12 linhas ficaram de fora e estão no relatório."
              extra={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button shape="pill" size="lg"><MailIcon aria-hidden />Convidar moradores</Button>
                  <Button variant="outline" shape="pill" size="lg"><DownloadIcon aria-hidden />Baixar relatório</Button>
                </div>
              }
            />
            <SegmentedBar
              label="Resultado da importação"
              segments={[
                { label: "Novos", value: 362, color: 1 },
                { label: "Atualizados", value: 36, color: 2 },
                { label: "De fora", value: 12, color: 4 },
              ]}
              size="lg"
            />
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Resumo do lote</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList>
              <DescriptionItem label="Arquivo">moradores-out.xlsx</DescriptionItem>
              <DescriptionItem label="Feito por">Ana Souza · gestora</DescriptionItem>
              <DescriptionItem label="Quando">03/11/2026 · 14:12</DescriptionItem>
              <DescriptionItem label="Unidades com morador">231 de 240</DescriptionItem>
              <DescriptionItem label="Sem telefone">6 (aviso só pela portaria)</DescriptionItem>
              <DescriptionItem label="Sugestões aceitas">19 de 21</DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>
      </div>
    </Importacao>
  )
}

/* ---------------- relatórios ---------------- */

function Filtros() {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field className="w-72">
        <FieldLabel>Período</FieldLabel>
        <DateRangePicker defaultValue={{ from: "2026-10-04", to: "2026-11-02" }} presets />
      </Field>
      <Field className="w-60">
        <FieldLabel htmlFor="rel-local">Local</FieldLabel>
        <NativeSelect id="rel-local" defaultValue="todos">
          <NativeSelectOption value="todos">Todos os empreendimentos</NativeSelectOption>
          <NativeSelectOption value="jardins">Residencial Jardins</NativeSelectOption>
          <NativeSelectOption value="aurora">Edifício Aurora</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Button variant="outline" shape="pill"><FilterIcon aria-hidden />Mais filtros</Button>
    </div>
  )
}

function Relatorios({ aba, children }: { aba: string; children: React.ReactNode }) {
  const abas = ["Operação", "Avisos", "Retiradas", "Exceções", "Exportar"]
  return (
    <Shell ativo="Relatórios" titulo="Relatórios" sub="Números do período. Nenhum relatório mostra telefone ou foto de etiqueta." acoes={<Button variant="outline" shape="pill"><DownloadIcon aria-hidden />Exportar</Button>}>
      <nav aria-label="Relatórios" className="flex gap-1 rounded-full border bg-card p-1 w-fit">
        {abas.map((a) => (
          <Button key={a} size="sm" shape="pill" variant={a === aba ? "default" : "ghost"} aria-current={a === aba ? "page" : undefined}>{a}</Button>
        ))}
      </nav>
      <Filtros />
      {children}
    </Shell>
  )
}

const DIAS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 9, 4 + i)
  const base = d.getDay() === 0 ? 40 : d.getDay() === 6 ? 70 : 120
  const rec = base + ((i * 37) % 31)
  return { dia: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, recebidas: rec, retiradas: rec - 6 + ((i * 13) % 11) }
})

const PICO = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d, i) => ({
  dia: d,
  h8: [12, 14, 11, 13, 15, 6, 1][i],
  h10: [28, 31, 26, 30, 34, 14, 3][i],
  h12: [22, 20, 24, 21, 25, 18, 4][i],
  h14: [35, 38, 33, 36, 40, 12, 2][i],
  h16: [30, 29, 31, 28, 33, 9, 2][i],
  h18: [18, 17, 19, 16, 14, 5, 1][i],
}))

function RelOperacao() {
  return (
    <Relatorios aba="Operação">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Recebidas" value="3.214" delta={8.2} period="vs. 30 dias antes" trend={DIAS.map((d) => d.recebidas)} />
        <StatCard label="Retiradas" value="3.087" delta={6.9} period="vs. 30 dias antes" trend={DIAS.map((d) => d.retiradas)} />
        <StatCard label="Tempo até retirar" value="1,4 dia" delta={-12} goodWhen="down" period="mediana" />
        <StatCard label="Paradas há +7 dias" value="27" delta={4} goodWhen="down" period="agora" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_440px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Recebidas e retiradas por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={DIAS} index="dia" series={[{ key: "recebidas", label: "Recebidas" }, { key: "retiradas", label: "Retiradas" }]} curve="smooth" height={260} />
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Horário de pico na portaria</CardTitle>
            <CardDescription>Encomendas recebidas por faixa de horário.</CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapChart
              data={PICO}
              index="dia"
              columns={[{ key: "h8", label: "8h" }, { key: "h10", label: "10h" }, { key: "h12", label: "12h" }, { key: "h14", label: "14h" }, { key: "h16", label: "16h" }, { key: "h18", label: "18h" }]}
              cellHeight={30}
            />
          </CardContent>
        </Card>
      </div>
    </Relatorios>
  )
}

const ENVIOS = DIAS.slice(-14).map((d, i) => ({ dia: d.dia, entregues: d.recebidas - (i % 4), falhas: [2, 0, 1, 5, 1, 0, 0, 3, 1, 9, 2, 1, 0, 1][i] }))

function RelAvisos() {
  return (
    <Relatorios aba="Avisos">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Avisos enviados" value="3.198" period="no período" />
        <StatCard label="Entregues" value="98,7%" delta={0.4} period="vs. 30 dias antes" />
        <StatCard label="Lidos" value="91,2%" delta={2.1} period="vs. 30 dias antes" />
        <StatCard label="Falharam" value="42" delta={-18} goodWhen="down" period="todos tratados" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_440px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Entregues e falhas por dia</CardTitle>
            <CardDescription>O pico de 29/10 foi a queda do WhatsApp das 13:40 às 15:10.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={ENVIOS} index="dia" type="stacked" series={[{ key: "entregues", label: "Entregues" }, { key: "falhas", label: "Falhas", color: 4 }]} height={260} maxBarSize={28} />
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Por que falharam</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SegmentedBar
              label="Falhas por motivo"
              segments={[
                { label: "WhatsApp fora do ar", value: 19, color: 4 },
                { label: "Número sem WhatsApp", value: 14, color: 3 },
                { label: "Fora da janela", value: 9, color: 2 },
              ]}
              legend="below"
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Saída</TableHead>
                  <TableHead className="text-right">Qtd.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>Reenviado e entregue</TableCell><TableCell className="text-right tabular-nums">28</TableCell></TableRow>
                <TableRow><TableCell>Porteiro avisou pessoalmente</TableCell><TableCell className="text-right tabular-nums">11</TableCell></TableRow>
                <TableRow><TableCell>Telefone corrigido</TableCell><TableCell className="text-right tabular-nums">3</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Relatorios>
  )
}

const FAIXAS = [
  { faixa: "No dia", n: 1420 },
  { faixa: "1 a 2 dias", n: 1105 },
  { faixa: "3 a 7 dias", n: 471 },
  { faixa: "Mais de 7", n: 91 },
]

function RelRetiradasExcecoes() {
  return (
    <Relatorios aba="Retiradas">
      <div className="grid grid-cols-2 gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>REL-003 · Tempo até a retirada</CardTitle>
            <CardDescription>3.087 retiradas no período.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <BarChart data={FAIXAS} index="faixa" series={[{ key: "n", label: "Retiradas" }]} highlight="Mais de 7" height={200} maxBarSize={56} tableToggle={false} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quem retirou</TableHead>
                  <TableHead className="text-right">Retiradas</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>Próprio destinatário</TableCell><TableCell className="text-right tabular-nums">2.311</TableCell><TableCell className="text-right tabular-nums">75%</TableCell></TableRow>
                <TableRow><TableCell>Morador da mesma unidade</TableCell><TableCell className="text-right tabular-nums">602</TableCell><TableCell className="text-right tabular-nums">19%</TableCell></TableRow>
                <TableRow><TableCell>Autorizado</TableCell><TableCell className="text-right tabular-nums">174</TableCell><TableCell className="text-right tabular-nums">6%</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>REL-004 · Exceções</CardTitle>
            <CardDescription>Tudo que fugiu do caminho normal, com motivo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard variant="compact" label="Sem destinatário" value="18" />
              <StatCard variant="compact" label="Correções" value="23" />
              <StatCard variant="compact" label="Devolvidas" value="7" />
            </div>
            <ItemGroup className="gap-2">
              {[
                { t: "Unidade trocada após aviso", d: "A-112 → A-121 · Carlos (porteiro) · “etiqueta com número invertido”", b: <Badge variant="warning"><AlertTriangleIcon aria-hidden />Correção</Badge> },
                { t: "Sem destinatário há 5 dias", d: "Recebida 29/10 · nome não bate com nenhum morador", b: <Badge variant="danger"><XCircleIcon aria-hidden />Pendente</Badge> },
                { t: "Devolvida ao remetente", d: "B-305 · morador mudou · Ana (gestora)", b: <Badge variant="soft"><RefreshCwIcon aria-hidden />Devolução</Badge> },
              ].map((x) => (
                <Item key={x.t} variant="outline" size="sm">
                  <ItemContent>
                    <ItemTitle>{x.t}</ItemTitle>
                    <ItemDescription>{x.d}</ItemDescription>
                  </ItemContent>
                  <ItemActions>{x.b}</ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </Relatorios>
  )
}

function RelExportar() {
  return (
    <Relatorios aba="Exportar">
      <div className="grid grid-cols-[minmax(0,1fr)_480px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Gerar arquivo do período</CardTitle>
            <CardDescription>Arquivo grande é preparado em segundo plano. Avisamos quando ficar pronto.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium">O que entra</legend>
              {["Encomendas e estados", "Retiradas e quem retirou", "Avisos enviados e falhas", "Correções e exceções", "Auditoria de acessos"].map((o, i) => (
                <div key={o} className="flex items-center gap-2">
                  <Checkbox id={`exp-${i}`} defaultChecked={i < 3} />
                  <Label htmlFor={`exp-${i}`}>{o}</Label>
                </div>
              ))}
            </fieldset>
            <Field>
              <FieldLabel>Formato</FieldLabel>
              <RadioGroup defaultValue="csv" className="flex gap-4">
                {[{ v: "csv", t: "CSV (planilha)" }, { v: "pdf", t: "PDF (para imprimir)" }].map((o) => (
                  <div key={o.v} className="flex items-center gap-2">
                    <RadioGroupItem value={o.v} id={`fmt-${o.v}`} />
                    <Label htmlFor={`fmt-${o.v}`}>{o.t}</Label>
                  </div>
                ))}
              </RadioGroup>
              <FieldDescription>Telefone sai mascarado. Fotos de etiqueta não entram.</FieldDescription>
            </Field>
            <div className="flex gap-2">
              <Button shape="pill" size="lg"><FileTextIcon aria-hidden />Gerar arquivo</Button>
            </div>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Arquivos</CardTitle>
            <CardDescription>Ficam disponíveis por 7 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              <Item variant="outline">
                <ItemMedia variant="icon"><ClockIcon aria-hidden /></ItemMedia>
                <ItemContent className="grid gap-2">
                  <ItemTitle>Outubro completo · CSV</ItemTitle>
                  <Progress value={62} aria-label="Gerando, 62%" />
                  <ItemDescription>Gerando · 62%</ItemDescription>
                </ItemContent>
              </Item>
              <Item variant="outline">
                <ItemMedia variant="icon"><CheckCircle2Icon aria-hidden className="text-success" /></ItemMedia>
                <ItemContent>
                  <ItemTitle>Setembro · PDF</ItemTitle>
                  <ItemDescription>Pronto · vence em 5 dias · gerado por Ana</ItemDescription>
                </ItemContent>
                <ItemActions><Button size="sm" variant="outline" shape="pill"><DownloadIcon aria-hidden />Baixar</Button></ItemActions>
              </Item>
              <Item variant="outline">
                <ItemMedia variant="icon"><XCircleIcon aria-hidden className="text-danger" /></ItemMedia>
                <ItemContent>
                  <ItemTitle>Auditoria 2026 · CSV</ItemTitle>
                  <ItemDescription>Não deu certo · tente de novo</ItemDescription>
                </ItemContent>
                <ItemActions><Button size="sm" variant="ghost" shape="pill"><RefreshCwIcon aria-hidden />Tentar</Button></ItemActions>
              </Item>
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </Relatorios>
  )
}

/* ---------------- página ---------------- */

export function Escala() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(PALETAS[0].vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Importação e relatórios</h1>
          <p className="max-w-[65ch] text-muted-foreground">Trazer os moradores de uma planilha sem suporte e ver os números do período. Nomes e números são exemplos.</p>
        </header>
        <Moldura id="IMP-001" titulo="Enviar planilha" nota="Arquivo, destino e modelo. Nada entra antes de conferir.">
          <Upload />
        </Moldura>
        <Moldura id="IMP-002" titulo="Conferir" nota="Colunas reconhecidas, prévia e sugestões que esperam o seu ok.">
          <Previa />
        </Moldura>
        <Moldura id="IMP-003" titulo="Corrigir" nota="Erro por linha com correção ali mesmo; duplicado decidido por pessoa.">
          <Inconsistencias />
        </Moldura>
        <Moldura id="IMP-004" titulo="Resultado do lote" nota="Quantos entraram, o que ficou de fora e o próximo passo.">
          <RelatorioLote />
        </Moldura>
        <Moldura id="REL-001" titulo="Operação" nota="Volume por dia e horário de pico.">
          <RelOperacao />
        </Moldura>
        <Moldura id="REL-002" titulo="Avisos" nota="Entrega, leitura e falhas com a saída de cada uma.">
          <RelAvisos />
        </Moldura>
        <Moldura id="REL-003 + REL-004" titulo="Retiradas e exceções" nota="Tempo até retirar, quem retirou e o que fugiu do normal.">
          <RelRetiradasExcecoes />
        </Moldura>
        <Moldura id="REL-005" titulo="Exportar período" nota="Arquivo gerado em segundo plano, nunca download na hora.">
          <RelExportar />
        </Moldura>
      </div>
    </div>
  )
}
