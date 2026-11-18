import type { Metadata } from "next";

import { DetalhePortaria } from "@/components/custodia/detalhe-portaria";

export const metadata: Metadata = { title: "Encomenda" };

/** CUS-002/003 (portaria). O id é só um localizador: a API confere o tenant. */
export default async function EncomendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main>
      <DetalhePortaria id={id} />
    </main>
  );
}
