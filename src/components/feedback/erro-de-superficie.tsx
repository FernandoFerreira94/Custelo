"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";
import { MSG } from "@/lib/mensagens";
import { linkDeSuporte } from "@/lib/suporte";

/** Erro dentro da casca: o trilho continua, só o conteúdo falha. */
export function ErroDeSuperficie({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Só o erro e o digest: nunca dado de pessoa.
    Sentry.captureException(error);
  }, [error]);

  return (
    <TelaDeEstado
      status="500"
      titulo="Não conseguimos abrir esta tela"
      descricao={MSG.instavel}
      codigo={error.digest}
      acoes={
        <>
          <Button type="button" shape="pill" size="lg" onClick={reset}>
            Tentar de novo
          </Button>
          <Button asChild variant="ghost" shape="pill">
            <a href={linkDeSuporte(error.digest)}>Falar com o suporte</a>
          </Button>
        </>
      }
    />
  );
}
