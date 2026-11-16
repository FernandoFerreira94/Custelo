import { describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { criarCodigoDoLocal } from "@/application/pareamento/codigo-do-local";
import { localLembrado, parearAparelho } from "@/application/pareamento/parear";
import {
  type DepsDePareamento,
  MSG_PAREAMENTO,
  type PareamentoRepo,
} from "@/application/pareamento/ports";
import { MSG } from "@/lib/mensagens";

const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});

function criarDeps(repo: Partial<PareamentoRepo> = {}) {
  const chamadas: { parear: [string, string, string][] } = { parear: [] };
  const deps: DepsDePareamento = {
    agora: () => new Date("2026-11-13T12:00:00Z"),
    segredos: {
      novoToken: () => "token-do-aparelho",
      sha256: (t) => `sha(${t})`,
      chaveDeOrigem: (ip) => `hmac(${ip})`,
      sortear: () => 0,
    },
    repo: {
      parear: async (...args) => {
        chamadas.parear.push(args);
        return { ok: true, localNome: "Residencial Alfa" };
      },
      localDoAparelho: async () => null,
      criarCodigo: async (_c, codigo, expiraEm) => ({
        id: "c1",
        codigo,
        expiraEm: expiraEm.toISOString(),
      }),
      revogarCodigo: async () => undefined,
      ...repo,
    },
  };
  return { deps, chamadas };
}

describe("parearAparelho", () => {
  it("manda só hash do token e HMAC do IP; devolve token e nome do local", async () => {
    const { deps, chamadas } = criarDeps();
    const r = await parearAparelho(deps, {
      codigo: "abc-234",
      ip: "203.0.113.9",
    });
    expect(chamadas.parear).toEqual([
      ["ABC234", "hmac(203.0.113.9)", "sha(token-do-aparelho)"],
    ]);
    expect(r).toEqual({
      ok: true,
      data: { token: "token-do-aparelho", localNome: "Residencial Alfa" },
      mensagem: MSG_PAREAMENTO.pareado("Residencial Alfa"),
    });
  });

  it("formato errado responde igual a código inexistente, sem ir ao banco", async () => {
    const { deps, chamadas } = criarDeps({
      parear: async () => ({ ok: false, code: "NAO_ENCONTRADO" }),
    });
    const formato = await parearAparelho(deps, {
      codigo: "O0I1",
      ip: "1.1.1.1",
    });
    const inexistente = await parearAparelho(deps, {
      codigo: "ZZZ222",
      ip: "1.1.1.1",
    });
    expect(formato).toEqual(inexistente);
    expect(formato).toMatchObject({
      ok: false,
      mensagem: MSG_PAREAMENTO.naoEncontrado,
    });
    expect(chamadas.parear).toHaveLength(0);
  });

  it("limite de tentativas vira a mensagem de aguardar", async () => {
    const { deps } = criarDeps({
      parear: async () => ({ ok: false, code: "MUITAS_TENTATIVAS" }),
    });
    const r = await parearAparelho(deps, { codigo: "ABC234", ip: "1.1.1.1" });
    expect(r).toMatchObject({ ok: false, mensagem: MSG.muitasTentativas });
  });

  it("sem cookie do aparelho a etapa de código volta", async () => {
    const { deps } = criarDeps();
    expect(await localLembrado(deps, undefined)).toBeNull();
  });
});

describe("criarCodigoDoLocal", () => {
  it("recepcionista não gera código", async () => {
    const { deps } = criarDeps();
    const r = await criarCodigoDoLocal(deps, ctx("recepcionista"), {
      validadeDias: 30,
    });
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });

  it("gestor gera com validade a partir de agora; sorteia de novo se colidir", async () => {
    let tentativas = 0;
    const { deps } = criarDeps({
      criarCodigo: async (_c, codigo, expiraEm) =>
        ++tentativas < 2
          ? null
          : { id: "c1", codigo, expiraEm: expiraEm.toISOString() },
    });
    const r = await criarCodigoDoLocal(deps, ctx("empreendimento_gestor"), {
      validadeDias: 30,
    });
    expect(tentativas).toBe(2);
    expect(r).toMatchObject({
      ok: true,
      data: { codigo: "AAAAAA", expiraEm: "2026-12-13T12:00:00.000Z" },
    });
  });

  it("validade fora de 1 a 365 dias é recusada", async () => {
    const { deps } = criarDeps();
    const r = await criarCodigoDoLocal(deps, ctx("empreendimento_gestor"), {
      validadeDias: 0,
    });
    expect(r).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
  });
});
