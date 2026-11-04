import Link from "next/link";
import type { ReactNode } from "react";

import { PzSimbolo } from "@/components/brand/marca";
import { Button } from "@/components/ui/button";

export type ItemTrilho = {
  label: string;
  href: string;
  icon: ReactNode;
  /** Rota que ainda não existe: renderiza botão desabilitado, nunca link morto. */
  desabilitado?: boolean;
};

const CLASSE_ATIVO = "bg-brasa text-brasa-foreground hover:bg-brasa-hover";

function ItemNav({ item, ativo }: { item: ItemTrilho; ativo: boolean }) {
  const comum = {
    variant: ativo ? "default" : "outline",
    shape: "pill",
    size: "icon-lg",
    title: item.label,
    className: ativo ? CLASSE_ATIVO : undefined,
  } as const;

  if (item.desabilitado) {
    return (
      <Button {...comum} disabled aria-label={item.label}>
        {item.icon}
      </Button>
    );
  }
  return (
    <Button {...comum} asChild>
      <Link
        href={item.href}
        aria-label={item.label}
        aria-current={ativo ? "page" : undefined}
      >
        {item.icon}
      </Link>
    </Button>
  );
}

/**
 * Trilho lateral das superfícies web e admin: só ícones no meio, "Configurações"
 * no pé. Selecionado em brasa sólida; os demais em outline.
 */
export function Trilho({
  itens,
  ativo,
  label = "Menu principal",
}: {
  itens: ItemTrilho[];
  ativo: string;
  label?: string;
}) {
  const config = itens.find((i) => i.label === "Configurações");
  const meio = itens.filter((i) => i !== config);
  return (
    <nav
      aria-label={label}
      className="sticky top-6 flex h-[calc(100dvh-3rem)] max-h-full flex-col items-center justify-between gap-3 self-stretch"
    >
      <PzSimbolo className="size-11" />
      <div className="flex flex-col gap-3">
        {meio.map((item) => (
          <ItemNav key={item.label} item={item} ativo={item.label === ativo} />
        ))}
      </div>
      {config ? (
        <ItemNav item={config} ativo={config.label === ativo} />
      ) : (
        <span aria-hidden className="size-(--wc-density-control-lg)" />
      )}
    </nav>
  );
}
