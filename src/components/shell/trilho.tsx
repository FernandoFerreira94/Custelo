import Link from "next/link";
import type { ReactNode } from "react";

import { PzSimbolo } from "@/components/brand/marca";
import { cn } from "@/lib/utils";

export type ItemTrilho = {
  label: string;
  href: string;
  icon: ReactNode;
  /** Rota que ainda não existe: renderiza botão desabilitado, nunca link morto. */
  desabilitado?: boolean;
};

const ITEM =
  "group/item flex w-20 flex-col items-center gap-1 rounded-2xl py-1 text-center text-xs font-medium focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring";
const BOLHA =
  "grid size-11 place-items-center rounded-full border transition-colors duration-(--wc-motion-duration-fast) [&_svg]:size-5";

function ItemNav({ item, ativo }: { item: ItemTrilho; ativo: boolean }) {
  const bolha = (
    <span
      aria-hidden
      className={cn(
        BOLHA,
        ativo
          ? "border-transparent bg-brasa text-brasa-foreground"
          : "bg-card text-foreground group-hover/item:bg-accent",
      )}
    >
      {item.icon}
    </span>
  );

  if (item.desabilitado) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          ITEM,
          "cursor-not-allowed text-muted-foreground opacity-60",
        )}
      >
        {bolha}
        {item.label}
      </button>
    );
  }
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={cn(ITEM, ativo ? "text-foreground" : "text-muted-foreground")}
    >
      {bolha}
      {item.label}
    </Link>
  );
}

/**
 * Trilho lateral das superfícies web e admin a partir de `md`: ícone com o rótulo
 * embaixo (relatório UX 12/11), "Configurações" no pé. Selecionado em brasa sólida.
 */
export function Trilho({
  itens,
  ativo,
  label = "Menu principal",
  className,
}: {
  itens: ItemTrilho[];
  ativo: string;
  label?: string;
  className?: string;
}) {
  const config = itens.find((i) => i.label === "Configurações");
  const meio = itens.filter((i) => i !== config);
  return (
    <nav
      aria-label={label}
      className={cn(
        "sticky top-6 flex h-[calc(100dvh-3rem)] max-h-full flex-col items-center justify-between gap-3 self-start overflow-y-auto",
        className,
      )}
    >
      <PzSimbolo className="size-11 shrink-0" />
      <div className="flex flex-col gap-2">
        {meio.map((item) => (
          <ItemNav key={item.label} item={item} ativo={item.label === ativo} />
        ))}
      </div>
      {config ? (
        <ItemNav item={config} ativo={config.label === ativo} />
      ) : (
        <span aria-hidden className="size-11" />
      )}
    </nav>
  );
}
