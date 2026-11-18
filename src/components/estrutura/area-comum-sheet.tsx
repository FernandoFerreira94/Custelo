"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { AreaComum } from "@/application/estrutura/ports";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import type { Falha, Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

export type PessoaParaEscolher = { id: string; nome: string };

/**
 * Área comum (UNI-003): destino que não é apartamento. Por baixo é uma unidade
 * `tipo='area_comum'`; sem responsável, encomenda para cá não gera aviso.
 */
export function AreaComumSheet({
  area,
  pessoas,
  salvar,
}: {
  area?: AreaComum;
  pessoas: PessoaParaEscolher[];
  salvar: Acao;
}) {
  const router = useRouter();
  const editando = Boolean(area);
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState(area?.codigo ?? "");
  const [responsavel, setResponsavel] = useState(
    area?.responsavelPessoaId ?? "",
  );
  const [avisar, setAvisar] = useState(area?.avisarResponsavel ?? false);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar() {
    iniciar(async () => {
      const comum = {
        tipo: "area_comum",
        responsavelPessoaId: responsavel || null,
        avisarResponsavel: avisar,
      };
      const r = await salvar(
        editando
          ? { id: area!.id, codigo: nome, ...comum }
          : { numero: nome, ...comum },
      );
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(r.mensagem ?? "Área salva.");
      router.refresh();
    });
  }

  const erroNome = falha?.campos?.numero ?? falha?.campos?.codigo;
  const erroResponsavel = falha?.campos?.responsavel;

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        {editando ? (
          <Button variant="ghost">
            <PencilIcon aria-hidden />
            Editar
          </Button>
        ) : (
          <Button variant="outline" shape="pill">
            <PlusIcon aria-hidden />
            Área
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {editando ? `Editar ${area!.codigo}` : "Nova área comum"}
          </SheetTitle>
          <SheetDescription>
            Destino que não é apartamento: administração, academia, zeladoria.
          </SheetDescription>
        </SheetHeader>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
          className="grid gap-4"
        >
          <SheetBody className="grid content-start gap-4">
            {falha && !falha.campos ? (
              <Alert variant="danger" role="alert">
                <AlertDescription>{falha.mensagem}</AlertDescription>
              </Alert>
            ) : null}
            <Field data-invalid={erroNome ? true : undefined}>
              <FieldLabel htmlFor="ac-nome">Nome</FieldLabel>
              <Input
                id="ac-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                aria-invalid={erroNome ? true : undefined}
                aria-describedby={erroNome ? "ac-nome-erro" : undefined}
              />
              {erroNome ? (
                <FieldError id="ac-nome-erro">{erroNome}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={erroResponsavel ? true : undefined}>
              <FieldLabel htmlFor="ac-resp">Responsável</FieldLabel>
              <NativeSelect
                id="ac-resp"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                aria-invalid={erroResponsavel ? true : undefined}
                aria-describedby={erroResponsavel ? "ac-resp-erro" : undefined}
              >
                <NativeSelectOption value="">Ninguém ainda</NativeSelectOption>
                {pessoas.map((p) => (
                  <NativeSelectOption key={p.id} value={p.id}>
                    {p.nome}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              {erroResponsavel ? (
                <FieldError id="ac-resp-erro">{erroResponsavel}</FieldError>
              ) : (
                <FieldDescription>
                  Sem responsável, encomenda para cá não gera aviso.
                </FieldDescription>
              )}
            </Field>
            <div className="flex min-h-11 items-center justify-between gap-3">
              <Label htmlFor="ac-aviso">Avisar o responsável</Label>
              <Switch
                id="ac-aviso"
                checked={avisar}
                onCheckedChange={setAvisar}
              />
            </div>
          </SheetBody>
          <SheetFooter>
            <Button type="submit" shape="pill" size="lg" disabled={pendente}>
              {pendente ? "Salvando…" : "Salvar área"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
