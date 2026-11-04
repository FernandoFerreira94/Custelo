import { describe, expect, it } from "vitest";

import { decidirAcesso } from "@/application/auth/acesso-superficie";
import type { AuthenticatedSession } from "@/application/auth/session-context";

const sessao = (
  claims: AuthenticatedSession["claims"],
): AuthenticatedSession => ({
  userId: "u1",
  email: "ana@exemplo.com",
  claims,
});

const ativo = {
  user_status: "ativo" as const,
  org_id: "o1",
  empreendimento_id: "e1",
};

describe("decidirAcesso", () => {
  it("sem sessão vai para /entrar", () => {
    expect(decidirAcesso(null, "ops")).toEqual({
      ok: false,
      redirectTo: "/entrar",
    });
  });

  it("conta desativada vai para /sem-acesso", () => {
    expect(
      decidirAcesso(sessao({ ...ativo, user_status: "desativado" }), "web"),
    ).toEqual({ ok: false, redirectTo: "/sem-acesso" });
  });

  it("sem contexto ativo vai para /contexto", () => {
    expect(
      decidirAcesso(
        sessao({ user_status: "ativo", papel_codigo: "recepcionista" }),
        "ops",
      ),
    ).toEqual({ ok: false, redirectTo: "/contexto" });
  });

  it("porteiro não abre a gestão: volta para a portaria", () => {
    expect(
      decidirAcesso(sessao({ ...ativo, papel_codigo: "recepcionista" }), "web"),
    ).toEqual({ ok: false, redirectTo: "/receber" });
  });

  it("gestor não abre a plataforma interna", () => {
    expect(
      decidirAcesso(
        sessao({ ...ativo, papel_codigo: "empreendimento_gestor" }),
        "saas",
      ),
    ).toEqual({ ok: false, redirectTo: "/gestao" });
  });

  it("papel certo entra", () => {
    expect(
      decidirAcesso(sessao({ ...ativo, papel_codigo: "recepcionista" }), "ops"),
    ).toEqual({ ok: true });
    expect(
      decidirAcesso(sessao({ ...ativo, papel_codigo: "auditor" }), "web"),
    ).toEqual({ ok: true });
  });
});
