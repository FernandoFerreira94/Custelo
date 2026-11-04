"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  Building2Icon,
  CarIcon,
  CheckCircle2Icon,
  DoorOpenIcon,
  DumbbellIcon,
  HomeIcon,
  Layers3Icon,
  LinkIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PackageIcon,
  PhoneIcon,
  PlusIcon,
  ShieldCheckIcon,
  StoreIcon,
  UserIcon,
  UserMinusIcon,
  WarehouseIcon,
} from "lucide-react"

import { Busca, Moldura, PALETAS, Perfil, Trilho, vars } from "../pz-dash/painel"
import { Avatar, AvatarFallback } from "@/registry/webcode/ui/avatar"
import { Badge } from "@/registry/webcode/ui/badge"
import { Banner, BannerContent, BannerDescription } from "@/registry/webcode/ui/banner"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { DescriptionItem, DescriptionList } from "@/registry/webcode/ui/description-list"
import { Field, FieldDescription, FieldLabel } from "@/registry/webcode/ui/field"
import { Input } from "@/registry/webcode/ui/input"
import { InputDate } from "@/registry/webcode/ui/input-date"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/registry/webcode/ui/item"
import { NativeSelect, NativeSelectOption } from "@/registry/webcode/ui/native-select"
import { Switch } from "@/registry/webcode/ui/switch"
import { Label } from "@/registry/webcode/ui/label"
import { TreeView, type TreeNode } from "@/registry/webcode/ui/tree-view"
import { UsageMeter } from "@/registry/webcode/ui/usage-meter"

// Estrutura do condomínio e vínculos (03/11/2026): UNI-001, UNI-003, UNI-004 e PES-002.
// Paleta Névoa, só componentes da WebCode UI. Nomes e números são exemplos.

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

const CARTAO = "rounded-3xl"
const n = (t: string) => <Badge variant="outline">{t}</Badge>

/* ---------------- UNI-001 · Estrutura ---------------- */

const ARVORE: TreeNode[] = [
  {
    id: "vv",
    label: "Residencial Vila Verde",
    icon: <Building2Icon aria-hidden />,
    end: n("212 unidades"),
    children: [
      {
        id: "ba",
        label: "Bloco A",
        icon: <Layers3Icon aria-hidden />,
        end: n("72"),
        children: [
          { id: "ba-1", label: "1º andar", end: n("8") },
          { id: "ba-2", label: "2º andar", end: n("8") },
        ],
      },
      {
        id: "bb",
        label: "Bloco B",
        icon: <Layers3Icon aria-hidden />,
        end: n("72"),
        children: [
          { id: "bb-3", label: "3º andar", end: n("8"), children: [
            { id: "b-304", label: "B-304", icon: <HomeIcon aria-hidden />, end: <Badge variant="success"><CheckCircle2Icon aria-hidden />2 moradores</Badge> },
            { id: "b-305", label: "B-305", icon: <HomeIcon aria-hidden />, end: <Badge variant="warning"><AlertTriangleIcon aria-hidden />Sem contato</Badge> },
          ] },
        ],
      },
      { id: "bc", label: "Bloco C", icon: <Layers3Icon aria-hidden />, end: n("60") },
      { id: "lojas", label: "Lojas do térreo", icon: <StoreIcon aria-hidden />, end: n("8") },
      { id: "areas", label: "Áreas comuns", icon: <DoorOpenIcon aria-hidden />, end: n("4") },
    ],
  },
]

