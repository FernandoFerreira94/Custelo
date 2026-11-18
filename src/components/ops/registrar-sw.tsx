"use client";

import { useEffect } from "react";

/** Registra o service worker da portaria (só existe no build; em dev o Serwist fica desligado). */
export function RegistrarSw() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        // Sem SW o app funciona online; o erro não tem dado pessoal, mas não há o que fazer na tela.
      });
  }, []);
  return null;
}
