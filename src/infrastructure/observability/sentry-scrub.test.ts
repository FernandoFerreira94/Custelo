import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

import { scrubSentryEvent } from "./sentry-scrub";

describe("scrubSentryEvent", () => {
  it("remove e-mail, cookie, Authorization e body", () => {
    const event = scrubSentryEvent({
      type: undefined,
      user: { id: "usr_1", email: "a@b.com" },
      request: {
        cookies: { session: "abc" },
        data: { label: "secreto" },
        headers: {
          authorization: "Bearer xyz",
          cookie: "session=abc",
          "x-supabase-authorization": "role",
          "content-type": "application/json",
        },
      },
    } as ErrorEvent);

    expect(event?.user).toEqual({ id: "usr_1" });
    expect(event?.request?.cookies).toBeUndefined();
    expect(event?.request?.data).toBeUndefined();
    expect(event?.request?.headers).toEqual({
      "content-type": "application/json",
    });
  });
});
