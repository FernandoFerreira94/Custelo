import { describe, expect, it } from "vitest";

import { resolverContexto } from "@/application/auth/contexto";
import { ORG_SCOPE_SENTINEL } from "@/db/session";

const base = { userId: "u1", email: "a@b.c" };
const sessao = (claims: Record<string, string>) => ({ ...base, claims });

describe("resolverContexto", () => {
  it("usa o empreendimento do token e ignora o pedido igual", () => {
    const r = resolverContexto(
      sessao({
        user_status: "ativo",
        org_id: "o1",
        empreendimento_id: "e1",
        papel_codigo: "recepcionista",
      }),
      ["e1"],
      "e1",
    );
    expect(r).toMatchObject({
      ok: true,
      data: {
        empreendimentoId: "e1",
        papel: "recepcionista",
        escopoDeOrg: false,
      },
    });
  });

  it("recusa pedido de outro empreendimento quando o token é de empreendimento", () => {
    const r = resolverContexto(
      sessao({
        user_status: "ativo",
        org_id: "o1",
        empreendimento_id: "e1",
        papel_codigo: "empreendimento_gestor",
      }),
      ["e1"],
      "e2",
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });

  it("escopo de org exige empreendimento pedido e dentro da lista permitida", () => {
    const claims = {
      user_status: "ativo",
      org_id: "o1",
      empreendimento_id: ORG_SCOPE_SENTINEL,
      papel_codigo: "org_admin",
    };
    expect(
      resolverContexto(sessao(claims), ["e1", "e2"], undefined),
    ).toMatchObject({ ok: false, codigo: "SEM_SESSAO" });
    expect(resolverContexto(sessao(claims), ["e1", "e2"], "e9")).toMatchObject({
      ok: false,
      codigo: "SEM_PERMISSAO",
    });
    expect(resolverContexto(sessao(claims), ["e1", "e2"], "e2")).toMatchObject({
      ok: true,
      data: { empreendimentoId: "e2", escopoDeOrg: true },
    });
  });

  it("usuário não ativo não passa", () => {
    const r = resolverContexto(
      sessao({
        user_status: "desativado",
        org_id: "o1",
        empreendimento_id: "e1",
        papel_codigo: "recepcionista",
      }),
      ["e1"],
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });

  it("sem contexto escolhido devolve SEM_SESSAO com a mensagem de escolher", () => {
    const r = resolverContexto(sessao({ user_status: "ativo" }), []);
    expect(r).toMatchObject({
      ok: false,
      codigo: "SEM_SESSAO",
      mensagem: "Escolha o empreendimento para continuar.",
    });
  });

  it("papel desconhecido não passa", () => {
    const r = resolverContexto(
      sessao({
        user_status: "ativo",
        org_id: "o1",
        empreendimento_id: "e1",
        papel_codigo: "zelador",
      }),
      ["e1"],
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});
