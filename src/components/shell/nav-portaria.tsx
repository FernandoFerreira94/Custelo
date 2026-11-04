import {
  BellIcon,
  HomeIcon,
  MoreHorizontalIcon,
  PackageIcon,
  ScanLineIcon,
} from "lucide-react";
import Link from "next/link";

import { BottomBar } from "@/components/ui/bottom-bar";
import { Button } from "@/components/ui/button";

const CLASSE_ABA = "h-auto flex-col gap-1 py-2 text-xs";

// Só "Hoje" existe até a I5: as outras abas e o registrar ficam desabilitados,
// nunca um link para tela que não há.
const ABAS_ESQUERDA = [{ label: "Fila", icon: <PackageIcon aria-hidden /> }];
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
  return (
    <BottomBar
      position="fixed"
      material="glass"
      aria-label="Menu da portaria"
      role="navigation"
      className="mx-auto grid max-w-lg grid-cols-5 items-center gap-1 px-3"
    >
      <Button asChild variant="secondary" className={CLASSE_ABA}>
        <Link href="/receber" aria-current="page">
          <HomeIcon aria-hidden />
          Hoje
        </Link>
      </Button>
      {ABAS_ESQUERDA.map((a) => (
        <AbaDesabilitada key={a.label} {...a} />
      ))}
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
