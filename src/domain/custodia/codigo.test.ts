import { describe, expect, it } from "vitest";

import { codigoCurto, conteudoQr, lerQr } from "./codigo";

describe("código curto e QR", () => {
  const id = "0192f3c8-7b1a-7c3e-9f2a-3b8d4e5f7f3a";
  it("4 caracteres do alfabeto sem I, L, O e U, sempre o mesmo para o mesmo id", () => {
    expect(codigoCurto(id)).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(codigoCurto(id)).toBe(codigoCurto(id));
  });
  it("QR leva só o id (nada de unidade, nome ou telefone)", () => {
    expect(conteudoQr(id)).toBe(`pz:e:${id}`);
    expect(lerQr(`pz:e:${id}`)).toBe(id);
  });
  it("QR de fora do PacoteZap ou malformado é ignorado", () => {
    expect(lerQr("https://exemplo.com")).toBeNull();
    expect(lerQr("pz:e:nao-e-uuid")).toBeNull();
    expect(lerQr(`pz:e:${id}; drop table`)).toBeNull();
  });
});
