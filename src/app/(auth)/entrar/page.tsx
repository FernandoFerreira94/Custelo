import type { Metadata } from "next";

import { LoginDesktop } from "@/components/auth/login-desktop";
import { getPendingInviteForSession } from "@/infrastructure/auth/invite-service";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Entre com a conta individual cadastrada pela administração do empreendimento.",
};

export default async function EntrarPage() {
  const pendingInvite = await getPendingInviteForSession();
  const initialInvite = pendingInvite.ok ? pendingInvite.metadata : null;

  return <LoginDesktop initialInvite={initialInvite} />;
}
