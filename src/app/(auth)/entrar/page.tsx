import type { Metadata } from "next";

import { LoginDesktop } from "@/components/auth/login-desktop";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Entre com a conta individual cadastrada pela administração do empreendimento.",
};

export default function EntrarPage() {
  return <LoginDesktop />;
}
