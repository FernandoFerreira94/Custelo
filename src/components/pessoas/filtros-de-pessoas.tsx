"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ContagensDePessoas } from "@/application/pessoas/ports";
import {
  type FiltroDePessoa,
  urlDasPessoas,
} from "@/components/pessoas/filtros";
import { FilterCounters } from "@/components/ui/filter-counters";
import { Input } from "@/components/ui/input";

/** Contadores que filtram a lista e a busca por nome. O estado vive na URL. */
export function FiltrosDePessoas({
  contagens,
  filtro,
  busca,
}: {
  contagens: ContagensDePessoas;
  filtro: FiltroDePessoa;
  busca: string;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState(busca);

  return (
    <div className="grid gap-4">
      <FilterCounters
        value={filtro}
        onValueChange={(v) =>
          router.push(
            urlDasPessoas(v === "todas" ? null : (v as FiltroDePessoa), texto),
          )
        }
        items={[
          { value: "todas", label: "Todas", count: contagens.todas },
          {
            value: "titulares",
            label: "Titulares",
            count: contagens.titulares,
          },
          {
            value: "moradores",
            label: "Moradores",
            count: contagens.moradores,
          },
          {
            value: "inquilinos",
            label: "Inquilinos",
            count: contagens.inquilinos,
          },
          {
            value: "autorizados",
            label: "Autorizados",
            count: contagens.autorizados,
          },
          {
            value: "semContato",
            label: "Sem contato",
            count: contagens.semContato,
            tone: "warning",
          },
        ]}
      />
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(urlDasPessoas(filtro, texto));
        }}
        className="relative max-w-md"
      >
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Buscar por nome"
          placeholder="Buscar por nome"
          className="pl-9"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </form>
    </div>
  );
}
