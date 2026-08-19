"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type RefObject } from "react";

gsap.registerPlugin(useGSAP);

type UseLoginMotionArgs = {
  root: RefObject<HTMLElement | null>;
};

export function useLoginMotion({ root }: UseLoginMotionArgs) {
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set("[data-login-veil]", { autoAlpha: 0 });
        return;
      }

      gsap.set("[data-login-veil]", { autoAlpha: 1 });
      gsap.set("[data-login-glow]", { autoAlpha: 0, scale: 0.45 });
      gsap.set("[data-login-box-face]", { autoAlpha: 0, y: 26, scale: 0.9 });
      gsap.set("[data-login-box-lid]", {
        autoAlpha: 0,
        y: -22,
        rotate: -10,
        transformOrigin: "50% 100%",
      });
      gsap.set("[data-login-box-label]", { autoAlpha: 0, scale: 0.86 });
      gsap.set("[data-login-box-tape]", {
        autoAlpha: 0,
        scaleX: 0,
        transformOrigin: "50% 50%",
      });
      gsap.set("[data-login-qr-finder]", { autoAlpha: 0, scale: 0.55 });
      gsap.set("[data-login-qr-cell]", { autoAlpha: 0, scale: 0.35 });
      gsap.set("[data-login-mark]", { autoAlpha: 0, scale: 0.92, y: 12 });
      gsap.set("[data-login-left]", { autoAlpha: 0, xPercent: -6 });
      gsap.set("[data-login-copy]", { autoAlpha: 0, y: 18 });
      gsap.set("[data-login-right]", { autoAlpha: 0, xPercent: 6 });
      gsap.set("[data-login-card-item]", { autoAlpha: 0, y: 22 });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      intro
        .to("[data-login-glow]", {
          autoAlpha: 1,
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
        })
        .to(
          "[data-login-box-face]",
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.38,
            stagger: 0.06,
            ease: "power4.out",
          },
          "<0.1",
        )
        .to(
          "[data-login-box-lid]",
          {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            duration: 0.32,
            ease: "power3.out",
          },
          "-=0.14",
        )
        .to(
          "[data-login-box-label]",
          { autoAlpha: 1, scale: 1, duration: 0.22, ease: "power3.out" },
          "-=0.12",
        )
        .to(
          "[data-login-box-tape]",
          { autoAlpha: 1, scaleX: 1, duration: 0.2, ease: "power3.out" },
          "-=0.08",
        )
        .to("[data-login-qr-finder]", {
          autoAlpha: 1,
          scale: 1,
          duration: 0.18,
          stagger: 0.04,
          ease: "power3.out",
        })
        .to("[data-login-qr-cell]", {
          autoAlpha: 1,
          scale: 1,
          duration: 0.16,
          stagger: { each: 0.004, from: "center" },
          ease: "power2.out",
        })
        .to(
          "[data-login-mark]",
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            ease: "power4.out",
          },
          "-=0.18",
        )
        .to("[data-login-glow]", {
          scale: 1.08,
          duration: 0.55,
          ease: "sine.inOut",
        })
        .to("[data-login-veil]", {
          autoAlpha: 0,
          duration: 0.42,
          ease: "power3.out",
        })
        .to(
          "[data-login-left]",
          { autoAlpha: 1, xPercent: 0, duration: 0.65, ease: "power4.out" },
          "<0.04",
        )
        .to(
          "[data-login-right]",
          { autoAlpha: 1, xPercent: 0, duration: 0.65, ease: "power4.out" },
          "<0.04",
        )
        .to(
          "[data-login-copy]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power4.out",
            stagger: 0.04,
          },
          "<0.1",
        )
        .to(
          "[data-login-card-item]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power4.out",
            stagger: 0.04,
          },
          "<0.08",
        );
    },
    { scope: root },
  );
}
