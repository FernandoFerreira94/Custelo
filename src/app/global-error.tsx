"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";
import { linkDeSuporte } from "@/lib/suporte";

import { fontesClassName } from "./fontes";
import "./globals.css";

// Último recurso: o layout raiz quebrou e este arquivo o substitui, então
// importa o CSS sozinho.
export default function ErroGeral({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR" data-wc-theme="custelo" className={fontesClassName}>
      <body>
        <TelaDeEstado
          status="500"
          titulo="O PacoteZap não abriu"
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
      </body>
    </html>
  );
}
