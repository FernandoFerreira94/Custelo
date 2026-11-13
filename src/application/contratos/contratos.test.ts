import { beforeEach, describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { aceitarContrato } from "@/application/contratos/aceitar";
import { atribuirFuncionario } from "@/application/contratos/atribuir-funcionario";
import { encerrarContrato } from "@/application/contratos/encerrar";
import {
  type ContratoResumo,
  type ContratosRepo,
  ErroDeContrato,
  MSG_CONTRATOS,
} from "@/application/contratos/ports";
import { proporContrato } from "@/application/contratos/propor";
import { suspenderFuncionario } from "@/application/contratos/suspender-funcionario";

const CONTRATO = "0b1f6f0e-8c1a-4c55-9a51-3f2d1c9e7a01";
const FUNC = "0b1f6f0e-8c1a-4c55-9a51-3f2d1c9e7a02";
const LOCAL_ORG = "0b1f6f0e-8c1a-4c55-9a51-3f2d1c9e7a03";
const LOCAL_EMP = "0b1f6f0e-8c1a-4c55-9a51-3f2d1c9e7a04";

const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: papel === "org_admin",
});

type Escopo = { usuarioId: string; contratoId: string; ativo: boolean };

/** Imita as funções do banco: estado mínimo e as mesmas recusas. */
function criarRepoFake() {
  const estado = {
    contratos: new Map<string, ContratoResumo>(),
    escopos: [] as Escopo[],
    propostas: 0,
    recusarComo: null as ErroDeContrato | null,
  };
  const recusar = () => {
    if (estado.recusarComo) throw estado.recusarComo;
  };
  const repo: ContratosRepo = {
    porId: async (_c, id) => estado.contratos.get(id) ?? null,
    propor: async () => {
      recusar();
      estado.propostas += 1;
      return CONTRATO;
    },
    aceitar: async (_c, id) => {
      recusar();
      estado.contratos.get(id)!.status = "ativo";
    },
    atribuirFuncionario: async (_c, contratoId, usuarioId) => {
      recusar();
      estado.escopos.push({ usuarioId, contratoId, ativo: true });
    },
    suspenderFuncionario: async (_c, contratoId, usuarioId) => {
      recusar();
      const e = estado.escopos.find(
        (x) => x.contratoId === contratoId && x.usuarioId === usuarioId,
      );
      if (!e) throw new ErroDeContrato("ESCOPO_NAO_ENCONTRADO");
      e.ativo = false;
    },
    encerrar: async (_c, id) => {
      recusar();
      estado.contratos.get(id)!.status = "encerrado";
      for (const e of estado.escopos) if (e.contratoId === id) e.ativo = false;
    },
  };
  return { repo, estado };
}

let fake: ReturnType<typeof criarRepoFake>;
const contrato = (status: ContratoResumo["status"]): ContratoResumo => ({
  id: CONTRATO,
  status,
  prestadoraNome: "Selva",
  papeisPermitidos: ["recepcionista"],
});

beforeEach(() => {
  fake = criarRepoFake();
});

