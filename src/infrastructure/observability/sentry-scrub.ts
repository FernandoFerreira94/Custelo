import type { ErrorEvent } from "@sentry/nextjs";

/**
 * ADR-016 / invariante 12: evento de erro sem PII, cookie, Authorization
 * ou corpo de request. Sentry nao e audit log.
 */
export function scrubSentryEvent(event: ErrorEvent): ErrorEvent | null {
  if (event.user) {
    event.user =
      event.user.id === undefined ? undefined : { id: String(event.user.id) };
  }

  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    if (event.request.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["x-supabase-authorization"];
    }
  }

  return event;
}
