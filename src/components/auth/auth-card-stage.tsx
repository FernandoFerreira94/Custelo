"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { LoginForm } from "@/components/auth/login-form";
import { RecoverAccessForm } from "@/components/auth/recover-access-form";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { useAuthHashView } from "@/components/auth/use-auth-hash-view";
import type { PendingInvitePreview } from "@/components/auth/request-accept-invite";

export type AuthCardView = "entrar" | "recuperar" | "senha" | "convite";

type AuthCardStageProps = {
  initialInvite?: PendingInvitePreview | null;
  initialView?: AuthCardView;
  initialError?: string | null;
};

export function AuthCardStage({
  initialInvite = null,
  initialView = "entrar",
  initialError = null,
}: AuthCardStageProps) {
  const router = useRouter();
  const [view, setView] = useState<AuthCardView>(initialView);

  useAuthHashView((detected) => {
    setView(detected);
  });

  return (
    <div className="relative z-10 flex w-full max-w-[460px] justify-center">
      <div
        key={view}
        className="w-full motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
      >
        {view === "entrar" ? (
          <LoginForm
            onInvite={() => setView("convite")}
            onRecover={() => setView("recuperar")}
            initialError={initialError}
          />
        ) : null}
        {view === "recuperar" ? (
          <RecoverAccessForm onBack={() => setView("entrar")} />
        ) : null}
        {view === "senha" ? (
          <SetPasswordForm
            onBack={() => setView("entrar")}
            onSaved={(redirectTo) => {
              router.push(redirectTo ?? "/contexto");
            }}
          />
        ) : null}
        {view === "convite" ? (
          <AcceptInviteForm
            initialInvite={initialInvite}
            onBack={() => setView("entrar")}
            onActivated={(redirectTo) => {
              router.push(redirectTo ?? "/contexto");
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
