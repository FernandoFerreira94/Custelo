"use client";

import { useEffect, useState } from "react";

import { PzSplash } from "@/components/brand/marca";

const CHAVE = "pz-splash-visto";
const DURACAO_MS = 4000;

/** Splash "IA primeiro" só na 1ª abertura da sessão. Nunca bloqueia o formulário. */
export function SplashSessao() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(CHAVE)) return;
      sessionStorage.setItem(CHAVE, "1");
    } catch {
      return; // sem storage (aba privada): não mostra
    }
    // Timers em vez de setState direto: o splash só existe depois da hidratação.
    const abrir = window.setTimeout(() => setVisivel(true), 0);
    const fechar = window.setTimeout(() => setVisivel(false), DURACAO_MS);
    return () => {
      window.clearTimeout(abrir);
      window.clearTimeout(fechar);
    };
  }, []);

  if (!visivel) return null;
  return (
    <div
      aria-hidden="true"
      onClick={() => setVisivel(false)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground motion-safe:animate-out motion-safe:delay-[3600ms] motion-safe:duration-300 motion-safe:fade-out"
    >
      <PzSplash className="w-60 lg:w-80" />
      <span className="pz-splash-tag opacity-80">
        Recebeu, avisou, entregou.
      </span>
    </div>
  );
}
