import * as Sentry from "@sentry/nextjs";

import "@/infrastructure/observability/sentry.client";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
