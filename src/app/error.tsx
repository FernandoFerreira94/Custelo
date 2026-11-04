"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";
import { linkDeSuporte } from "@/lib/suporte";

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

  // Sem internet nunca bloqueia o recebimento (invariante 5): a tela offline
  // leva de volta ao fluxo, que abre do cache.
  if (offline) {
    return (
      <TelaDeEstado
        status="info"
        titulo="Você está sem internet"
        descricao="Dá para receber e entregar normalmente. Tudo vai sozinho quando a rede voltar."
        acoes={
          <>
            <Button asChild shape="pill" size="lg">
              <Link href="/receber">Continuar sem internet</Link>
            </Button>
            <Button type="button" variant="ghost" shape="pill" onClick={reset}>
              Tentar conectar
            </Button>
          </>
        }
      />
    );
  }

  return (
    <TelaDeEstado
      status="500"
      titulo="Algo deu errado do nosso lado"
      descricao="Já fomos avisados. Tente de novo; se continuar, fale com o suporte."
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
