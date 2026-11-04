"use client";

import { useEffect, useState } from "react";

import { PzSplash } from "@/components/brand/marca";

const DURACAO_MS = 4000;

/**
 * Splash "IA primeiro" só na 1ª abertura da sessão. Nunca bloqueia o formulário.
 *
 * Nasce visível no HTML do servidor, para animar desde o primeiro quadro e não
 * ficar atrás do carregamento da página. Quem esconde nas visitas seguintes é o
 * `SCRIPT_SPLASH`, que o layout injeta logo depois deste elemento.
 */
export function SplashSessao() {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const fechar = window.setTimeout(() => setVisivel(false), DURACAO_MS);
    return () => window.clearTimeout(fechar);
  }, []);

  if (!visivel) return null;
  return (
    <div
      aria-hidden="true"
      // O script do layout pode ter marcado `hidden` antes da hidratação.
      suppressHydrationWarning
      onClick={() => setVisivel(false)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground motion-safe:animate-out motion-safe:delay-[3600ms] motion-safe:duration-300 motion-safe:fill-mode-forwards motion-safe:fade-out [&[hidden]]:hidden"
    >
      <PzSplash className="w-60 lg:w-80" />
      <span className="pz-splash-tag opacity-80">
        Recebeu, avisou, entregou.
      </span>
    </div>
  );
}
