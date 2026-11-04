"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Último recurso: o layout raiz quebrou, então nada do app (tema, fontes, componentes) está disponível.
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
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#EEF1F5",
          color: "#0C2C55",
        }}
      >
        <main role="alert" style={{ maxWidth: 420, padding: 24 }}>
          <h1 style={{ fontSize: 24 }}>O PacoteZap não abriu</h1>
          <p>
            Tente de novo. Se continuar, fale com o suporte
            {error.digest ? ` e informe o código ${error.digest}` : ""}.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: 48,
              padding: "0 24px",
              borderRadius: 999,
              border: 0,
              background: "#0C2C55",
              color: "#fff",
              fontSize: 16,
            }}
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
