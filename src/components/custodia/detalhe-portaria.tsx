"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeftIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";

import { SemPermissao } from "@/components/feedback/sem-permissao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { buscarOps, enviarOps, FalhaDaApi } from "@/lib/api-ops";
import { falha, sucesso } from "@/lib/resultado";

import {
  DetalheEncomenda,
  type DetalheDto,
  type ItemLinhaDto,
} from "./detalhe-encomenda";
import { EncomendaNaoEncontrada } from "./encomenda-nao-encontrada";
import { type LocalDto, MoverSheet, type PedidoDeMover } from "./mover-sheet";

export type VisaoDoDetalhe = {
  detalhe: DetalheDto;
  linha: ItemLinhaDto[];
  locais: LocalDto[] | null;
};

function EsqueletoDetalhe() {
  return (
    <div className="grid gap-4 px-4">
      <span role="status" className="sr-only">
        Carregando a encomenda…
      </span>
      <Skeleton className="h-40 w-full rounded-3xl" />
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-2xl" />
      ))}
    </div>
  );
}

async function moverPelaApi(id: string, p: PedidoDeMover) {
  try {
    const r = await enviarOps<unknown>(`/api/ops/encomendas/${id}/mover`, p);
    return sucesso(r.data, r.mensagem);
  } catch (e) {
    const f =
      e instanceof FalhaDaApi
        ? e
        : new FalhaDaApi("INDISPONIVEL", "Não deu para mover agora.");
    return falha(f.codigo === "REDE" ? "INDISPONIVEL" : f.codigo, f.message);
  }
}

/** CUS-002/003/005 na portaria: busca no cliente e recarrega depois de mover. */
export function DetalhePortaria({ id }: { id: string }) {
  const cliente = useQueryClient();
  const chave = ["encomenda", id];
  const consulta = useQuery({
    queryKey: chave,
    queryFn: () => buscarOps<VisaoDoDetalhe>(`/api/ops/encomendas/${id}`),
  });
  const erro = consulta.error instanceof FalhaDaApi ? consulta.error : null;
  if (erro?.codigo === "NAO_ENCONTRADO" || erro?.codigo === "ENTRADA_INVALIDA")
    return <EncomendaNaoEncontrada fila="/fila" />;
  if (erro?.codigo === "SEM_PERMISSAO")
    return <SemPermissao voltarPara="/fila" />;

  const v = consulta.data;
  const recarregar = () => {
    void cliente.invalidateQueries({ queryKey: chave });
    void cliente.invalidateQueries({ queryKey: ["fila"] });
  };

  return (
    <div className="grid gap-3 pb-4">
      <NavigationBar
        title={v?.detalhe.unidade?.codigo ?? (v ? "Sem unidade" : "Encomenda")}
        leading={
          <Button asChild variant="ghost" size="icon" className="size-11">
            <Link href="/fila" aria-label="Voltar para a fila">
              <ChevronLeftIcon aria-hidden />
            </Link>
          </Button>
        }
      />
      {consulta.isPending ? (
        <EsqueletoDetalhe />
      ) : !v ? (
        <div className="px-4">
          <Alert variant="danger" role="alert">
            <AlertTitle>Não deu para abrir a encomenda</AlertTitle>
            <AlertDescription className="grid gap-3">
              {erro?.message}
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
        </div>
      ) : (
        <div className="px-4">
          <DetalheEncomenda
            d={v.detalhe}
            linha={v.linha}
            agora={new Date()}
            hrefDe={(o) => `/encomendas/${o}`}
            acoes={
              v.locais ? (
                <MoverSheet
                  lado="bottom"
                  localAtual={v.detalhe.local}
                  locais={v.locais}
                  operador="você"
                  mover={(p) => moverPelaApi(id, p)}
                  aoMover={recarregar}
                />
              ) : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
