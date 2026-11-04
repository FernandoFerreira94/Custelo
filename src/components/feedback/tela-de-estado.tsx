import type { ReactNode } from "react";

import { PzMarca } from "@/components/brand/marca";
import { Card, CardContent } from "@/components/ui/card";
import { Result } from "@/components/ui/result";

type Status = "404" | "403" | "500" | "warning" | "info";

/** Tela cheia de erro, página não encontrada e sem permissão (prancha #estados). */
export function TelaDeEstado({
  status,
  titulo,
  descricao,
  codigo,
  acoes,
}: {
  status: Status;
  titulo: string;
  descricao: string;
  codigo?: string;
  acoes: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-6">
      <PzMarca texto="text-xl" />
      <Card
        role={status === "500" || status === "warning" ? "alert" : undefined}
        className="w-full max-w-lg rounded-3xl py-0"
      >
        <CardContent>
          <Result
            status={status}
            headingLevel={1}
            title={titulo}
            description={
              codigo ? (
                <>
                  {descricao} Código:{" "}
                  <span className="font-mono">{codigo}</span>
                </>
              ) : (
                descricao
              )
            }
            extra={acoes}
          />
        </CardContent>
      </Card>
    </main>
  );
}
