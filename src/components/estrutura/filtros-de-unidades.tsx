"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ContagensDeUnidades } from "@/application/estrutura/ports";
import { FilterCounters } from "@/components/ui/filter-counters";
import { Input } from "@/components/ui/input";

export type FiltroAtivo = "semContato" | "areasComuns" | "inativas" | null;

/** URL da lista com o filtro e a busca; sem filtro e sem busca, a rota limpa. */
export function urlDaLista(filtro: FiltroAtivo, busca: string): string {
  const params = new URLSearchParams();
  if (filtro) params.set("filtro", filtro);
  if (busca.trim()) params.set("q", busca.trim());
  const texto = params.toString();
  return texto ? `/gestao/unidades?${texto}` : "/gestao/unidades";
}

/** Contadores que filtram a lista e a busca por código ou apelido. O estado vive na URL. */
export function FiltrosDeUnidades({
  contagens,
  filtro,
  busca,
}: {
  contagens: ContagensDeUnidades;
  filtro: FiltroAtivo;
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
            urlDaLista(v === "todas" ? null : (v as FiltroAtivo), texto),
          )
        }
        items={[
          { value: "todas", label: "Todas", count: contagens.todas },
          {
            value: "semContato",
            label: "Sem contato",
            count: contagens.semContato,
            tone: "warning",
          },
          {
            value: "areasComuns",
            label: "Áreas comuns",
            count: contagens.areasComuns,
          },
          {
            value: "inativas",
            label: "Inativas",
            count: contagens.inativas,
            tone: "danger",
          },
        ]}
      />
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(urlDaLista(filtro, texto));
        }}
        className="relative max-w-md"
      >
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Buscar por código ou apelido"
          placeholder="Buscar por código ou apelido"
          className="pl-9"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </form>
    </div>
  );
}
