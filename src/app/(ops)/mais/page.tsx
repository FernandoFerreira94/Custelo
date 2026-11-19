import { LogOutIcon } from "lucide-react";
import type { Metadata } from "next";

import { signOutAction } from "@/app/(auth)/sem-acesso/actions";
import { ContextoAtivo } from "@/components/shell/contexto-ativo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InstallButton } from "@/components/ui/install-prompt";

export const metadata: Metadata = { title: "Mais" };

/** Menu "Mais" da portaria: instalar o app na tela inicial e sair. */
export default function MaisPage() {
  async function sair() {
    "use server";
    await signOutAction();
  }
  return (
    <main className="grid gap-4 p-4">
      <h1 className="font-display text-3xl font-bold">Mais</h1>
      <ContextoAtivo />
      <Card className="rounded-3xl">
        <CardContent className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            Instalado, o PacoteZap abre mais rápido e funciona com sinal fraco.
          </p>
          <InstallButton
            appName="PacoteZap Portaria"
            shape="pill"
            size="lg"
            className="w-full"
          >
            Instalar na tela inicial
          </InstallButton>
        </CardContent>
      </Card>
      <form action={sair}>
        <Button
          type="submit"
          variant="outline"
          shape="pill"
          size="lg"
          className="w-full"
        >
          <LogOutIcon aria-hidden />
          Sair
        </Button>
      </form>
    </main>
  );
}
