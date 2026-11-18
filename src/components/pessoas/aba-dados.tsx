"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { PessoaBruta } from "@/application/pessoas/ports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { formatarCpf } from "@/domain/pessoas/cpf";
import type { Falha, Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;
type AcaoDeDetalhe = (
  entrada: unknown,
) => Promise<Resultado<{ cpf: string | null }>>;

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/** Aba "Dados": CPF mascarado (o completo é auditado) e contatos com a autorização de cada um. */
export function AbaDados({
  pessoa,
  podeEditar,
  detalhe,
  consentir,
  salvarContato,
}: {
  pessoa: PessoaBruta;
  podeEditar: boolean;
  detalhe: AcaoDeDetalhe;
  consentir: Acao;
  salvarContato: Acao;
}) {
  const router = useRouter();
  const [cpfCompleto, setCpfCompleto] = useState<string | null>(null);
  const [canal, setCanal] = useState<"whatsapp" | "email">("whatsapp");
  const [valor, setValor] = useState("");
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function mostrarCpf() {
    iniciar(async () => {
      // Cada visualização deixa CPF_VISUALIZADO na auditoria, sem o número.
      const r = await detalhe({ id: pessoa.id, mostrarCpf: true });
      if (!r.ok) {
        toast.error(r.mensagem);
        return;
      }
      setCpfCompleto(r.data.cpf ? formatarCpf(r.data.cpf) : null);
    });
  }

  function registrar(contatoId: string) {
    iniciar(async () => {
      const r = await consentir({ contatoId });
      if (!r.ok) {
        toast.error(r.mensagem);
        return;
      }
      toast.success(r.mensagem ?? "Autorização registrada.");
      router.refresh();
    });
  }

  function adicionar() {
    iniciar(async () => {
      const r = await salvarContato({ pessoaId: pessoa.id, canal, valor });
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setValor("");
      toast.success(r.mensagem ?? "Contato salvo.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6">
      <DescriptionList layout="horizontal">
        <DescriptionItem label="Nome">{pessoa.nome}</DescriptionItem>
        <DescriptionItem label="CPF">
          {pessoa.cpf ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{cpfCompleto ?? pessoa.cpf}</span>
              {podeEditar ? (
                cpfCompleto ? (
                  <Button
                    variant="ghost"

                    onClick={() => setCpfCompleto(null)}
                  >
                    <EyeOffIcon aria-hidden />
                    Ocultar
                  </Button>
                ) : (
                  <Button
                    variant="ghost"

                    disabled={pendente}
                    onClick={mostrarCpf}
                  >
                    <EyeIcon aria-hidden />
                    Mostrar
                  </Button>
                )
              ) : null}
            </span>
          ) : (
            "Não informado"
          )}
        </DescriptionItem>
      </DescriptionList>

      <section aria-labelledby="contatos-titulo" className="grid gap-3">
        <h3 id="contatos-titulo" className="font-semibold">
          Contatos
        </h3>
        {pessoa.contatos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum contato. Sem contato autorizado, nenhum aviso sai para esta
            pessoa.
          </p>
        ) : (
          <ul className="grid gap-2">
            {pessoa.contatos.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3"
              >
                <div className="grid">
                  <span className="font-mono">{c.valor}</span>
                  <span className="text-sm text-muted-foreground">
                    {c.canal === "whatsapp" ? "WhatsApp" : "E-mail"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {c.consentimentoEm ? (
                    <Badge variant="success">
                      Autorizou em {data.format(c.consentimentoEm)}
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="warning">Sem autorização</Badge>
                      {podeEditar ? (
                        <Button
                          variant="outline"

                          shape="pill"
                          disabled={pendente}
                          onClick={() => registrar(c.id)}
                        >
                          Registrar autorização
                        </Button>
                      ) : null}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {podeEditar ? (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              adicionar();
            }}
            className="grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-start"
          >
            <Field>
              <FieldLabel htmlFor="ct-canal">Canal</FieldLabel>
              <NativeSelect
                id="ct-canal"
                value={canal}
                onChange={(e) =>
                  setCanal(e.target.value as "whatsapp" | "email")
                }
              >
                <NativeSelectOption value="whatsapp">
                  WhatsApp
                </NativeSelectOption>
                <NativeSelectOption value="email">E-mail</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field data-invalid={falha?.campos?.valor ? true : undefined}>
              <FieldLabel htmlFor="ct-valor">Contato</FieldLabel>
              <Input
                id="ct-valor"
                autoComplete="off"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                aria-invalid={falha?.campos?.valor ? true : undefined}
                aria-describedby={
                  falha?.campos?.valor ? "ct-valor-erro" : undefined
                }
              />
              {falha?.campos?.valor ? (
                <FieldError id="ct-valor-erro">{falha.campos.valor}</FieldError>
              ) : null}
            </Field>
            <Button
              type="submit"
              variant="outline"
              shape="pill"
              className="sm:mt-6"
              disabled={pendente}
            >
              Adicionar contato
            </Button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
