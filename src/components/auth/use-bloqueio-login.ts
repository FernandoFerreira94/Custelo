"use client";

import { useCallback, useEffect, useState } from "react";

export const MAX_TENTATIVAS = 5;
export const BLOQUEIO_MS = 15 * 60 * 1000;

export function formatarRegressiva(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const minutos = Math.floor(total / 60);
  const segundos = String(total % 60).padStart(2, "0");
  return `${minutos}:${segundos}`;
}

/**
 * Aviso visual do bloqueio por tentativas. O bloqueio de verdade é do servidor
 * (Supabase); aqui só contamos as falhas desta aba para mostrar o aviso e a
 * contagem regressiva. Recarregar a página zera a contagem local.
 */
export function useBloqueioLogin() {
  const [falhas, setFalhas] = useState(0);
  const [ate, setAte] = useState<number | null>(null);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (ate === null) return;
    const id = setInterval(() => {
      const t = Date.now();
      setAgora(t);
      if (t >= ate) setAte(null);
    }, 1000);
    return () => clearInterval(id);
  }, [ate]);

  const registrarFalha = useCallback(() => {
    const proximas = falhas + 1;
    if (proximas >= MAX_TENTATIVAS) {
      const t = Date.now();
      setAgora(t);
      setAte(t + BLOQUEIO_MS);
      setFalhas(0);
    } else {
      setFalhas(proximas);
    }
  }, [falhas]);

  const zerar = useCallback(() => {
    setFalhas(0);
    setAte(null);
  }, []);

  const restanteMs = ate === null ? 0 : Math.max(0, ate - agora);
  return { bloqueado: ate !== null, restanteMs, registrarFalha, zerar };
}
