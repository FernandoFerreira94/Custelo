import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
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

const analyzed = withBundleAnalyzer(nextConfig);

/** Sem DSN o SDK nao envia. Sem AUTH_TOKEN o upload de sourcemap fica desligado. */
export default withSentryConfig(analyzed, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
