import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // O contrato de agentes e AGENTS.md deste repo. Next 16 tenta anexar
  // um bloco proprio a cada `next dev` — isso suja o git e compete com
  // o contrato do Custelo.
  agentRules: false,

  typescript: {
    // Erro de tipo quebra o build. Sem excecao.
    ignoreBuildErrors: false,
  },
  // Next 16 nao roda mais ESLint no build; o lint e gate proprio no CI
  // (`pnpm lint`) e no hook Stop.

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // camera: o PWA operacional precisa. geolocation/microfone: nao.
            value: "camera=(self), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

// O plugin do Serwist é de webpack: o build roda com `next build --webpack`.
// Em dev fica desligado (o SW atrapalharia o HMR).
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: false,
  // Registrado só pela casca do (ops) (`RegistrarSw`), não em toda página.
  register: false,
  reloadOnOnline: false,
});

const analyzed = withBundleAnalyzer(withSerwist(nextConfig));

/** Sem DSN o SDK nao envia. Sem AUTH_TOKEN o upload de sourcemap fica desligado. */
export default withSentryConfig(analyzed, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
