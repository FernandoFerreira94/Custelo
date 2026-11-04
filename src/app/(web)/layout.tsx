import type { ReactNode } from "react";

import { exigirSuperficie } from "@/infrastructure/auth/guard-superficie";

// Sessão em toda requisição: nunca pré-renderizar.
export const dynamic = "force-dynamic";

export default async function LayoutWeb({ children }: { children: ReactNode }) {
  await exigirSuperficie("web");
  return children;
}
