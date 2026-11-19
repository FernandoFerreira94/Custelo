import type { ReactNode } from "react";

import { RegistrarSw } from "@/components/ops/registrar-sw";
import { ProvedorDeConsultas } from "@/components/providers/consultas";
import { NavPortaria } from "@/components/shell/nav-portaria";
import { exigirSuperficie } from "@/infrastructure/auth/guard-superficie";

// Sessão em toda requisição: nunca pré-renderizar.
export const dynamic = "force-dynamic";

export default async function LayoutOps({ children }: { children: ReactNode }) {
  await exigirSuperficie("ops");
  return (
    <ProvedorDeConsultas>
      <div className="min-h-dvh bg-muted pb-28">
        {children}
        <NavPortaria />
        <RegistrarSw />
      </div>
    </ProvedorDeConsultas>
  );
}
