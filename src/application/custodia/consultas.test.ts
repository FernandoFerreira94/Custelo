import { describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import {
  badgeMaisUrgente,
  detalhe,
  filaPorUnidade,
  linhaDoTempo,
} from "@/application/custodia/consultas";
import type { ConsultasCustodiaRepo } from "@/application/custodia/ports";
import { PRAZOS_PADRAO } from "@/domain/custodia/situacao";

const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});
const AGORA = new Date("2026-11-18T12:00:00Z");
const diasAtras = (d: number) => new Date(AGORA.getTime() - d * 86_400_000);

const vazio = async () => {
  throw new Error("não usado");
};
const repo = (
  extra: Partial<ConsultasCustodiaRepo>,
): ConsultasCustodiaRepo => ({
  prazos: async () => PRAZOS_PADRAO,
  filaPorUnidade: vazio,
  listaEncomendas: vazio,
  contadores: vazio,
  detalhe: vazio,
  eventos: vazio,
  locaisComOcupacao: vazio,
  ...extra,
});

describe("badgeMaisUrgente", () => {
  it.each([
    [
      [
        ["NOTIFICADA", 1],
        ["FALHA_NOTIFICACAO", 0],
      ],
      "falha",
    ],
    [
      [
        ["NOTIFICADA", 8],
        ["NAO_IDENTIFICADA", 0],
      ],
      "urgente",
    ],
    [
      [
        ["NAO_IDENTIFICADA", 0],
        ["AGUARDANDO_NOTIFICACAO", 0],
      ],
      "naoIdent",
    ],
    [
      [
        ["NOTIFICADA", 0],
        ["AGUARDANDO_NOTIFICACAO", 0],
      ],
      "aguardando",
    ],
    [
      [
        ["NOTIFICADA", 0],
        ["IDENTIFICADA", 0],
      ],
      "pronta",
    ],
    [[["IDENTIFICADA", 0]], "recebida"],
  ] as const)("%j → %s", (itens, esperado) => {
    expect(
      badgeMaisUrgente(
        itens.map(([estado, d]) => ({ estado, ocorridoEm: diasAtras(d) })),
        AGORA,
        PRAZOS_PADRAO,
      ),
    ).toBe(esperado);
  });
});

describe("consultas", () => {
  it("fila calcula o badge e os dias da mais antiga", async () => {
    const r = await filaPorUnidade(
      ctx("recepcionista"),
      {},
      {
        agora: () => AGORA,
        repo: repo({
          filaPorUnidade: async () => ({
            proximo: null,
            itens: [
              {
                chave: "u1",
                unidadeId: "u1",
                unidadeCodigo: "B-304",
                destinatario: "Ana",
                encomendas: 2,
                volumes: 3,
                localMaisAntiga: "C2",
                idMaisAntiga: "e-1",
                ocorridoEmMaisAntiga: diasAtras(3),
                itens: [
                  { estado: "NOTIFICADA", ocorridoEm: diasAtras(3) },
                  { estado: "FALHA_NOTIFICACAO", ocorridoEm: diasAtras(1) },
                ],
              },
            ],
          }),
        }),
      },
    );
    expect(r).toMatchObject({
      ok: true,
      data: {
        itens: [{ unidadeCodigo: "B-304", badge: "falha", diasNaPortaria: 3 }],
      },
    });
    expect(r.ok && "itens" in r.data.itens[0]!).toBe(false);
  });

  it("papel sem leitura não consulta", async () => {
    const r = await filaPorUnidade(
      ctx("platform_super_admin"),
      {},
      {
        agora: () => AGORA,
        repo: repo({}),
      },
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });

  it("detalhe inexistente ou de outro empreendimento é NAO_ENCONTRADO", async () => {
    const r = await detalhe(ctx("auditor"), "x", {
      agora: () => AGORA,
      repo: repo({ detalhe: async () => null }),
    });
    expect(r).toMatchObject({ ok: false, codigo: "NAO_ENCONTRADO" });
  });

  it("linha do tempo sem eventos é NAO_ENCONTRADO", async () => {
    const r = await linhaDoTempo(ctx("auditor"), "x", {
      repo: repo({
        eventos: async () => ({
          eventos: [],
          rotulos: { unidades: {}, locais: {}, pontos: {} },
        }),
      }),
    });
    expect(r).toMatchObject({ ok: false, codigo: "NAO_ENCONTRADO" });
  });
});
