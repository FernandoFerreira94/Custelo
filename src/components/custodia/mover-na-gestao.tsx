"use client";

import { useRouter } from "next/navigation";

import type { Resultado } from "@/lib/resultado";

import { type LocalDto, MoverSheet, type PedidoDeMover } from "./mover-sheet";

/** Mover na gestão: folha à direita, server action e `router.refresh` depois. */
export function MoverNaGestao({
  encomendaId,
  localAtual,
  locais,
  mover,
}: {
  encomendaId: string;
  localAtual: { id: string; codigo: string } | null;
  locais: LocalDto[];
  mover: (entrada: unknown) => Promise<Resultado<unknown>>;
}) {
  const router = useRouter();
  return (
    <MoverSheet
      lado="right"
      localAtual={localAtual}
      locais={locais}
      operador="você"
      mover={(p: PedidoDeMover) => mover({ id: encomendaId, ...p })}
      aoMover={() => router.refresh()}
    />
  );
}
