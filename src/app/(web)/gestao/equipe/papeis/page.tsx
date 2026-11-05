import { ShieldCheckIcon } from "lucide-react";
import type { Metadata } from "next";

import {
  GRUPOS_DE_PERMISSAO,
  PAPEIS_DA_MATRIZ,
  ROTULO_PAPEL,
  ROTULO_PERMISSAO,
} from "@/application/equipe/rotulos";
import { PERMISSOES, pode } from "@/application/permissoes";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MatrizDePapeis } from "@/components/equipe/matriz-de-papeis";
import type {
  Grants,
  PermissionGroup,
  Role,
} from "@/components/ui/permission-matrix";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Papéis e permissões" };

const PAPEIS: Role[] = PAPEIS_DA_MATRIZ.map((id) => ({
  id,
  label: ROTULO_PAPEL[id],
  locked: true,
}));

const GRUPOS: PermissionGroup[] = GRUPOS_DE_PERMISSAO.map((g) => ({
  id: g.titulo,
  label: g.titulo,
  permissions: g.permissoes.map((p) => ({ id: p, label: ROTULO_PERMISSAO[p] })),
}));

// A matriz é a própria regra: lê PERMISSOES, nunca uma cópia.
const CONCEDIDO: Grants = Object.fromEntries(
  PAPEIS_DA_MATRIZ.map((papel) => [
    papel,
    (Object.keys(PERMISSOES) as (keyof typeof PERMISSOES)[]).filter((p) =>
      pode(papel, p),
    ),
  ]),
);

const REGRAS_FIXAS = [
  "Ninguém apaga evidência: foto, assinatura ou registro.",
  "Correção pede motivo e fica na auditoria.",
  "O gestor não perde acesso à auditoria.",
];

/** USR-002: só leitura. O banco recusa o que a regra não libera. */
export default async function PapeisPage() {
  const ctx = await contextoDaSessao();
  if (!ctx.ok || !pode(ctx.data.papel, "cadastro.ler")) {
    return <SemPermissao voltarPara="/gestao" />;
  }

  return (
    <main className="grid content-start gap-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Papéis e permissões</h1>
        <p className="text-muted-foreground">
          O que cada papel pode fazer. O banco recusa o que a regra não liberar.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="rounded-3xl">
          <CardContent>
            <MatrizDePapeis
              papeis={PAPEIS}
              grupos={GRUPOS}
              concedido={CONCEDIDO}
            />
          </CardContent>
        </Card>
        <Card className="self-start rounded-3xl">
          <CardHeader>
            <CardTitle>Regras fixas</CardTitle>
            <CardDescription>Não mudam por papel.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {REGRAS_FIXAS.map((t) => (
              <p key={t} className="flex gap-2">
                <ShieldCheckIcon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-success"
                />
                {t}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
