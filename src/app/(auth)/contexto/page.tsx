import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { resolveContextLanding } from "@/app/(auth)/contexto/actions";
import { ContextSelector } from "@/components/auth/context-selector";

// Depende da sessão (cookies) em toda requisição; nunca pré-renderizar no build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Selecionar contexto",
  description:
    "Escolha a organização e o empreendimento para acessar o PacoteZap.",
};

type ContextoPageProps = {
  searchParams: Promise<{ erro?: string | string[] }>;
};

export default async function ContextoPage({
  searchParams,
}: ContextoPageProps) {
  const { erro } = await searchParams;
  const landing = await resolveContextLanding();

  // Com um só empreendimento, entra direto. Se a entrada automática já falhou
  // (?erro=), mostra a lista com a mensagem em vez de tentar de novo em loop.
  if (landing.kind === "auto" && !erro) {
    redirect("/contexto/auto");
  }

  if (landing.kind === "redirect") {
    redirect(landing.href);
  }

  if (landing.kind === "unauthorized") {
    redirect(landing.href);
  }

  if (landing.kind === "no-access") {
    redirect(landing.href);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <ContextSelector
        scopes={landing.scopes}
        initialError={
          erro
            ? "Não conseguimos abrir o empreendimento sozinhos. Toque nele para tentar de novo."
            : null
        }
      />
    </main>
  );
}
