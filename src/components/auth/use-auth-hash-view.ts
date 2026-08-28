"use client";

import { useEffect, useRef } from "react";

import {
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/infrastructure/auth/supabase-browser";

export type AuthHashView = "entrar" | "convite" | "senha";

function parseHashType(hash: string): AuthHashView | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const type = params.get("type");

  if (type === "invite") {
    return "convite";
  }

  if (type === "recovery") {
    return "senha";
  }

  return null;
}

function clearAuthHash() {
  window.history.replaceState(null, "", window.location.pathname);
}

export function useAuthHashView(
  onDetected?: (view: AuthHashView) => void,
): void {
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    const hash = window.location.hash;
    const nextView = parseHashType(hash);

    if (!nextView || !isSupabaseBrowserConfigured()) {
      return;
    }

    const detectedView = nextView;
    const supabase = createSupabaseBrowserClient();
    let settled = false;

    function applyView() {
      if (settled) {
        return;
      }
      settled = true;
      onDetectedRef.current?.(detectedView);
      clearAuthHash();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        applyView();
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        applyView();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onDetectedRef]);
}
