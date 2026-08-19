"use client";

import { useRef } from "react";

import { AuthCardStage } from "@/components/auth/auth-card-stage";
import { LoginHero } from "@/components/auth/login-hero";
import { LoginIntroParcel } from "@/components/auth/login-intro-parcel";
import { LoginOrbs } from "@/components/auth/login-orbs";
import { useLoginMotion } from "@/components/auth/use-login-motion";

export function LoginDesktop() {
  const root = useRef<HTMLDivElement>(null);
  useLoginMotion({ root });

  return (
    <div
      ref={root}
      className="relative min-h-dvh overflow-hidden bg-background"
    >
      <LoginHero />
      <div
        data-login-right
        className="relative z-10 flex min-h-dvh w-full items-center justify-center overflow-hidden px-6 py-12 lg:ml-auto lg:w-1/2 lg:px-10"
      >
        <LoginOrbs />
        <AuthCardStage />
      </div>

      <div
        data-login-veil
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-primary opacity-0"
      >
        <div className="relative flex flex-col items-center justify-center gap-7">
          <span
            data-login-glow
            className="absolute size-[22rem] rounded-full bg-[radial-gradient(circle_at_center,var(--secondary)_0%,color-mix(in_oklch,var(--secondary)_42%,transparent)_38%,transparent_72%)] sm:size-[28rem]"
          />
          <LoginIntroParcel />
          <p
            data-login-mark
            className="relative z-10 font-heading text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl"
          >
            Custelo
          </p>
        </div>
      </div>
    </div>
  );
}
