import {
  Building2Icon,
  HomeIcon,
  LayersIcon,
  SettingsIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { CascaWeb } from "@/components/shell/casca-web";
import type { ItemTrilho } from "@/components/shell/trilho";
import { exigirSuperficie } from "@/infrastructure/auth/guard-superficie";

// Sessão em toda requisição: nunca pré-renderizar.
export const dynamic = "force-dynamic";

// Só rotas que existem; o resto entra com a sua tela.
const ITENS_WEB: ItemTrilho[] = [
  { label: "Hoje", href: "/gestao", icon: <HomeIcon aria-hidden /> },
  {
    label: "Estrutura",
    href: "/gestao/estrutura",
    icon: <LayersIcon aria-hidden />,
  },
  {
    label: "Unidades",
    href: "/gestao/unidades",
    icon: <Building2Icon aria-hidden />,
  },
  {
    label: "Pessoas",
    href: "/gestao/pessoas",
    icon: <UsersRoundIcon aria-hidden />,
  },
  { label: "Equipe", href: "/gestao/equipe", icon: <UsersIcon aria-hidden /> },
  {
    label: "Configurações",
    href: "/gestao/config",
    icon: <SettingsIcon aria-hidden />,
    desabilitado: true,
  },
];

export default async function LayoutWeb({ children }: { children: ReactNode }) {
  await exigirSuperficie("web");
  return <CascaWeb itens={ITENS_WEB}>{children}</CascaWeb>;
}
