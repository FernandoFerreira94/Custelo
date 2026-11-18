"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BottomBar } from "@/components/ui/bottom-bar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { ItemTrilho } from "./trilho";

const ABA =
  "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring [&_svg]:size-5";
const ROTULO = "max-w-full overflow-hidden text-ellipsis whitespace-nowrap";

/** Até 5 abas cabem em 390 px; com mais, as últimas vão para "Mais". */
const NA_BARRA = 4;

function Aba({ item, ativo }: { item: ItemTrilho; ativo: boolean }) {
  if (item.desabilitado)
    return (
      <button
        type="button"
        disabled
        className={cn(ABA, "text-muted-foreground opacity-60")}
      >
        {item.icon}
        <span className={ROTULO}>{item.label}</span>
      </button>
    );
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        ABA,
        ativo ? "bg-accent text-foreground" : "text-muted-foreground",
      )}
    >
      {item.icon}
      <span className={ROTULO}>{item.label}</span>
    </Link>
  );
}

/**
 * Navegação da gestão abaixo de `md` (relatório UX 12/11, P0): barra inferior
 * sólida no lugar do trilho, que roubava ~80 px e cortava as telas.
 */
export function BarraWeb({
  itens,
  ativo,
  label = "Menu principal",
}: {
  itens: ItemTrilho[];
  ativo: string;
  label?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const cabe = itens.length <= NA_BARRA + 1;
  const naBarra = cabe ? itens : itens.slice(0, NA_BARRA);
  const noMais = cabe ? [] : itens.slice(NA_BARRA);
  const maisAtivo = noMais.some((i) => i.label === ativo);

  return (
    <BottomBar
      position="fixed"
      keyboard="hide"
      role="navigation"
      aria-label={label}
      className="gap-1 px-2 md:hidden"
    >
      {naBarra.map((item) => (
        <Aba key={item.label} item={item} ativo={item.label === ativo} />
      ))}
      {noMais.length > 0 ? (
        <Sheet open={aberto} onOpenChange={setAberto}>
          <SheetTrigger asChild>
            <button
              type="button"
              className={cn(
                ABA,
                maisAtivo
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <MenuIcon aria-hidden />
              Mais
            </button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Mais</SheetTitle>
            </SheetHeader>
            <ul className="grid gap-1 px-4 pb-6">
              {noMais.map((item) => (
                <li key={item.label}>
                  {item.desabilitado ? (
                    <span className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-muted-foreground opacity-60 [&_svg]:size-5">
                      {item.icon}
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setAberto(false)}
                      aria-current={item.label === ativo ? "page" : undefined}
                      className="flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-solid aria-[current=page]:bg-accent [&_svg]:size-5"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      ) : null}
    </BottomBar>
  );
}
