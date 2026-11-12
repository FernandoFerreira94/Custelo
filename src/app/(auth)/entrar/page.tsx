import type { Metadata } from "next";

import { ehMotivoDoLink, MENSAGEM_DO_LINK } from "@/application/auth/link-erro";
import { LoginDesktop } from "@/components/auth/login-desktop";
import type { AuthCardView } from "@/components/auth/auth-card-stage";
import { getPendingInviteForSession } from "@/infrastructure/auth/invite-service";

// Depende da sessão (cookies) em toda requisição; nunca pré-renderizar no build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Entre com a conta individual cadastrada pela administração do empreendimento.",
};

type EntrarPageProps = {
  searchParams: Promise<{
    view?: string | string[];
    link?: string | string[];
    auth_error?: string | string[];
  }>;
};

const callbackViews = new Set<AuthCardView>(["senha", "convite"]);

export default async function EntrarPage({ searchParams }: EntrarPageProps) {
  const params = await searchParams;
  const pendingInvite = await getPendingInviteForSession();
  const initialInvite = pendingInvite.ok ? pendingInvite.metadata : null;
  const requestedView = typeof params.view === "string" ? params.view : null;
  const initialView =
    requestedView && callbackViews.has(requestedView as AuthCardView)
      ? (requestedView as AuthCardView)
      : "entrar";
  const motivoDoLink = ehMotivoDoLink(params.link)
    ? params.link
    : params.auth_error === "invalid_link"
      ? "invalido"
      : null;
  const initialError = motivoDoLink ? MENSAGEM_DO_LINK[motivoDoLink] : null;

  return (
    <LoginDesktop
      initialInvite={initialInvite}
      initialView={initialView}
      initialError={initialError}
    />
  );
}
