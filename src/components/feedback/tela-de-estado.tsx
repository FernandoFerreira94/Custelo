import type { ReactNode } from "react";

import { PacoteZapMark } from "@/components/brand/pacotezap-mark";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Tela cheia para erro, página não encontrada e falhas de carregamento. */
export function TelaDeEstado({
  titulo,
  descricao,
  detalhe,
  acoes,
}: {
  titulo: string;
  descricao: string;
  detalhe?: ReactNode;
  acoes: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card
        role="alert"
        className="w-full max-w-[420px] font-sans shadow-[var(--shadow-elevation-3)]"
      >
        <CardHeader>
          <PacoteZapMark showIcon={false} textClassName="text-xl" />
          <CardTitle className="font-sans text-2xl font-semibold tracking-tight">
            <h1 className="contents">{titulo}</h1>
          </CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        {detalhe ? (
          <CardContent className="text-sm text-muted-foreground">
            {detalhe}
          </CardContent>
        ) : null}
        <CardFooter className="flex flex-col gap-3 bg-muted">
          {acoes}
        </CardFooter>
      </Card>
    </main>
  );
}
