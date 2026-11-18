"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { PackageIcon, RefreshCwIcon, SearchXIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { SemPermissao } from "@/components/feedback/sem-permissao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { FilterCounters } from "@/components/ui/filter-counters";
import { ItemGroup } from "@/components/ui/item";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { SearchBar } from "@/components/ui/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { buscarOps, FalhaDaApi } from "@/lib/api-ops";

import { LinhaFila, type LinhaFilaDto } from "./linha-fila";

type Filtro = "prontas" | "falha" | "prazo";
export type RespostaFila = {
  itens: LinhaFilaDto[];
  proximo: string | null;
  contadores: {
    todas: number;
    prontas: number;
    falha: number;
    prazo: number;
    naoIdent: number;
  };
};

function useAtrasado(valor: string, ms = 300) {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return atrasado;
}

function EsqueletoFila() {
  return (
    <div className="grid gap-2">
      <span role="status" className="sr-only">
        Carregando a fila…
      </span>
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton
          key={i}
          className="h-20 w-full rounded-2xl"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

/** CUS-001 da portaria: uma linha por unidade, atualiza a cada 30 s e ao voltar o foco. */
export function FilaPortaria() {
  const [texto, setTexto] = useState("");
  const busca = useAtrasado(texto.trim());
  const [filtro, setFiltro] = useState<Filtro | null>(null);

  const consulta = useInfiniteQuery({
    queryKey: ["fila", busca, filtro],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      const q = new URLSearchParams();
      if (busca) q.set("busca", busca);
      if (filtro) q.set("filtro", filtro);
      if (pageParam) q.set("cursor", pageParam);
      return buscarOps<RespostaFila>(`/api/ops/fila?${q}`);
    },
    getNextPageParam: (ultima) => ultima.proximo,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const erro = consulta.error instanceof FalhaDaApi ? consulta.error : null;
  if (erro?.codigo === "SEM_PERMISSAO")
    return <SemPermissao voltarPara="/receber" />;

  const paginas = consulta.data?.pages ?? [];
  const itens = paginas.flatMap((p) => p.itens);
  const c = paginas[0]?.contadores;
  const agora = new Date();
  const limpar = () => {
    setTexto("");
    setFiltro(null);
  };

  return (
    <div className="grid gap-3">
      <NavigationBar
        title="Fila"
        large
        trailing={
          c ? (
            <span className="pe-3 text-sm text-muted-foreground">
              {c.todas} em custódia
            </span>
          ) : null
        }
      />
      <div className="grid gap-3 px-4">
        <SearchBar
          placeholder="Unidade ou nome"
          aria-label="Buscar encomenda"
          value={texto}
          onValueChange={setTexto}
          inputClassName="rounded-full border bg-card shadow-wc-xs"
        />
        <FilterCounters
          value={filtro ?? "todas"}
          onValueChange={(v) =>
            setFiltro(v === null || v === "todas" ? null : (v as Filtro))
          }
          loading={!c}
          items={[
            { value: "todas", label: "Todas", count: c?.todas ?? 0 },
            {
              value: "prontas",
              label: "Prontas",
              count: c?.prontas ?? 0,
              tone: "success",
            },
            {
              value: "falha",
              label: "Falha no aviso",
              count: c?.falha ?? 0,
              tone: "danger",
            },
            {
              value: "prazo",
              label: "Prazo",
              count: c?.prazo ?? 0,
              tone: "warning",
            },
          ]}
        />

        {consulta.isPending ? (
          <EsqueletoFila />
        ) : erro && itens.length === 0 ? (
          <Alert variant="danger" role="alert">
            <AlertTitle>Não deu para carregar a fila</AlertTitle>
            <AlertDescription className="grid gap-3">
              {erro.message}
              <Button
                variant="outline"
                shape="pill"
                className="justify-self-start"
                onClick={() => void consulta.refetch()}
              >
                <RefreshCwIcon aria-hidden />
                Tentar de novo
              </Button>
            </AlertDescription>
          </Alert>
        ) : itens.length === 0 ? (
          busca || filtro ? (
            <EmptyState
              variant="no-results"
              icon={<SearchXIcon aria-hidden />}
              title={
                busca
                  ? `Nenhuma encomenda com "${busca}".`
                  : "Nenhuma encomenda neste filtro."
              }
              description="Confira o número ou limpe a busca."
              action={
                <Button variant="outline" shape="pill" onClick={limpar}>
                  Limpar
                </Button>
              }
              headingLevel="h2"
              announce
            />
          ) : (
            <EmptyState
              icon={<PackageIcon aria-hidden />}
              title="Nenhuma encomenda na portaria agora."
              description="Quando uma encomenda for registrada, ela aparece aqui."
              headingLevel="h2"
            />
          )
        ) : (
          <>
            <ItemGroup className="gap-2" aria-label="Encomendas por unidade">
              {itens.map((l) => (
                <LinhaFila key={l.chave} linha={l} agora={agora} />
              ))}
            </ItemGroup>
            {consulta.hasNextPage ? (
              <Button
                variant="outline"
                shape="pill"
                className="justify-self-center"
                disabled={consulta.isFetchingNextPage}
                onClick={() => void consulta.fetchNextPage()}
              >
                {consulta.isFetchingNextPage ? "Carregando…" : "Carregar mais"}
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
