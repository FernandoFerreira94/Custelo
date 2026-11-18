import {
  AlertTriangleIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  CircleHelpIcon,
  ClockIcon,
  CornerUpLeftIcon,
  PackageIcon,
  TimerIcon,
  XCircleIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { Badge as Situacao } from "@/domain/custodia/situacao";

/** Mapa da prancha (`pz-dash/painel.tsx · ESTADOS`) + Cancelada, que a prancha não tem. */
export const ESTADOS: Record<
  Situacao,
  {
    label: string;
    variant: ComponentProps<typeof Badge>["variant"];
    icon: ReactNode;
  }
> = {
  recebida: {
    label: "Recebida",
    variant: "soft",
    icon: <PackageIcon aria-hidden />,
  },
  aguardando: {
    label: "Aguardando aviso",
    variant: "warning",
    icon: <ClockIcon aria-hidden />,
  },
  naoIdent: {
    label: "Não identificada",
    variant: "outline",
    icon: <CircleHelpIcon aria-hidden />,
  },
  falha: {
    label: "Falha no aviso",
    variant: "danger",
    icon: <AlertTriangleIcon aria-hidden />,
  },
  urgente: {
    label: "Prazo estourado",
    variant: "danger",
    icon: <TimerIcon aria-hidden />,
  },
  pronta: {
    label: "Pronta p/ retirada",
    variant: "success",
    icon: <CheckCircle2Icon aria-hidden />,
  },
  retirada: {
    label: "Retirada",
    variant: "secondary",
    icon: <CheckCheckIcon aria-hidden />,
  },
  devolvida: {
    label: "Devolvida",
    variant: "secondary",
    icon: <CornerUpLeftIcon aria-hidden />,
  },
  cancelada: {
    label: "Cancelada",
    variant: "secondary",
    icon: <XCircleIcon aria-hidden />,
  },
};

/** Estado nunca só por cor: rótulo e ícone sempre aparecem. */
export function EstadoBadge({ estado }: { estado: Situacao }) {
  const e = ESTADOS[estado];
  return (
    <Badge variant={e.variant}>
      {e.icon}
      {e.label}
    </Badge>
  );
}
