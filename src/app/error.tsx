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
      titulo={offline ? "Sem conexão" : "Não conseguimos carregar esta página"}
      descricao={
        offline
          ? "Verifique a internet e tente de novo."
          : "Tente de novo. Se continuar, fale com o suporte e informe o código abaixo."
      }
      detalhe={
        !offline && error.digest ? (
          <p>
            Código: <span className="font-mono">{error.digest}</span>
          </p>
        ) : undefined
      }
      acoes={
        <>
          <Button
            type="button"
            onClick={reset}
            className="h-12 min-h-[var(--size-touch-primary)] w-full"
          >
            Tentar de novo
          </Button>
          <Button asChild variant="link" className="w-full underline">
            <Link href="/">Ir para o início</Link>
          </Button>
        </>
      }
    />
  );
}
