"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FilterCounters } from "@/components/ui/filter-counters";
import { Input } from "@/components/ui/input";

export type FiltroDeEncomendas = "prontas" | "falha" | "prazo" | "naoIdent";
export type ParametrosDaLista = {
  filtro?: FiltroDeEncomendas;
  q?: string;
  de?: string;
  ate?: string;
};

/** URL da lista com só o que está preenchido; sem nada, a rota limpa. */
export function urlDaListaDeEncomendas(
  p: ParametrosDaLista & { cursor?: string },
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(p))
    if (v?.trim()) params.set(k, v.trim());
  const texto = params.toString();
  return texto ? `/gestao/encomendas?${texto}` : "/gestao/encomendas";
}

/** Contadores, busca e período da CUS-001 da gestão. O estado vive na URL. */
export function FiltrosDeEncomendas({
  contadores,
  atual,
}: {
  contadores: {
    todas: number;
    prontas: number;
    falha: number;
    prazo: number;
    naoIdent: number;
  };
  atual: ParametrosDaLista;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState(atual.q ?? "");
  const [de, setDe] = useState(atual.de ?? "");
  const [ate, setAte] = useState(atual.ate ?? "");
  const ir = (p: Partial<ParametrosDaLista>) =>
    router.push(urlDaListaDeEncomendas({ ...atual, q: texto, de, ate, ...p }));

  return (
    <div className="grid gap-4">
      <FilterCounters
        value={atual.filtro ?? "todas"}
        onValueChange={(v) =>
          ir({
            filtro:
              v === null || v === "todas"
                ? undefined
                : (v as FiltroDeEncomendas),
          })
        }
        items={[
          { value: "todas", label: "Na portaria", count: contadores.todas },
          {
            value: "prontas",
            label: "Prontas",
            count: contadores.prontas,
            tone: "success",
          },
          {
            value: "falha",
            label: "Falha no aviso",
            count: contadores.falha,
            tone: "danger",
          },
          {
            value: "prazo",
            label: "Prazo",
            count: contadores.prazo,
            tone: "warning",
          },
          {
            value: "naoIdent",
            label: "Não identificadas",
            count: contadores.naoIdent,
          },
        ]}
      />
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          ir({});
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="relative min-w-60 flex-1 sm:max-w-md">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Buscar por unidade, nome ou código"
            placeholder="Unidade, nome ou código"
            className="pl-9 text-base"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
        <label className="grid gap-1 text-sm">
          Recebidas de
          <Input
            type="date"
            className="text-base"
            value={de}
            onChange={(e) => setDe(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm">
          até
          <Input
            type="date"
            className="text-base"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
          />
        </label>
        <button type="submit" className="sr-only">
          Filtrar
        </button>
      </form>
    </div>
  );
}
