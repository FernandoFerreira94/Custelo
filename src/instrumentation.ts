import * as Sentry from "@sentry/nextjs";

export async function register(): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/infrastructure/observability/sentry.server");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("@/infrastructure/observability/sentry.edge");
  }
}

export const onRequestError = Sentry.captureRequestError;
