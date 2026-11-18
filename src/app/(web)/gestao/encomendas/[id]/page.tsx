import { ChevronLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetalheEncomenda } from "@/components/custodia/detalhe-encomenda";
import { MoverNaGestao } from "@/components/custodia/mover-na-gestao";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import { Button } from "@/components/ui/button";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { visaoDoDetalhe } from "@/infrastructure/custodia/visao-detalhe";

import { moverEncomendaAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Encomenda" };

/** CUS-002/003 da gestão: card à esquerda e linha do tempo à direita em 1024+. */
export default async function EncomendaGestaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return <SemPermissao voltarPara="/gestao" />;
  const { id } = await params;
  const v = await visaoDoDetalhe(ctx.data, id);
  if (!v.ok) {
    if (v.codigo === "SEM_PERMISSAO")
      return <SemPermissao voltarPara="/gestao" />;
    notFound();
  }
  const { detalhe, linha, locais } = v.data;

  return (
    <main className="grid content-start gap-6">
      <div className="grid gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="justify-self-start"
        >
          <Link href="/gestao/encomendas">
            <ChevronLeftIcon aria-hidden />
            Encomendas
          </Link>
        </Button>
        <h1 className="font-display text-4xl font-bold">
          {detalhe.unidade?.codigo ?? "Sem unidade"}
        </h1>
      </div>
      <DetalheEncomenda
        d={detalhe}
        linha={linha}
        agora={new Date()}
        hrefDe={(o) => `/gestao/encomendas/${o}`}
        acoes={
          locais ? (
            <MoverNaGestao
              encomendaId={detalhe.id}
              localAtual={detalhe.local}
              locais={locais}
              mover={moverEncomendaAction}
            />
          ) : undefined
        }
      />
    </main>
  );
}
