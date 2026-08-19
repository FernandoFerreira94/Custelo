import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validacao de ambiente — falha no build, nao em producao as 3 da manha.
 *
 * Quality Gates, Gate 3: nenhum segredo no repositorio. Este arquivo declara
 * QUAIS variaveis existem; os VALORES vivem em Vercel Environment Variables e
 * Supabase Vault (ADR-019).
 */
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Banco (ADR-003 / ADR-006) — conexao direta, nao PostgREST.
    // Opcional em I1 (ainda sem projeto Supabase). I2 torna obrigatorio.
    DATABASE_URL: z.url().optional(),

    // Supabase (ADR-005 / ADR-008)
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // Jobs duraveis (ADR-009)
    INNGEST_EVENT_KEY: z.string().min(1).optional(),
    INNGEST_SIGNING_KEY: z.string().min(1).optional(),

    // WhatsApp Cloud API (ADR-015)
    WHATSAPP_APP_SECRET: z.string().min(1).optional(),
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1).optional(),

    // OCR (ADR-014) — fornecedor ainda e OPEN QUESTION; a porta ja existe.
    LABEL_EXTRACTOR_API_KEY: z.string().min(1).optional(),

    // Observabilidade (ADR-016)
    SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
    SENTRY_ORG: z.string().min(1).optional(),
    SENTRY_PROJECT: z.string().min(1).optional(),
  },

  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    // ADR-017: analytics sem PII, separado do audit log.
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET,
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    LABEL_EXTRACTOR_API_KEY: process.env.LABEL_EXTRACTOR_API_KEY,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },

  emptyStringAsUndefined: true,
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" ||
    process.env.NODE_ENV === "test",
});