describe("proporContrato", () => {
  const proposta = {
    localOrgId: LOCAL_ORG,
    empreendimentoId: LOCAL_EMP,
    servico: "portaria",
    papeisPermitidos: ["recepcionista", "auditor"],
  };

  it("recepcionista não propõe: SEM_PERMISSAO", async () => {
    const r = await proporContrato(
      { repo: fake.repo },
      ctx("recepcionista"),
      proposta,
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
    expect(fake.estado.propostas).toBe(0);
  });

  it("papel de gestão no contrato é recusado antes do banco", async () => {
    const r = await proporContrato({ repo: fake.repo }, ctx("org_admin"), {
      ...proposta,
      papeisPermitidos: ["empreendimento_gestor"],
    });
    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: { papeisPermitidos: MSG_CONTRATOS.papeisInvalidos },
    });
    expect(fake.estado.propostas).toBe(0);
  });

  it("gestor da prestadora propõe e o texto diz que falta o aceite", async () => {
    const r = await proporContrato(
      { repo: fake.repo },
      ctx("org_admin"),
      proposta,
    );
    expect(r).toEqual({
      ok: true,
      data: { id: CONTRATO },
      mensagem: MSG_CONTRATOS.proposto,
    });
  });

  it("recusa do banco vira mensagem (gestor de org que não é prestadora)", async () => {
    fake.estado.recusarComo = new ErroDeContrato("SEM_PERMISSAO");
    const r = await proporContrato(
      { repo: fake.repo },
      ctx("org_admin"),
      proposta,
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});

describe("aceitarContrato", () => {
  it("sem aceite do condomínio a prestadora não ativa (banco recusa)", async () => {
    fake.estado.contratos.set(CONTRATO, contrato("proposto"));
    fake.estado.recusarComo = new ErroDeContrato("SEM_PERMISSAO");
    const r = await aceitarContrato(
      { repo: fake.repo },
      ctx("org_admin"),
      CONTRATO,
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
    expect(fake.estado.contratos.get(CONTRATO)?.status).toBe("proposto");
  });

  it("gestor do condomínio aceita contrato proposto", async () => {
    fake.estado.contratos.set(CONTRATO, contrato("proposto"));
    const r = await aceitarContrato(
      { repo: fake.repo },
      ctx("empreendimento_gestor"),
      CONTRATO,
    );
    expect(r).toEqual({ ok: true, data: null, mensagem: MSG_CONTRATOS.aceito });
    expect(fake.estado.contratos.get(CONTRATO)?.status).toBe("ativo");
  });

  it("contrato já ativo não é aceito de novo", async () => {
    fake.estado.contratos.set(CONTRATO, contrato("ativo"));
    const r = await aceitarContrato(
      { repo: fake.repo },
      ctx("empreendimento_gestor"),
      CONTRATO,
    );
    expect(r).toMatchObject({ ok: false, codigo: "CONFLITO" });
  });
});

describe("atribuirFuncionario", () => {
  it("papel fora do contrato é recusado", async () => {
    fake.estado.contratos.set(CONTRATO, contrato("ativo"));
    const r = await atribuirFuncionario({ repo: fake.repo }, ctx("org_admin"), {
      contratoId: CONTRATO,
      usuarioId: FUNC,
      papel: "auditor",
    });
    expect(r).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
    expect(fake.estado.escopos).toHaveLength(0);
  });

  it("papel de gestão nem passa da validação", async () => {
    fake.estado.contratos.set(CONTRATO, contrato("ativo"));
    const r = await atribuirFuncionario({ repo: fake.repo }, ctx("org_admin"), {
      contratoId: CONTRATO,
      usuarioId: FUNC,
      papel: "empreendimento_gestor",
    });
    expect(r).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
  });

  it("contrato sem aceite não recebe funcionário", async () => {
    fake.estado.contratos.set(CONTRATO, contrato("proposto"));
    const r = await atribuirFuncionario({ repo: fake.repo }, ctx("org_admin"), {
      contratoId: CONTRATO,
      usuarioId: FUNC,
      papel: "recepcionista",
    });
    expect(r).toMatchObject({ ok: false, codigo: "CONFLITO" });
  });

  it("funcionário de fora da prestadora: mensagem do banco", async () => {
    fake.estado.contratos.set(CONTRATO, contrato("ativo"));
    fake.estado.recusarComo = new ErroDeContrato(
      "FUNCIONARIO_FORA_DA_PRESTADORA",
    );
    const r = await atribuirFuncionario({ repo: fake.repo }, ctx("org_admin"), {
      contratoId: CONTRATO,
      usuarioId: FUNC,
      papel: "recepcionista",
    });
    expect(r).toMatchObject({
      ok: false,
      mensagem: MSG_CONTRATOS.foraDaPrestadora,
    });
  });
});

describe("suspenderFuncionario e encerrarContrato", () => {
  beforeEach(() => {
    fake.estado.contratos.set(CONTRATO, contrato("ativo"));
    fake.estado.escopos.push(
      { usuarioId: FUNC, contratoId: CONTRATO, ativo: true },
      { usuarioId: "outro", contratoId: CONTRATO, ativo: true },
    );
  });

  it("motivo vazio é recusado", async () => {
    const suspender = await suspenderFuncionario(
      { repo: fake.repo },
      ctx("empreendimento_gestor"),
      { contratoId: CONTRATO, usuarioId: FUNC, motivo: "   " },
    );
    const encerrar = await encerrarContrato(
      { repo: fake.repo },
      ctx("empreendimento_gestor"),
      { contratoId: CONTRATO, motivo: "" },
    );
    for (const r of [suspender, encerrar]) {
      expect(r).toMatchObject({
        ok: false,
        codigo: "ENTRADA_INVALIDA",
        campos: { motivo: MSG_CONTRATOS.motivo },
      });
    }
    expect(fake.estado.escopos.every((e) => e.ativo)).toBe(true);
  });

  it("recepcionista não suspende nem encerra", async () => {
    const r = await encerrarContrato(
      { repo: fake.repo },
      ctx("recepcionista"),
      {
        contratoId: CONTRATO,
        motivo: "fim",
      },
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });

  it("suspender tira só aquele funcionário", async () => {
    const r = await suspenderFuncionario(
      { repo: fake.repo },
      ctx("empreendimento_gestor"),
      { contratoId: CONTRATO, usuarioId: FUNC, motivo: "faltou ao plantão" },
    );
    expect(r).toMatchObject({ ok: true, mensagem: MSG_CONTRATOS.suspenso });
    expect(fake.estado.escopos.map((e) => e.ativo)).toEqual([false, true]);
  });

  it("encerramento derruba todos os escopos do contrato", async () => {
    const r = await encerrarContrato(
      { repo: fake.repo },
      ctx("empreendimento_gestor"),
      { contratoId: CONTRATO, motivo: "troca de prestadora" },
    );
    expect(r).toMatchObject({ ok: true, mensagem: MSG_CONTRATOS.encerrado });
    expect(fake.estado.escopos.every((e) => !e.ativo)).toBe(true);
  });

  it("contrato encerrado não reabre nem encerra de novo", async () => {
    fake.estado.contratos.set(CONTRATO, contrato("encerrado"));
    const r = await encerrarContrato(
      { repo: fake.repo },
      ctx("empreendimento_gestor"),
      { contratoId: CONTRATO, motivo: "de novo" },
    );
    expect(r).toMatchObject({ ok: false, mensagem: MSG_CONTRATOS.jaEncerrado });
  });
});
