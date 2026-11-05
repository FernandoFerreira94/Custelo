import { SearchXIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import type { FiltroDePessoas } from "@/application/pessoas/ports";
import { pode } from "@/application/permissoes";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import {
  FILTROS_DE_PESSOA,
  type FiltroDePessoa,
} from "@/components/pessoas/filtros";
import { FiltrosDePessoas } from "@/components/pessoas/filtros-de-pessoas";
import { ListaDePessoas } from "@/components/pessoas/lista-de-pessoas";
import { MoradorSheet } from "@/components/pessoas/morador-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";
import { pessoasRepo } from "@/infrastructure/pessoas/pessoas-repo";

import { criarPessoaAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pessoas" };

type Parametros = { filtro?: string; q?: string; cursor?: string };

const TIPO_DO_FILTRO: Record<
  Exclude<FiltroDePessoa, "semContato" | null>,
  NonNullable<FiltroDePessoas["tipo"]>
> = {
  titulares: "titular",
  moradores: "morador",
  inquilinos: "inquilino",
  autorizados: "autorizado",
};

function filtroDaUrl(valor: string | undefined): FiltroDePessoa {
  return (FILTROS_DE_PESSOA as readonly string[]).includes(valor ?? "")
    ? (valor as FiltroDePessoa)
    : null;
}

/** PES-001: lista de pessoas, com filtros por papel, busca por nome e cadastro de morador. */
export default async function PessoasPage({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok || !pode(ctx.data.papel, "cadastro.ler")) {
    return <SemPermissao voltarPara="/gestao" />;
  }
  const podeEditar = pode(ctx.data.papel, "cadastro.editar");
  const parametros = await searchParams;
  const filtro = filtroDaUrl(parametros.filtro);
  const busca = parametros.q?.trim() ?? "";

  const [contagens, pagina, unidades] = await Promise.all([
    pessoasRepo.contagensDePessoas(ctx.data),
    pessoasRepo.listarPessoas(ctx.data, {
      busca: busca || undefined,
      tipo:
        filtro && filtro !== "semContato" ? TIPO_DO_FILTRO[filtro] : undefined,
      semContato: filtro === "semContato",
      cursor: parametros.cursor,
    }),
    podeEditar ? estruturaRepo.resumoDeUnidades(ctx.data) : Promise.resolve([]),
  ]);
  const semNenhuma = contagens.todas === 0 && !busca && !filtro;

  return (
    <main className="grid content-start gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Pessoas</h1>
          <p className="text-muted-foreground">
            Quem mora, quem retira e quem recebe aviso em cada unidade.
          </p>
        </div>
        {podeEditar ? (
          <MoradorSheet
            unidades={unidades.map((u) => ({ id: u.id, codigo: u.codigo }))}
            criar={criarPessoaAction}
          />
        ) : null}
      </div>

      {semNenhuma ? (
        <EmptyState
          icon={<UsersIcon aria-hidden />}
          title="Nenhuma pessoa cadastrada"
          description="Cadastre o primeiro morador para os avisos terem para onde ir."
          headingLevel="h2"
        />
      ) : (
        <Card className="rounded-3xl">
          <CardContent className="grid gap-4">
            <FiltrosDePessoas
              contagens={contagens}
              filtro={filtro}
              busca={busca}
            />
            {pagina.itens.length === 0 ? (
              <EmptyState
                variant="no-results"
                icon={<SearchXIcon aria-hidden />}
                title={busca ? `Ninguém com “${busca}”` : "Ninguém aqui"}
                description="Confira o nome ou limpe o filtro."
                headingLevel="h2"
              />
            ) : (
              <ListaDePessoas pessoas={pagina.itens} />
            )}
            {pagina.proximo ? (
              <div className="flex justify-center">
                <Button asChild variant="outline" shape="pill">
                  <Link
                    href={`/gestao/pessoas?${new URLSearchParams({
                      ...(filtro ? { filtro } : {}),
                      ...(busca ? { q: busca } : {}),
                      cursor: pagina.proximo,
                    }).toString()}`}
                  >
                    Ver mais pessoas
                  </Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
