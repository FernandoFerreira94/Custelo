import { LayersIcon } from "lucide-react";
import type { Metadata } from "next";

import { pode } from "@/application/permissoes";
import { ArvoreEstrutura } from "@/components/estrutura/arvore-estrutura";
import { BannerSemContato } from "@/components/estrutura/banner-sem-contato";
import { GerarUnidadesSheet } from "@/components/estrutura/gerar-unidades-sheet";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";

import { gerarUnidadesAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Estrutura" };

/** UNI-001: blocos, andares e unidades. É o primeiro filtro de toda encomenda. */
export default async function EstruturaPage() {
  const ctx = await contextoDaSessao();
  if (!ctx.ok || !pode(ctx.data.papel, "cadastro.ler")) {
    return <SemPermissao voltarPara="/gestao" />;
  }
  const podeEditar = pode(ctx.data.papel, "cadastro.editar");
  const [areas, unidades] = await Promise.all([
    estruturaRepo.arvore(ctx.data),
    estruturaRepo.resumoDeUnidades(ctx.data),
  ]);
  const vazio = areas.length === 0 && unidades.length === 0;
  const semContato = unidades.filter((u) => u.semContato).length;

  return (
    <main className="grid content-start gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Estrutura</h1>
          <p className="text-muted-foreground">
            Blocos, andares e unidades. É o primeiro filtro de toda encomenda.
          </p>
        </div>
        {podeEditar && !vazio ? (
          <GerarUnidadesSheet gerar={gerarUnidadesAction} />
        ) : null}
      </div>

      {vazio ? (
        <EmptyState
          icon={<LayersIcon aria-hidden />}
          title="Monte a estrutura do condomínio"
          description="Cadastre os blocos e as unidades para a portaria saber para onde vai cada encomenda."
          headingLevel="h2"
          action={
            podeEditar ? (
              <GerarUnidadesSheet
                gerar={gerarUnidadesAction}
                gatilho={<Button shape="pill">Gerar blocos e unidades</Button>}
              />
            ) : undefined
          }
        />
      ) : (
        <>
          <BannerSemContato total={semContato} />
          <Card className="rounded-3xl">
            <CardContent>
              <ArvoreEstrutura areas={areas} unidades={unidades} />
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
