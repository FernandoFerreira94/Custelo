import { describe, expect, it } from "vitest";

import { linkDeSuporte } from "@/lib/suporte";

describe("linkDeSuporte", () => {
  it("sem código devolve o canal como está", () => {
    expect(linkDeSuporte(undefined, "mailto:a@b.com")).toBe("mailto:a@b.com");
  });

  it("e-mail leva assunto e o código no corpo", () => {
    const link = linkDeSuporte("abc123", "mailto:a@b.com");
    expect(link).toContain("mailto:a@b.com?subject=");
    expect(decodeURIComponent(link)).toContain("Código: abc123");
  });

  it("WhatsApp leva o código no texto", () => {
    const link = linkDeSuporte("abc123", "https://wa.me/5511999999999");
    expect(link.startsWith("https://wa.me/5511999999999?text=")).toBe(true);
    expect(decodeURIComponent(link)).toContain("Código: abc123");
  });
});
