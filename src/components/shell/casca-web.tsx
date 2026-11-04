"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Trilho, type ItemTrilho } from "@/components/shell/trilho";

/** Item cujo href é o prefixo mais longo da rota atual. */
function itemAtivo(itens: ItemTrilho[], pathname: string): string {
  const casa = itens.filter(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
  );
  casa.sort((a, b) => b.href.length - a.href.length);
  return casa[0]?.label ?? "";
}

export function CascaWeb({
  itens,
  children,
}: {
  itens: ItemTrilho[];
  children: ReactNode;
}) {
  const ativo = itemAtivo(itens, usePathname());
  return (
    <div className="grid min-h-dvh grid-cols-[auto_1fr] gap-6 bg-background p-6">
      <Trilho itens={itens} ativo={ativo} />
      <div className="relative min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}
