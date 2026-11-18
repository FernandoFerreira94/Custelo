"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { BarraWeb } from "@/components/shell/barra-web";
import { Trilho, type ItemTrilho } from "@/components/shell/trilho";

/** Item cujo href é o prefixo mais longo da rota atual. */
function itemAtivo(itens: ItemTrilho[], pathname: string): string {
  const casa = itens.filter(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
  );
  casa.sort((a, b) => b.href.length - a.href.length);
  return casa[0]?.label ?? "";
}

/**
 * Casca web/admin. Trilho a partir de `md`; abaixo, barra inferior. O conteúdo
 * não leva `overflow-hidden`: tabela e matriz precisam do próprio scroll
 * (relatório UX 12/11, P0).
 */
export function CascaWeb({
  itens,
  children,
}: {
  itens: ItemTrilho[];
  children: ReactNode;
}) {
  const ativo = itemAtivo(itens, usePathname());
  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[auto_minmax(0,1fr)] md:gap-6 md:p-6">
      <Trilho itens={itens} ativo={ativo} className="hidden md:flex" />
      <div className="relative min-w-0 px-4 pt-4 pb-28 md:p-0">{children}</div>
      <BarraWeb itens={itens} ativo={ativo} />
    </div>
  );
}
