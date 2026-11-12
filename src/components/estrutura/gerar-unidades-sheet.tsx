"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { gerarUnidades } from "@/domain/estrutura/gerador";
import type { Falha, Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

type Numeracao = "andar" | "seq";

const inteiro = (v: string, padrao: number) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : padrao;
};

/** Prévia pura, feita no cliente com a mesma função que o servidor usa para criar. */
export function previaDaGeracao(e: {
  blocos: number;
  andares: number;
  porAndar: number;
  numeracao: Numeracao;
}) {
  const r = gerarUnidades(e);
  if (!r.ok) return { ok: false as const, mensagem: r.mensagem };
  const codigos = r.data.blocos.flatMap((b) =>
    b.andares.flatMap((a) => a.unidades.map((u) => u.codigo)),
  );
  return {
    ok: true as const,
    total: r.data.total,
    primeiro: codigos[0] ?? "",
    ultimo: codigos.at(-1) ?? "",
  };
}

/** "Novo bloco" da UNI-001: gera blocos, andares e unidades de uma vez. */
export function GerarUnidadesSheet({
  gerar,
  gatilho,
}: {
  gerar: Acao;
  /** Botão que abre o painel; sem ele, usa o "Novo bloco" padrão. */
  gatilho?: ReactNode;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [blocos, setBlocos] = useState("3");
  const [andares, setAndares] = useState("9");
  const [porAndar, setPorAndar] = useState("8");
  const [numeracao, setNumeracao] = useState<Numeracao>("andar");
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  const entrada = {
    blocos: inteiro(blocos, 0),
    andares: inteiro(andares, 0),
    porAndar: inteiro(porAndar, 0),
    numeracao,
  };
  // Barato mesmo no limite de 5.000 unidades; sem memo, a prévia nunca fica velha.
  const previa = previaDaGeracao(entrada);

  function criar() {
    iniciar(async () => {
      const r = await gerar(entrada);
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(r.mensagem ?? "Unidades criadas.");
      router.refresh();
    });
  }

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        {gatilho ?? (
          <Button shape="pill">
            <PlusIcon aria-hidden />
            Novo bloco
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Gerar blocos e unidades</SheetTitle>
          <SheetDescription>
            Informe o tamanho e criamos tudo de uma vez. Nada é criado se algum
            código já existir.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="grid content-start gap-4">
          {falha ? (
            <Alert variant="danger" role="alert">
              <AlertDescription>{falha.mensagem}</AlertDescription>
            </Alert>
          ) : null}
          <Field>
            <FieldLabel htmlFor="ger-blocos">Blocos</FieldLabel>
            <Input
              id="ger-blocos"
              inputMode="numeric"
              value={blocos}
              onChange={(e) => setBlocos(e.target.value)}
            />
            <FieldDescription>
              Use 0 se o condomínio não tem blocos.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="ger-andares">Andares por bloco</FieldLabel>
            <Input
              id="ger-andares"
              inputMode="numeric"
              value={andares}
              onChange={(e) => setAndares(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ger-por-andar">Unidades por andar</FieldLabel>
            <Input
              id="ger-por-andar"
              inputMode="numeric"
              value={porAndar}
              onChange={(e) => setPorAndar(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ger-numeracao">Como numera</FieldLabel>
            <NativeSelect
              id="ger-numeracao"
              value={numeracao}
              onChange={(e) => setNumeracao(e.target.value as Numeracao)}
            >
              <NativeSelectOption value="andar">
                Andar + final (101, 102…)
              </NativeSelectOption>
              <NativeSelectOption value="seq">
                Sequencial (1, 2, 3…)
              </NativeSelectOption>
            </NativeSelect>
          </Field>
          <p
            aria-live="polite"
            className="rounded-2xl bg-muted px-4 py-3 text-sm"
          >
            {previa.ok
              ? `${previa.primeiro} … ${previa.ultimo} · ${previa.total} unidades`
              : previa.mensagem}
          </p>
        </SheetBody>
        <SheetFooter>
          <Button
            type="button"
            shape="pill"
            size="lg"
            disabled={pendente || !previa.ok}
            onClick={criar}
          >
            {pendente
              ? "Criando…"
              : previa.ok
                ? `Criar ${previa.total} unidades`
                : "Criar unidades"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
