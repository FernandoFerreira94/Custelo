"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";

export default function ErroDaPagina({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const offline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <TelaDeEstado
      status={offline ? "warning" : "500"}
      titulo={offline ? "Sem conexão" : "Algo deu errado do nosso lado"}
      descricao={
        offline
          ? "Verifique a internet e tente de novo."
          : "Já fomos avisados. Tente de novo; se continuar, fale com o suporte."
      }
      codigo={offline ? undefined : error.digest}
      acoes={
        <>
          <Button type="button" shape="pill" size="lg" onClick={reset}>
            Tentar de novo
          </Button>
          <Button asChild variant="ghost" shape="pill">
            <Link href="/">Ir para o início</Link>
          </Button>
        </>
      }
    />
  );
}
