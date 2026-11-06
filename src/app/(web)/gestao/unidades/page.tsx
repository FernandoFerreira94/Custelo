import { Building2Icon, SearchXIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { pode } from "@/application/permissoes";
import {
  FiltrosDeUnidades,
  type FiltroAtivo,
} from "@/components/estrutura/filtros-de-unidades";
import { ListaDeUnidades } from "@/components/estrutura/lista-de-unidades";
import { UnidadeSheet } from "@/components/estrutura/unidade-sheet";
import { BotaoImportar } from "@/components/importacao/botao-importar";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";

import {
  criarUnidadeAction,
  desativarUnidadeAction,
  editarUnidadeAction,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Unidades" };

type Parametros = {
  filtro?: string;
  q?: string;
  cursor?: string;
  semContato?: string;
};

function filtroDaUrl(p: Parametros): FiltroAtivo {
  if (p.semContato === "1" || p.filtro === "semContato") return "semContato";
  if (p.filtro === "areasComuns" || p.filtro === "inativas") return p.filtro;
  return null;
}

/** UNI-002: lista paginada de unidades, com filtros, busca e cadastro. */
export default async function UnidadesPage({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok || !pode(ctx.data.papel, "cadastro.ler")) {
    return <SemPermissao voltarPara="/gestao" />;
  }
  const podeEditar = pode(ctx.data.papel, "cadastro.editar");
  const podeImportar = pode(ctx.data.papel, "importacao.executar");
  const parametros = await searchParams;
  const filtro = filtroDaUrl(parametros);
  const busca = parametros.q?.trim() ?? "";

  const [contagens, pagina] = await Promise.all([
    estruturaRepo.contagensDeUnidades(ctx.data),
    estruturaRepo.listarUnidades(ctx.data, {
      busca: busca || undefined,
      semContato: filtro === "semContato",
      tipo: filtro === "areasComuns" ? "area_comum" : undefined,
      inativas: filtro === "inativas",
      cursor: parametros.cursor,
    }),
  ]);
  const semNenhuma =
    contagens.todas === 0 && contagens.inativas === 0 && !busca && !filtro;

  return (
    <main className="grid content-start gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Unidades</h1>
          <p className="text-muted-foreground">
            Cada encomenda tem uma unidade de destino. O código é como ela
            aparece na portaria.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {podeImportar ? <BotaoImportar slug="unidades" /> : null}
          {podeEditar ? <UnidadeSheet salvar={criarUnidadeAction} /> : null}
        </div>
      </div>

      {semNenhuma ? (
        <EmptyState
          icon={<Building2Icon aria-hidden />}
          title="Nenhuma unidade cadastrada"
          description="Gere blocos e unidades de uma vez ou cadastre uma por uma."
          headingLevel="h2"
          action={
            <Button asChild shape="pill">
              <Link href="/gestao/estrutura">Gerar blocos e unidades</Link>
            </Button>
          }
        />
      ) : (
        <Card className="rounded-3xl">
          <CardContent className="grid gap-4">
            <FiltrosDeUnidades
              contagens={contagens}
              filtro={filtro}
              busca={busca}
            />
            {pagina.itens.length === 0 ? (
              <EmptyState
                variant="no-results"
                icon={<SearchXIcon aria-hidden />}
                title={
                  busca
                    ? `Nenhuma unidade com “${busca}”`
                    : "Nenhuma unidade aqui"
                }
                description="Confira o código ou o apelido, ou limpe o filtro."
                headingLevel="h2"
              />
            ) : (
              <ListaDeUnidades
                unidades={pagina.itens}
                editar={podeEditar ? editarUnidadeAction : undefined}
                desativar={podeEditar ? desativarUnidadeAction : undefined}
              />
            )}
            {pagina.proximo ? (
              <div className="flex justify-center">
                <Button asChild variant="outline" shape="pill">
                  <Link
                    href={`/gestao/unidades?${new URLSearchParams({
                      ...(filtro ? { filtro } : {}),
                      ...(busca ? { q: busca } : {}),
                      cursor: pagina.proximo,
                    }).toString()}`}
                  >
                    Ver mais unidades
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
