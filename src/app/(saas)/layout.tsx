import { HomeIcon } from "lucide-react";
import type { ReactNode } from "react";

import { CascaWeb } from "@/components/shell/casca-web";
import type { ItemTrilho } from "@/components/shell/trilho";
import { exigirSuperficie } from "@/infrastructure/auth/guard-superficie";

// Sessão em toda requisição: nunca pré-renderizar.
export const dynamic = "force-dynamic";

const ITENS_SAAS: ItemTrilho[] = [
  { label: "Hoje", href: "/plataforma", icon: <HomeIcon aria-hidden /> },
];

export default async function LayoutSaas({
  children,
}: {
  children: ReactNode;
}) {
  await exigirSuperficie("saas");
  return <CascaWeb itens={ITENS_SAAS}>{children}</CascaWeb>;
}
