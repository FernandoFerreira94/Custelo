import { PackageIcon, SearchXIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";

import { contadores, listaEncomendas } from "@/application/custodia/consultas";
import { pode } from "@/application/permissoes";
import {
  FiltrosDeEncomendas,
  urlDaListaDeEncomendas,
} from "@/components/custodia/filtros-de-encomendas";
import { ListaDeEncomendas } from "@/components/custodia/lista-de-encomendas";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { consultasCustodiaRepo } from "@/infrastructure/custodia/custodia-repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Encomendas" };

const dia = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);
/** Parâmetro inválido na URL é ignorado (volta para o padrão), nunca quebra a tela. */
const esquema = z.object({
  filtro: z
    .enum(["prontas", "falha", "prazo", "naoIdent"])
    .optional()
    .catch(undefined),
  q: z.string().trim().max(60).optional().catch(undefined),
  de: dia,
  ate: dia,
  cursor: z.string().max(200).optional().catch(undefined),
});

// Dia inteiro no fuso do empreendimento (São Paulo, sem horário de verão desde 2019).
const inicioDoDia = (d: string) => new Date(`${d}T00:00:00-03:00`);
const fimDoDia = (d: string) => new Date(inicioDoDia(d).getTime() + 86_400_000);

/** CUS-001 da gestão: todas as encomendas, com filtros, período e paginação. */
export default async function EncomendasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok || !pode(ctx.data.papel, "custodia.ler"))
    return <SemPermissao voltarPara="/gestao" />;

  const p = esquema.parse(await searchParams);
  const deps = { repo: consultasCustodiaRepo, agora: () => new Date() };
  const [conta, pagina] = await Promise.all([
    contadores(ctx.data, deps),
    listaEncomendas(
      ctx.data,
      {
        filtro: p.filtro,
        busca: p.q,
        de: p.de ? inicioDoDia(p.de) : undefined,
        ate: p.ate ? fimDoDia(p.ate) : undefined,
        cursor: p.cursor,
      },
      deps,
    ),
  ]);
  if (!conta.ok || !pagina.ok) return <SemPermissao voltarPara="/gestao" />;

  const filtrando = Boolean(p.filtro || p.q || p.de || p.ate);
  const { cursor: _c, ...atual } = p;

  return (
    <main className="grid content-start gap-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Encomendas</h1>
        <p className="text-muted-foreground">
          Tudo o que passou pela portaria, da chegada à retirada.
        </p>
      </div>
      <Card className="rounded-3xl">
        <CardContent className="grid gap-4">
          <FiltrosDeEncomendas contadores={conta.data} atual={atual} />
          {pagina.data.itens.length === 0 ? (
            filtrando ? (
              <EmptyState
                variant="no-results"
                icon={<SearchXIcon aria-hidden />}
                title={
                  p.q
                    ? `Nenhuma encomenda com "${p.q}".`
                    : "Nenhuma encomenda neste filtro."
                }
                description="Confira o número ou limpe a busca."
                action={
                  <Button asChild variant="outline" shape="pill">
                    <Link href="/gestao/encomendas">Limpar</Link>
                  </Button>
                }
                headingLevel="h2"
              />
            ) : (
              <EmptyState
                icon={<PackageIcon aria-hidden />}
                title="Nenhuma encomenda na portaria agora."
                description="Quando a portaria registrar uma encomenda, ela aparece aqui."
                headingLevel="h2"
              />
            )
          ) : (
            <ListaDeEncomendas itens={pagina.data.itens} />
          )}
          {pagina.data.proximo ? (
            <div className="flex justify-center">
              <Button asChild variant="outline" shape="pill">
                <Link
                  href={urlDaListaDeEncomendas({
                    ...atual,
                    cursor: pagina.data.proximo,
                  })}
                >
                  Ver mais antigas
                </Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