function Estrutura() {
  return (
    <Shell
      ativo="Unidades e pessoas"
      titulo="Estrutura"
      sub="Blocos, andares e unidades. É o primeiro filtro de toda encomenda."
      acoes={
        <>
          <Button variant="outline" shape="pill">Importar planilha</Button>
          <Button shape="pill"><PlusIcon aria-hidden />Novo bloco</Button>
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Vila Verde</CardTitle>
            <CardDescription>3 blocos, 8 lojas, 4 áreas comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <TreeView
              aria-label="Estrutura do condomínio"
              data={ARVORE}
              defaultExpanded={["vv", "bb", "bb-3"]}
              defaultSelected="b-304"
              guides
            />
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card className={CARTAO}>
            <CardHeader>
              <CardTitle className="font-mono text-2xl">B-304</CardTitle>
              <CardDescription>Bloco B · 3º andar</CardDescription>
              <CardAction><Button variant="outline" shape="pill" size="sm">Editar</Button></CardAction>
            </CardHeader>
            <CardContent className="grid gap-4">
              <DescriptionList layout="horizontal">
                <DescriptionItem label="Como aparece na etiqueta">B 304 · BL B AP 304 · 304B</DescriptionItem>
                <DescriptionItem label="Moradores">Mariana Souza, Pedro Souza</DescriptionItem>
                <DescriptionItem label="Em custódia">2 encomendas</DescriptionItem>
              </DescriptionList>
              <p className="text-xs text-muted-foreground">Os jeitos de escrever ajudam a leitura da etiqueta a achar a unidade certa.</p>
            </CardContent>
          </Card>
          <Banner variant="warning" className="rounded-2xl">
            <AlertTriangleIcon aria-hidden />
            <BannerContent>
              <BannerDescription>14 unidades sem ninguém com contato. Encomenda para elas não gera aviso.</BannerDescription>
            </BannerContent>
          </Banner>
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- UNI-003 + UNI-004 · Áreas e pontos ---------------- */

function AreasPontos() {
  return (
    <Shell ativo="Unidades e pessoas" titulo="Áreas e pontos de recebimento" sub="Onde a encomenda pode ser destinada e onde ela fica guardada.">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Áreas comuns</CardTitle>
            <CardDescription>UNI-003 · destino que não é apartamento.</CardDescription>
            <CardAction><Button variant="outline" shape="pill" size="sm"><PlusIcon aria-hidden />Área</Button></CardAction>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {[
                { t: "Administração", d: "Responsável: Marta Andrade", i: <Building2Icon aria-hidden /> },
                { t: "Academia", d: "Responsável: Sérgio Lopes", i: <DumbbellIcon aria-hidden /> },
                { t: "Zeladoria", d: "Responsável: Paulo Mendes", i: <WarehouseIcon aria-hidden /> },
                { t: "Garagem", d: "Sem responsável", i: <CarIcon aria-hidden />, alerta: true },
              ].map((a) => (
                <Item key={a.t} variant="outline">
                  <ItemMedia variant="icon">{a.i}</ItemMedia>
                  <ItemContent>
                    <ItemTitle>{a.t}</ItemTitle>
                    <ItemDescription>{a.d}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {a.alerta ? <Badge variant="warning"><AlertTriangleIcon aria-hidden />Sem aviso</Badge> : <Badge variant="success"><CheckCircle2Icon aria-hidden />Avisa</Badge>}
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Pontos de recebimento</CardTitle>
            <CardDescription>UNI-004 · cada portaria tem suas prateleiras.</CardDescription>
            <CardAction><Button variant="outline" shape="pill" size="sm"><PlusIcon aria-hidden />Ponto</Button></CardAction>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              { t: "Portaria principal", d: "24 h · Carlos, Rita", p: [["A1", 11, 24], ["B2", 9, 24], ["C2", 21, 24], ["Volume grande", 5, 8]] },
              { t: "Portaria da garagem", d: "07:00 às 19:00 · Joana", p: [["G1", 3, 12]] },
            ].map((pt) => (
              <Card key={pt.t} className="gap-3 rounded-2xl py-4">
                <CardHeader className="px-4">
                  <CardTitle className="flex items-center gap-2 text-base"><MapPinIcon aria-hidden className="size-4 text-brand" />{pt.t}</CardTitle>
                  <CardDescription>{pt.d}</CardDescription>
                  <CardAction>
                    <div className="flex items-center gap-2">
                      <Switch id={`ativo-${pt.t}`} defaultChecked aria-label={`${pt.t} ativo`} />
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-6 gap-y-3 px-4">
                  {pt.p.map(([nome, usado, total]) => (
                    <UsageMeter key={nome as string} label={`Prateleira ${nome}`} value={usado as number} max={total as number} />
                  ))}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

/* ---------------- PES-002 · Vínculos ---------------- */

function Vinculos() {
  return (
    <Shell ativo="Unidades e pessoas" titulo="Mariana Souza" sub="Vínculos com unidades. Quem pode receber aviso e retirar em nome de quem.">
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6">
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Vínculos</CardTitle>
            <CardDescription>PES-002 · uma pessoa pode estar em mais de uma unidade.</CardDescription>
            <CardAction><Button variant="outline" shape="pill" size="sm"><LinkIcon aria-hidden />Vincular unidade</Button></CardAction>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {[
                { u: "B-304", papel: "Titular", desde: "desde 03/2022", aviso: true, retira: "Pode retirar e autorizar" },
                { u: "Loja 3", papel: "Responsável", desde: "desde 08/2025", aviso: true, retira: "Pode retirar" },
                { u: "A-112", papel: "Ex-moradora", desde: "saiu em 01/2022", aviso: false, retira: "Sem acesso", fim: true },
              ].map((v) => (
                <Item key={v.u} variant="outline">
                  <ItemMedia variant="icon">{v.fim ? <UserMinusIcon aria-hidden /> : <HomeIcon aria-hidden />}</ItemMedia>
                  <ItemContent>
                    <ItemTitle><span className="font-mono">{v.u}</span> · {v.papel}</ItemTitle>
                    <ItemDescription>{v.desde} · {v.retira}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {v.aviso ? <Badge variant="success"><MessageCircleIcon aria-hidden />Recebe aviso</Badge> : <Badge variant="secondary"><UserMinusIcon aria-hidden />Encerrado</Badge>}
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
            <div className="mt-6 grid gap-2">
              <p className="text-sm font-semibold">Autorizados a retirar por Mariana</p>
              <ItemGroup className="gap-2">
                {[
                  ["Lúcia Ferreira", "Diarista · até 31/12/2026"],
                  ["Pedro Souza", "Filho · sem prazo"],
                ].map(([nome, d]) => (
                  <Item key={nome} variant="outline">
                    <ItemMedia><Avatar size="sm"><AvatarFallback>{nome.split(" ").map((x) => x[0]).join("")}</AvatarFallback></Avatar></ItemMedia>
                    <ItemContent>
                      <ItemTitle>{nome}</ItemTitle>
                      <ItemDescription>{d}</ItemDescription>
                    </ItemContent>
                    <ItemActions><Button variant="ghost" size="sm">Revogar</Button></ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            </div>
          </CardContent>
        </Card>
        <Card className={CARTAO}>
          <CardHeader>
            <CardTitle>Novo vínculo</CardTitle>
            <CardDescription>Encerrar vínculo não apaga o histórico.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
              <Field>
                <FieldLabel htmlFor="v-unidade">Unidade</FieldLabel>
                <Input id="v-unidade" defaultValue="C-210" />
              </Field>
              <Field>
                <FieldLabel htmlFor="v-papel">Papel</FieldLabel>
                <NativeSelect id="v-papel" defaultValue="morador">
                  <NativeSelectOption value="titular">Titular</NativeSelectOption>
                  <NativeSelectOption value="morador">Morador</NativeSelectOption>
                  <NativeSelectOption value="inquilino">Inquilino</NativeSelectOption>
                  <NativeSelectOption value="autorizado">Autorizado a retirar</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="v-inicio">Começa em</FieldLabel>
                <InputDate id="v-inicio" defaultValue="2026-11-03" />
              </Field>
              <div className="flex min-h-11 items-center justify-between gap-3">
                <Label htmlFor="v-aviso">Recebe aviso de encomenda</Label>
                <Switch id="v-aviso" defaultChecked />
              </div>
              <Banner variant="info" className="rounded-2xl">
                <ShieldCheckIcon aria-hidden />
                <BannerContent>
                  <BannerDescription>Aviso só vai para contato com consentimento registrado.</BannerDescription>
                </BannerContent>
              </Banner>
              <Button shape="pill" size="lg"><LinkIcon aria-hidden />Vincular</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

/* ---------------- página ---------------- */

export function Estruturas() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(PALETAS[0].vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Estrutura e vínculos</h1>
          <p className="max-w-[65ch] text-muted-foreground">Como o condomínio é montado no sistema e como cada pessoa se liga às unidades. Nomes e números são exemplos.</p>
        </header>
        <Moldura id="UNI-001" titulo="Estrutura do condomínio" nota="Árvore de blocos, andares e unidades, com o detalhe da unidade e alertas de contato.">
          <Estrutura />
        </Moldura>
        <Moldura id="UNI-003 + UNI-004" titulo="Áreas e pontos de recebimento" nota="Destinos que não são apartamento e as prateleiras de cada portaria.">
          <AreasPontos />
        </Moldura>
        <Moldura id="PES-002" titulo="Vínculos da pessoa" nota="Unidades, papel, quem recebe aviso e quem pode retirar em nome dela.">
          <Vinculos />
        </Moldura>
      </div>
    </div>
  )
}
