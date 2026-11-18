"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type PrateleiraEditavel = {
  /** Chave local da linha (estável enquanto o form está aberto). */
  chave: string;
  id?: string;
  codigo: string;
  capacidade: string;
  volumeGrande: boolean;
  usado: number;
};

let seq = 0;
export const novaPrateleira = (): PrateleiraEditavel => ({
  chave: `nova-${++seq}`,
  codigo: "",
  capacidade: "",
  volumeGrande: false,
  usado: 0,
});

/** O que vai para a action: capacidade vazia = sem limite. */
export function paraEnvio(lista: PrateleiraEditavel[]) {
  return lista.map((p) => ({
    ...(p.id ? { id: p.id } : {}),
    codigo: p.codigo,
    capacidade: p.capacidade.trim() === "" ? null : Number(p.capacidade),
    volumeGrande: p.volumeGrande,
  }));
}

/**
 * Lista "Prateleiras" do form do ponto (prancha `pz-forms · Ponto`). Prateleira com
 * encomenda não tem botão de remover: o servidor também recusa.
 */
export function PrateleirasCampos({
  lista,
  mudar,
  erros,
}: {
  lista: PrateleiraEditavel[];
  mudar: (lista: PrateleiraEditavel[]) => void;
  erros?: Record<string, string>;
}) {
  const alterar = (i: number, campo: Partial<PrateleiraEditavel>) =>
    mudar(lista.map((p, j) => (j === i ? { ...p, ...campo } : p)));

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium">Prateleiras</legend>
      {lista.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sem prateleiras. Adicione onde as encomendas ficam guardadas.
        </p>
      ) : null}
      {lista.map((p, i) => {
        const nome = p.codigo || `${i + 1}`;
        const erroCodigo = erros?.[`${i}.codigo`];
        const erroCap = erros?.[`${i}.capacidade`];
        return (
          <div key={p.chave} className="grid gap-1">
            <div className="grid grid-cols-[1fr_6.5rem_auto] items-center gap-2">
              <Input
                aria-label={`Prateleira ${i + 1}, nome`}
                value={p.codigo}
                maxLength={20}
                onChange={(e) => alterar(i, { codigo: e.target.value })}
                aria-invalid={erroCodigo ? true : undefined}
              />
              <Input
                aria-label={`Prateleira ${i + 1}, capacidade`}
                inputMode="numeric"
                placeholder="Sem limite"
                value={p.capacidade}
                onChange={(e) =>
                  alterar(i, { capacidade: e.target.value.replace(/\D/g, "") })
                }
                aria-invalid={erroCap ? true : undefined}
              />
              {p.usado > 0 ? (
                <span className="min-w-11 text-center text-xs text-muted-foreground">
                  {p.usado} {p.usado === 1 ? "encomenda" : "encomendas"}
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label={`Remover prateleira ${nome}`}
                  onClick={() => mudar(lista.filter((_, j) => j !== i))}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              )}
            </div>
            {erroCodigo || erroCap ? (
              <FieldError>{erroCodigo ?? erroCap}</FieldError>
            ) : null}
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        shape="pill"
        className="justify-self-start"
        onClick={() => mudar([...lista, novaPrateleira()])}
      >
        <PlusIcon aria-hidden />
        Adicionar prateleira
      </Button>
      <p className="text-sm text-muted-foreground">
        Prateleira com encomenda não pode ser removida: mova as encomendas
        antes.
      </p>
    </fieldset>
  );
}
