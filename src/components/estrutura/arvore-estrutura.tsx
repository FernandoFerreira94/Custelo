"use client";

import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { useMemo, useState } from "react";

import type { NoArvore, UnidadeNaArvore } from "@/application/estrutura/ports";
import { PainelUnidade } from "@/components/estrutura/painel-unidade";
import { Badge } from "@/components/ui/badge";
import { type TreeNode, TreeView } from "@/components/ui/tree-view";

const PREFIXO_UNIDADE = "u:";

function seloDaUnidade(u: UnidadeNaArvore) {
  if (u.semContato) {
    return (
      <Badge variant="warning">
        <AlertTriangleIcon aria-hidden />
        Sem contato
      </Badge>
    );
  }
  const n = u.moradores.length;
  return (
    <Badge variant="success">
      <CheckCircle2Icon aria-hidden />
      {n === 1 ? "1 morador" : `${n} moradores`}
    </Badge>
  );
}

/** Unidades ativas da área e de todas as áreas dentro dela. */
export function totalDaArea(a: NoArvore): number {
  return a.unidadesAtivas + a.filhos.reduce((n, f) => n + totalDaArea(f), 0);
}

/** Monta os nós do TreeView: áreas (com filhas) e, dentro delas, as unidades. */
export function montarNos(
  areas: NoArvore[],
  unidades: UnidadeNaArvore[],
): TreeNode[] {
  const porArea = new Map<string | null, UnidadeNaArvore[]>();
  for (const u of unidades) {
    const lista = porArea.get(u.areaId) ?? [];
    lista.push(u);
    porArea.set(u.areaId, lista);
  }
  const folha = (u: UnidadeNaArvore): TreeNode => ({
    id: `${PREFIXO_UNIDADE}${u.id}`,
    label: u.codigo,
    textValue: u.codigo,
    end: seloDaUnidade(u),
  });
  const no = (a: NoArvore): TreeNode => ({
    id: a.id,
    label: a.nome,
    textValue: a.nome,
    end: (
      <span className="text-xs text-muted-foreground">
        {totalDaArea(a)} un.
      </span>
    ),
    children: [...a.filhos.map(no), ...(porArea.get(a.id) ?? []).map(folha)],
  });
  return [...areas.map(no), ...(porArea.get(null) ?? []).map(folha)];
}

function caminhoDaArea(
  areas: NoArvore[],
  areaId: string | null,
): string | null {
  if (!areaId) return null;
  const achar = (nos: NoArvore[], trilha: string[]): string[] | null => {
    for (const n of nos) {
      const atual = [...trilha, n.nome];
      if (n.id === areaId) return atual;
      const dentro = achar(n.filhos, atual);
      if (dentro) return dentro;
    }
    return null;
  };
  return achar(areas, [])?.join(" · ") ?? null;
}

/** UNI-001: a árvore do condomínio e o painel da unidade escolhida. */
export function ArvoreEstrutura({
  areas,
  unidades,
}: {
  areas: NoArvore[];
  unidades: UnidadeNaArvore[];
}) {
  const nos = useMemo(() => montarNos(areas, unidades), [areas, unidades]);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const unidade = selecionado?.startsWith(PREFIXO_UNIDADE)
    ? unidades.find((u) => `${PREFIXO_UNIDADE}${u.id}` === selecionado)
    : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <TreeView
        aria-label="Estrutura do condomínio"
        data={nos}
        guides
        defaultExpanded={areas.map((a) => a.id)}
        selected={selecionado}
        onSelectedChange={(id) => setSelecionado(id)}
      />
      <div className="grid content-start gap-6">
        {unidade ? (
          <PainelUnidade
            unidade={unidade}
            area={caminhoDaArea(areas, unidade.areaId)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Escolha uma unidade na árvore para ver quem mora e como ela aparece
            na etiqueta.
          </p>
        )}
      </div>
    </div>
  );
}
