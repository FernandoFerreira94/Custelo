import { describe, expect, it } from "vitest";

import { motivoDoLink } from "@/application/auth/link-erro";

describe("motivoDoLink", () => {
  it.each([
    [{ code: "email_link_used" }, "usado"],
    [{ code: "flow_state_not_found" }, "usado"],
    [{ code: "otp_expired", message: "Token has already been used" }, "usado"],
    [{ code: "otp_expired" }, "vencido"],
    [{ message: "expired" }, "vencido"],
    [{ message: "algo estranho" }, "invalido"],
    [null, "invalido"],
  ])("%j -> %s", (erro, esperado) => {
    expect(motivoDoLink(erro)).toBe(esperado);
  });
});
