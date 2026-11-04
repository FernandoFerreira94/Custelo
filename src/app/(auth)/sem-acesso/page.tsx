import type { Metadata } from "next";
import Link from "next/link";

import { signOutAction } from "@/app/(auth)/sem-acesso/actions";
import { PzMarca } from "@/components/brand/marca";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sem acesso",
  description: "Sua conta não possui escopo ativo no PacoteZap.",
};

export default function SemAcessoPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-[420px] font-sans shadow-[var(--shadow-elevation-3)]">
        <CardHeader>
          <PzMarca texto="text-xl" />
          <CardTitle className="font-sans text-2xl font-semibold tracking-tight">
            <h1 className="contents">Sem acesso</h1>
          </CardTitle>
          <CardDescription>
            Sua conta não tem permissão ativa em nenhum empreendimento.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-sm text-muted-foreground">
          <p>
            Peça à administração do condomínio para revisar seu cadastro ou
            convite. Se acredita que isto é um erro, entre em contato com o
            suporte da sua organização.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 bg-muted">
          <form action={signOutAction} className="w-full">
            <Button
              type="submit"
              className="h-12 min-h-[var(--size-touch-primary)] w-full"
            >
              Sair
            </Button>
          </form>
          <Button
            asChild
            variant="link"
            className="h-auto min-h-[var(--size-touch-min)] w-full underline"
          >
            <Link href="/entrar">Voltar para entrar</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
