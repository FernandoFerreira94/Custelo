import { describe, expect, it } from "vitest";

import { toLogLine } from "@/infrastructure/observability/logger";

describe("logger", () => {
  const at = new Date("2026-08-18T23:00:00.000Z");

  it("emite so a allowlist, em JSON", () => {
    const line = toLogLine(
      "info",
      {
        msg: "job.enqueued",
        request_id: "req_1",
        org_id: "org_1",
        empreendimento_id: "emp_1",
      },
      at,
    );

    expect(JSON.parse(line)).toEqual({
      ts: "2026-08-18T23:00:00.000Z",
      level: "info",
      msg: "job.enqueued",
      request_id: "req_1",
      org_id: "org_1",
      empreendimento_id: "emp_1",
    });
  });

  it("nao tem campo onde caiba PII", () => {
    const keys = Object.keys(
      JSON.parse(toLogLine("error", { msg: "auth.denied" }, at)),
    );
    expect(keys).not.toEqual(
      expect.arrayContaining(["email", "phone", "nome", "label", "ocr"]),
    );
  });
});
