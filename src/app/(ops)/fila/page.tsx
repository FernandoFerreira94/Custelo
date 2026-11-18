import type { Metadata } from "next";

import { FilaPortaria } from "@/components/custodia/fila-portaria";

export const metadata: Metadata = { title: "Fila" };

/** CUS-001 (portaria). Busca no cliente: o `(ops)` precisa funcionar como app. */
export default function FilaPage() {
  return (
    <main>
      <FilaPortaria />
    </main>
  );
}
