"use client";

import {
  AuthCardStage,
  type AuthCardView,
} from "@/components/auth/auth-card-stage";
import { EntrarLayout } from "@/components/auth/entrar-layout";
import type { PendingInvitePreview } from "@/components/auth/request-accept-invite";
import { SplashSessao } from "@/components/auth/splash-sessao";

type LoginDesktopProps = {
  initialInvite?: PendingInvitePreview | null;
  initialView?: AuthCardView;
  initialError?: string | null;
};

export function LoginDesktop({
  initialInvite = null,
  initialView = "entrar",
  initialError = null,
}: LoginDesktopProps) {
  return (
    <>
      <EntrarLayout>
        <AuthCardStage
          initialInvite={initialInvite}
          initialView={initialView}
          initialError={initialError}
        />
      </EntrarLayout>
      <SplashSessao />
    </>
  );
}
