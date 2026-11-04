import type { Metadata } from "next";

import { signOutAction } from "@/app/(auth)/sem-acesso/actions";
import { EntrarLayout } from "@/components/auth/entrar-layout";
import { SemAcesso } from "@/components/auth/sem-acesso";
import { getAuthenticatedSession } from "@/infrastructure/auth/session";

// Mostra o e-mail da sessão; depende de cookies em toda requisição.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sem acesso",
  description: "Sua conta não possui escopo ativo no PacoteZap.",
};

export default async function SemAcessoPage() {
  const sessao = await getAuthenticatedSession();
  return (
    <EntrarLayout>
      <main className="w-full max-w-[460px]">
        <SemAcesso
          email={sessao?.email ?? null}
          signOutAction={signOutAction}
        />
      </main>
    </EntrarLayout>
  );
}
