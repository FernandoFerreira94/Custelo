"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { LoginForm } from "@/components/auth/login-form";
import { RecoverAccessForm } from "@/components/auth/recover-access-form";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { useAuthHashView } from "@/components/auth/use-auth-hash-view";
import type { PendingInvitePreview } from "@/components/auth/request-accept-invite";

gsap.registerPlugin(useGSAP);

type AuthCardView = "entrar" | "recuperar" | "senha" | "convite";

type AuthCardStageProps = {
  initialInvite?: PendingInvitePreview | null;
};

export function AuthCardStage({ initialInvite = null }: AuthCardStageProps) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<AuthCardView>("entrar");
  const isFirstView = useRef(true);

  useAuthHashView((detected) => {
    setView(detected);
  });

  useGSAP(
    () => {
      if (isFirstView.current) {
        isFirstView.current = false;
        return;
      }
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !panel.current
      ) {
        return;
      }
      gsap.fromTo(
        panel.current,
        { x: view === "entrar" ? -40 : 40, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.34, ease: "power3.out" },
      );
    },
    { dependencies: [view], scope: root },
  );

  function go(next: AuthCardView) {
    if (next === view) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setView(next);
      return;
    }
    const direction = next === "entrar" ? 1 : -1;
    gsap.to(panel.current, {
      x: 40 * direction,
      autoAlpha: 0,
      duration: 0.2,
      ease: "power3.in",
      onComplete: () => setView(next),
    });
  }

  return (
    <div ref={root} className="relative z-10">
      <div ref={panel} className="relative isolate">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 -z-10 hidden size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/80 lg:block"
        />
        <div className="relative z-10">
          {view === "entrar" ? (
            <LoginForm
              onInvite={() => go("convite")}
              onRecover={() => go("recuperar")}
            />
          ) : null}
          {view === "recuperar" ? (
            <RecoverAccessForm onBack={() => go("entrar")} />
          ) : null}
          {view === "senha" ? (
            <SetPasswordForm
              onBack={() => go("entrar")}
              onSaved={(redirectTo) => {
                router.push(redirectTo ?? "/contexto");
              }}
            />
          ) : null}
          {view === "convite" ? (
            <AcceptInviteForm
              initialInvite={initialInvite}
              onBack={() => go("entrar")}
              onActivated={(redirectTo) => {
                router.push(redirectTo ?? "/contexto");
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
