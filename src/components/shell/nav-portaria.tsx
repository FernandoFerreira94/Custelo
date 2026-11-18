"use client";

import {
  BellIcon,
  HomeIcon,
  MoreHorizontalIcon,
  PackageIcon,
  ScanLineIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BottomBar } from "@/components/ui/bottom-bar";
import { Button } from "@/components/ui/button";

const CLASSE_ABA = "h-auto flex-col gap-1 py-2 text-xs";

// Só aba de tela que existe vira link; as outras e o registrar ficam
// desabilitados, nunca um link para tela que não há.
const ABAS_LINK = [
  { label: "Hoje", href: "/receber", icon: <HomeIcon aria-hidden /> },
  { label: "Fila", href: "/fila", icon: <PackageIcon aria-hidden /> },
];
const ABAS_DIREITA = [
  { label: "Avisos", icon: <BellIcon aria-hidden /> },
  { label: "Mais", icon: <MoreHorizontalIcon aria-hidden /> },
];

function AbaDesabilitada({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      disabled
      className={`${CLASSE_ABA} text-muted-foreground disabled:opacity-60`}
    >
      {icon}
      {label}
    </Button>
  );
}

/** Barra inferior da portaria (ops): 4 abas e o registrar no centro. */
export function NavPortaria() {
  const pathname = usePathname();
  // O detalhe da encomenda é parte da fila.
  const ativa = pathname.startsWith("/encomendas") ? "/fila" : pathname;
  return (
    <BottomBar
      position="fixed"
      material="glass"
      aria-label="Menu da portaria"
      role="navigation"
      className="mx-auto grid max-w-lg grid-cols-5 items-center gap-1 px-3"
    >
      {ABAS_LINK.map((a) => {
        const atual = ativa === a.href || ativa.startsWith(`${a.href}/`);
        return (
          <Button
            key={a.href}
            asChild
            variant={atual ? "secondary" : "ghost"}
            className={CLASSE_ABA}
          >
            <Link href={a.href} aria-current={atual ? "page" : undefined}>
              {a.icon}
              {a.label}
            </Link>
          </Button>
        );
      })}
      <Button
        shape="pill"
        size="icon-lg"
        variant="elevated"
        aria-label="Registrar encomenda"
        disabled
        className="mx-auto"
      >
        <ScanLineIcon aria-hidden />
      </Button>
      {ABAS_DIREITA.map((a) => (
        <AbaDesabilitada key={a.label} {...a} />
      ))}
    </BottomBar>
  );
}
