import { KeyRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { pode } from "@/application/permissoes";
import { ConvidarFuncionario } from "@/components/equipe/convidar-funcionario";
import { ListaEquipe } from "@/components/equipe/lista-equipe";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { listarEquipe } from "@/infrastructure/auth/equipe-repo";

import { convidarAction } from "./actions";
import { desativarAction } from "./desativar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Equipe" };

/** USR-001 + USR-003. Auditor vê a lista, sem as ações. */
export default async function EquipePage() {
  const ctx = await contextoDaSessao();
  if (!ctx.ok || !pode(ctx.data.papel, "cadastro.ler")) {
    return <SemPermissao voltarPara="/gestao" />;
  }
  const podeGerir = pode(ctx.data.papel, "equipe.gerir");
  const membros = await listarEquipe(ctx.data);

  return (
    <main className="grid content-start gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Equipe</h1>
          <p className="text-muted-foreground">
            Quem acessa este empreendimento e o que pode fazer. Cada pessoa tem
            conta própria.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" shape="pill">
            <Link href="/gestao/equipe/papeis">
              <KeyRoundIcon aria-hidden />
              Papéis e permissões
            </Link>
          </Button>
          {podeGerir ? <ConvidarFuncionario convidar={convidarAction} /> : null}
        </div>
      </div>
      <Card className="rounded-3xl">
        <CardContent>
          <ListaEquipe
            membros={membros}
            usuarioAtualId={ctx.data.usuarioId}
            desativar={podeGerir ? desativarAction : undefined}
          />
        </CardContent>
      </Card>
    </main>
  );
}
