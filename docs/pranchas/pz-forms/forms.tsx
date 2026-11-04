"use client"

import * as React from "react"
import { Building2Icon, PlusIcon, SaveIcon, SendIcon, ShieldCheckIcon, Trash2Icon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { PALETAS, vars } from "../pz-dash/painel"
import { Banner, BannerContent, BannerDescription } from "@/registry/webcode/ui/banner"
import { Button } from "@/registry/webcode/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/webcode/ui/card"
import { Checkbox } from "@/registry/webcode/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/webcode/ui/field"
import { Input } from "@/registry/webcode/ui/input"
import { InputCep } from "@/registry/webcode/ui/input-cep"
import { InputDate } from "@/registry/webcode/ui/input-date"
import { InputDocument } from "@/registry/webcode/ui/input-document"
import { InputPhone } from "@/registry/webcode/ui/input-phone"
import { Label } from "@/registry/webcode/ui/label"
import { NativeSelect, NativeSelectOption } from "@/registry/webcode/ui/native-select"
import {
  RadioGroup,
  RadioGroupCard,
  RadioGroupCardContent,
  RadioGroupCardDescription,
  RadioGroupCardTitle,
} from "@/registry/webcode/ui/radio-group"
import { StepForm, StepFormReviewItem, StepFormReviewList, StepFormStep } from "@/registry/webcode/ui/step-form"
import { Switch } from "@/registry/webcode/ui/switch"
import { TagsInput } from "@/registry/webcode/ui/tags-input"
import { Textarea } from "@/registry/webcode/ui/textarea"

// Formulários de cadastro do PacoteZap (03/11/2026). Paleta Névoa, só componentes da WebCode UI.
// Nomes, documentos e telefones são exemplos.

const salvar = (o: string) => (e: React.FormEvent) => {
  e.preventDefault()
  toast.success(`${o} salvo`, { description: "Exemplo da prancha: nada foi gravado." })
}

function Form({ id, titulo, nota, children, acao, onSubmit }: { id: string; titulo: string; nota: string; children: React.ReactNode; acao: React.ReactNode; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <p className="font-mono text-xs text-muted-foreground">{id}</p>
        <CardTitle className="text-xl">{titulo}</CardTitle>
        <CardDescription>{nota}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={onSubmit} noValidate>
          {children}
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" shape="pill">Cancelar</Button>
            {acao}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const dois = "grid gap-4 sm:grid-cols-2"

/* ---------------- Condomínio (wizard) ---------------- */

function Condominio() {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <p className="font-mono text-xs text-muted-foreground">CFG-001 · onboarding</p>
        <CardTitle className="text-xl">Cadastrar condomínio</CardTitle>
        <CardDescription>Em 4 passos. Os blocos e unidades saem prontos no fim.</CardDescription>
      </CardHeader>
      <CardContent>
        <StepForm submitLabel="Criar condomínio" onSubmit={() => { toast.success("Condomínio criado", { description: "212 unidades geradas. Exemplo da prancha." }) }}>
          <StepFormStep title="Dados do condomínio">
            <div className="grid gap-4">
              <Field>
                <FieldLabel htmlFor="c-nome">Nome</FieldLabel>
                <Input id="c-nome" name="nome" required defaultValue="Residencial Vila Verde" />
              </Field>
              <Field>
                <FieldLabel htmlFor="c-cnpj">CNPJ do condomínio</FieldLabel>
                <InputDocument id="c-cnpj" name="cnpj" accept="cnpj" defaultValue="12345678000190" />
              </Field>
              <RadioGroup name="tipo" defaultValue="residencial" aria-label="Tipo" className="grid gap-2 sm:grid-cols-3">
                {[
                  ["residencial", "Residencial", "Apartamentos e casas"],
                  ["comercial", "Comercial", "Salas e lojas"],
                  ["misto", "Misto", "Os dois"],
                ].map(([v, t, d]) => (
                  <RadioGroupCard key={v} value={v}>
                    <RadioGroupCardContent>
                      <RadioGroupCardTitle>{t}</RadioGroupCardTitle>
                      <RadioGroupCardDescription>{d}</RadioGroupCardDescription>
                    </RadioGroupCardContent>
                  </RadioGroupCard>
                ))}
              </RadioGroup>
            </div>
          </StepFormStep>
          <StepFormStep title="Endereço">
            <div className="grid gap-4">
              <Field>
                <FieldLabel htmlFor="c-cep">CEP</FieldLabel>
                <InputCep id="c-cep" name="cep" defaultValue="04538133" />
                <FieldDescription>Preenche rua, bairro e cidade.</FieldDescription>
              </Field>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <Field>
                  <FieldLabel htmlFor="c-rua">Rua</FieldLabel>
                  <Input id="c-rua" name="rua" defaultValue="Av. Brigadeiro Faria Lima" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="c-num">Número</FieldLabel>
                  <Input id="c-num" name="numero" inputMode="numeric" defaultValue="3477" />
                </Field>
              </div>
            </div>
          </StepFormStep>
          <StepFormStep title="Blocos e unidades">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="c-blocos">Blocos</FieldLabel>
                  <Input id="c-blocos" name="blocos" inputMode="numeric" defaultValue="3" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="c-andares">Andares</FieldLabel>
                  <Input id="c-andares" name="andares" inputMode="numeric" defaultValue="9" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="c-por">Por andar</FieldLabel>
                  <Input id="c-por" name="porAndar" inputMode="numeric" defaultValue="8" />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="c-pad">Como numera</FieldLabel>
                <NativeSelect id="c-pad" name="padrao" defaultValue="andar">
                  <NativeSelectOption value="andar">Andar + final (304, 305…)</NativeSelectOption>
                  <NativeSelectOption value="seq">Sequencial (1, 2, 3…)</NativeSelectOption>
                </NativeSelect>
                <FieldDescription>Prévia: A-101 … A-908, B-101 … C-908. Dá para ajustar depois.</FieldDescription>
              </Field>
            </div>
          </StepFormStep>
          <StepFormStep title="Revisão">
            {({ values, edit }) => (
              <StepFormReviewList>
                <StepFormReviewItem label="Nome" value={values.nome} onEdit={() => edit(0)} />
                <StepFormReviewItem label="CEP" value={values.cep} onEdit={() => edit(1)} />
                <StepFormReviewItem label="Unidades" value={`${values.blocos} blocos · ${values.andares} andares · ${values.porAndar} por andar`} onEdit={() => edit(2)} />
              </StepFormReviewList>
            )}
          </StepFormStep>
        </StepForm>
      </CardContent>
    </Card>
  )
}

/* ---------------- Unidade ---------------- */

function Unidade() {
  return (
    <Form id="UNI-002" titulo="Nova unidade" nota="Para unidade avulsa. Em lote, use o cadastro do condomínio ou a planilha." onSubmit={salvar("Unidade")} acao={<Button shape="pill"><SaveIcon aria-hidden />Salvar unidade</Button>}>
      <div className={dois}>
        <Field>
          <FieldLabel htmlFor="u-bloco">Bloco</FieldLabel>
          <NativeSelect id="u-bloco" defaultValue="b">
            <NativeSelectOption value="a">Bloco A</NativeSelectOption>
            <NativeSelectOption value="b">Bloco B</NativeSelectOption>
            <NativeSelectOption value="c">Bloco C</NativeSelectOption>
            <NativeSelectOption value="sem">Sem bloco</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="u-num">Número</FieldLabel>
          <Input id="u-num" defaultValue="304" />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="u-tipo">Tipo</FieldLabel>
        <NativeSelect id="u-tipo" defaultValue="apto">
          <NativeSelectOption value="apto">Apartamento</NativeSelectOption>
          <NativeSelectOption value="casa">Casa</NativeSelectOption>
          <NativeSelectOption value="loja">Loja</NativeSelectOption>
          <NativeSelectOption value="sala">Sala</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor="u-alias">Como aparece na etiqueta</FieldLabel>
        <TagsInput id="u-alias" defaultValue={["B 304", "BL B AP 304", "304B"]} placeholder="Digite e Enter" />
        <FieldDescription>Ajuda a leitura da etiqueta a achar esta unidade.</FieldDescription>
      </Field>
    </Form>
  )
}

/* ---------------- Morador (com erro de exemplo) ---------------- */

function Morador() {
  return (
    <Form id="PES-001" titulo="Novo morador" nota="Unidade primeiro. Aviso só vai para contato com consentimento." onSubmit={salvar("Morador")} acao={<Button shape="pill"><UserPlusIcon aria-hidden />Salvar morador</Button>}>
      <Field>
        <FieldLabel htmlFor="m-nome">Nome completo</FieldLabel>
        <Input id="m-nome" defaultValue="Helena Prado" autoComplete="off" />
      </Field>
      <div className={dois}>
        <Field>
          <FieldLabel htmlFor="m-unidade">Unidade</FieldLabel>
          <Input id="m-unidade" defaultValue="B-305" />
        </Field>
        <Field>
          <FieldLabel htmlFor="m-papel">Papel</FieldLabel>
          <NativeSelect id="m-papel" defaultValue="titular">
            <NativeSelectOption value="titular">Titular</NativeSelectOption>
            <NativeSelectOption value="morador">Morador</NativeSelectOption>
            <NativeSelectOption value="inquilino">Inquilino</NativeSelectOption>
          </NativeSelect>
        </Field>
      </div>
      <div className={dois}>
        <Field data-invalid>
          <FieldLabel htmlFor="m-zap">WhatsApp</FieldLabel>
          <InputPhone id="m-zap" accept="mobile" defaultValue="1134567" aria-invalid aria-describedby="m-zap-erro" />
          <FieldError id="m-zap-erro">Número incompleto. Use DDD + 9 dígitos.</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="m-email">E-mail (opcional)</FieldLabel>
          <Input id="m-email" type="email" placeholder="nome@email.com" />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="m-cpf">CPF (opcional)</FieldLabel>
        <InputDocument id="m-cpf" accept="cpf" />
        <FieldDescription>Só para conferir na retirada. Não aparece na fila.</FieldDescription>
      </Field>
      <div className="flex items-start gap-3 rounded-2xl border bg-sunken p-4">
        <Checkbox id="m-ok" defaultChecked className="mt-0.5" />
        <Label htmlFor="m-ok" className="grid gap-1 font-normal">
          <span className="font-medium">Morador autorizou receber avisos no WhatsApp</span>
          <span className="text-sm text-muted-foreground">Registramos quem marcou e quando. Ele pode sair a qualquer momento respondendo SAIR.</span>
        </Label>
      </div>
    </Form>
  )
}

/* ---------------- Funcionário ---------------- */

function Funcionario() {
  return (
    <Form id="USR-003" titulo="Convidar funcionário" nota="Conta individual. A pessoa cria a própria senha pelo link." onSubmit={(e) => { e.preventDefault(); toast.success("Convite enviado", { description: "Vale 72 h. Exemplo da prancha." }) }} acao={<Button shape="pill"><SendIcon aria-hidden />Enviar convite</Button>}>
      <div className={dois}>
        <Field>
          <FieldLabel htmlFor="f-nome">Nome</FieldLabel>
          <Input id="f-nome" defaultValue="Rita Campos" />
        </Field>
        <Field>
          <FieldLabel htmlFor="f-email">E-mail</FieldLabel>
          <Input id="f-email" type="email" defaultValue="rita.c@gmail.com" />
        </Field>
      </div>
      <div className={dois}>
        <Field>
          <FieldLabel htmlFor="f-papel">Papel</FieldLabel>
          <NativeSelect id="f-papel" defaultValue="porteiro">
            <NativeSelectOption value="porteiro">Porteiro</NativeSelectOption>
            <NativeSelectOption value="zelador">Zelador</NativeSelectOption>
            <NativeSelectOption value="sindico">Síndico (só leitura)</NativeSelectOption>
            <NativeSelectOption value="gestor">Gestor</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="f-turno">Turno</FieldLabel>
          <NativeSelect id="f-turno" defaultValue="tarde">
            <NativeSelectOption value="manha">Manhã · 06:00 às 14:00</NativeSelectOption>
            <NativeSelectOption value="tarde">Tarde · 14:00 às 22:00</NativeSelectOption>
            <NativeSelectOption value="noite">Noite · 22:00 às 06:00</NativeSelectOption>
          </NativeSelect>
        </Field>
      </div>
      <fieldset className="grid gap-1">
        <legend className="mb-1 text-sm font-medium">Onde trabalha</legend>
        {[
          ["f-p1", "Vila Verde · portaria principal", true],
          ["f-p2", "Vila Verde · garagem", false],
        ].map(([id, l, on]) => (
          <div key={id as string} className="flex min-h-11 items-center gap-3">
            <Checkbox id={id as string} defaultChecked={on as boolean} />
            <Label htmlFor={id as string}>{l}</Label>
          </div>
        ))}
      </fieldset>
      <Field>
        <FieldLabel htmlFor="f-inicio">Começa em</FieldLabel>
        <InputDate id="f-inicio" defaultValue="2026-11-04" />
      </Field>
    </Form>
  )
}

/* ---------------- Autorizado a retirar ---------------- */

function Autorizado() {
  return (
    <Form id="PES-002" titulo="Autorizar retirada" nota="Pessoa de fora que pode retirar em nome do morador." onSubmit={salvar("Autorização")} acao={<Button shape="pill"><ShieldCheckIcon aria-hidden />Autorizar</Button>}>
      <div className={dois}>
        <Field>
          <FieldLabel htmlFor="a-nome">Nome completo</FieldLabel>
          <Input id="a-nome" defaultValue="Lúcia Ferreira" />
        </Field>
        <Field>
          <FieldLabel htmlFor="a-doc">CPF</FieldLabel>
          <InputDocument id="a-doc" accept="cpf" />
        </Field>
      </div>
      <div className={dois}>
        <Field>
          <FieldLabel htmlFor="a-rel">Relação</FieldLabel>
          <NativeSelect id="a-rel" defaultValue="diarista">
            <NativeSelectOption value="familiar">Familiar</NativeSelectOption>
            <NativeSelectOption value="diarista">Diarista</NativeSelectOption>
            <NativeSelectOption value="vizinho">Vizinho</NativeSelectOption>
            <NativeSelectOption value="outro">Outro</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="a-ate">Vale até</FieldLabel>
          <InputDate id="a-ate" defaultValue="2026-12-31" />
          <FieldDescription>Em branco = sem prazo.</FieldDescription>
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="a-por">Em nome de</FieldLabel>
        <NativeSelect id="a-por" defaultValue="mariana">
          <NativeSelectOption value="mariana">Mariana Souza · B-304</NativeSelectOption>
          <NativeSelectOption value="pedro">Pedro Souza · B-304</NativeSelectOption>
        </NativeSelect>
      </Field>
    </Form>
  )
}

/* ---------------- Área comum ---------------- */

function Area() {
  return (
    <Form id="UNI-003" titulo="Nova área comum" nota="Destino que não é apartamento: administração, academia, zeladoria." onSubmit={salvar("Área")} acao={<Button shape="pill"><SaveIcon aria-hidden />Salvar área</Button>}>
      <Field>
        <FieldLabel htmlFor="ar-nome">Nome</FieldLabel>
        <Input id="ar-nome" defaultValue="Garagem" />
      </Field>
      <Field>
        <FieldLabel htmlFor="ar-resp">Responsável</FieldLabel>
        <NativeSelect id="ar-resp" defaultValue="">
          <NativeSelectOption value="">Ninguém ainda</NativeSelectOption>
          <NativeSelectOption value="paulo">Paulo Mendes · Zelador</NativeSelectOption>
          <NativeSelectOption value="marta">Marta Andrade · Gestora</NativeSelectOption>
        </NativeSelect>
        <FieldDescription>Sem responsável, encomenda para cá não gera aviso.</FieldDescription>
      </Field>
      <div className="flex min-h-11 items-center justify-between gap-3">
        <Label htmlFor="ar-aviso">Avisar o responsável</Label>
        <Switch id="ar-aviso" />
      </div>
    </Form>
  )
}

/* ---------------- Ponto de recebimento ---------------- */

function Ponto() {
  const [prateleiras, setPrateleiras] = React.useState([
    { nome: "A1", cap: "24" },
    { nome: "B2", cap: "24" },
    { nome: "Volume grande", cap: "8" },
  ])
  return (
    <Form id="UNI-004" titulo="Novo ponto de recebimento" nota="Portaria ou sala onde as encomendas ficam guardadas." onSubmit={salvar("Ponto")} acao={<Button shape="pill"><SaveIcon aria-hidden />Salvar ponto</Button>}>
      <div className={dois}>
        <Field>
          <FieldLabel htmlFor="p-nome">Nome</FieldLabel>
          <Input id="p-nome" defaultValue="Portaria da garagem" />
        </Field>
        <Field>
          <FieldLabel htmlFor="p-hor">Funciona</FieldLabel>
          <Input id="p-hor" defaultValue="07:00 às 19:00" />
        </Field>
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">Prateleiras</legend>
        {prateleiras.map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr_110px_auto] items-end gap-2">
            <Input aria-label={`Prateleira ${i + 1}, nome`} defaultValue={p.nome} />
            <Input aria-label={`Prateleira ${i + 1}, capacidade`} inputMode="numeric" defaultValue={p.cap} />
            <Button type="button" variant="ghost" size="icon" aria-label={`Remover prateleira ${p.nome}`} onClick={() => setPrateleiras((l) => l.filter((_, j) => j !== i))}>
              <Trash2Icon aria-hidden />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" shape="pill" className="justify-self-start" onClick={() => setPrateleiras((l) => [...l, { nome: "", cap: "" }])}>
          <PlusIcon aria-hidden />Adicionar prateleira
        </Button>
      </fieldset>
      <p className="text-xs text-muted-foreground">Prateleira com encomenda não pode ser removida: mova as encomendas antes.</p>
    </Form>
  )
}

/* ---------------- Conta (admin da plataforma) ---------------- */

function Conta() {
  return (
    <Form id="SAAS-001" titulo="Nova conta (administradora)" nota="Uso interno da PacoteZap: quem paga e quais condomínios entram." onSubmit={salvar("Conta")} acao={<Button shape="pill"><Building2Icon aria-hidden />Criar conta</Button>}>
      <Field>
        <FieldLabel htmlFor="o-razao">Razão social</FieldLabel>
        <Input id="o-razao" defaultValue="Andrade Gestão Condominial Ltda." />
      </Field>
      <div className={dois}>
        <Field>
          <FieldLabel htmlFor="o-cnpj">CNPJ</FieldLabel>
          <InputDocument id="o-cnpj" accept="cnpj" />
        </Field>
        <Field>
          <FieldLabel htmlFor="o-plano">Plano</FieldLabel>
          <NativeSelect id="o-plano" defaultValue="pro">
            <NativeSelectOption value="essencial">Essencial · até 100 unidades</NativeSelectOption>
            <NativeSelectOption value="pro">Pro · até 500 unidades</NativeSelectOption>
            <NativeSelectOption value="rede">Rede · sob consulta</NativeSelectOption>
          </NativeSelect>
        </Field>
      </div>
      <div className={dois}>
        <Field>
          <FieldLabel htmlFor="o-resp">Responsável</FieldLabel>
          <Input id="o-resp" defaultValue="Marta Andrade" />
        </Field>
        <Field>
          <FieldLabel htmlFor="o-fin">E-mail da cobrança</FieldLabel>
          <Input id="o-fin" type="email" defaultValue="financeiro@andradegestao.com.br" />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="o-obs">Observação interna</FieldLabel>
        <Textarea id="o-obs" rows={2} placeholder="Não aparece para o cliente" />
      </Field>
    </Form>
  )
}

/* ---------------- página ---------------- */

export function Formularios() {
  return (
    <div data-wc-theme="custelo" data-mode="light" style={vars(PALETAS[0].vars)} className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-10">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Pranchas · 03/11/2026 · WebCode UI · paleta Névoa</p>
          <h1 className="font-display text-5xl font-bold text-balance">Formulários de cadastro</h1>
          <p className="max-w-[65ch] text-muted-foreground">
            Todos os cadastros do sistema. Os formulários funcionam: dá para preencher, avançar o passo a passo e salvar (aparece o aviso de confirmação). O de morador mostra um erro de exemplo.
          </p>
        </header>
        <Banner variant="info" className="rounded-2xl">
          <ShieldCheckIcon aria-hidden />
          <BannerContent>
            <BannerDescription>Regra em todos: tenant e condomínio vêm do login, nunca do formulário. Campo pessoal só o necessário, e CPF sempre opcional.</BannerDescription>
          </BannerContent>
        </Banner>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Condominio />
          <Morador />
          <Unidade />
          <Funcionario />
          <Autorizado />
          <Ponto />
          <Area />
          <Conta />
        </div>
      </div>
    </div>
  )
}
