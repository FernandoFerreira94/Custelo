import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginIntroParcel } from "@/components/auth/login-intro-parcel";

describe("LoginIntroParcel", () => {
  it("monta a caixa com os tres cantos do qr", () => {
    const { container } = render(<LoginIntroParcel />);
    expect(container.querySelector("[data-login-parcel]")).toBeTruthy();
    expect(container.querySelectorAll("[data-login-qr-finder]")).toHaveLength(
      3,
    );
    expect(
      container.querySelectorAll("[data-login-qr-cell]").length,
    ).toBeGreaterThan(80);
  });
});
