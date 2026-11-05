import { describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { AreaEmCiclo } from "@/application/estrutura/ports";
import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
} from "./helpers";

const ctxDe = (f: typeof FIXTURE_ORG_A): Contexto => ({
  orgId: f.orgId,
  empreendimentoId: f.empreendimentoId,
  usuarioId: f.userId,
  papel: "empreendimento_gestor",
  escopoDeOrg: false,
});
const ctxA = ctxDe(FIXTURE_ORG_A);
const ctxB = ctxDe(FIXTURE_ORG_B);

// Os dados persistem entre execuções: cada teste usa nomes únicos.
let n = Date.now() % 1_000_000;
const unico = (prefixo: string) => `${prefixo}${n++}`;

describe("estruturaRepo contra o banco real (RLS)", () => {
  setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  it("gera blocos, andares e unidades numa transação e a árvore conta as unidades", async () => {
    const bloco = unico("BL");
    const r = await estruturaRepo.criarEstruturaEmLote(ctxA, {
      blocos: [
        {
          nome: bloco,
          andares: [1, 2].map((andar) => ({
            andar,
            unidades: [1, 2, 3].map((i) => {
              const numero = `${andar}0${i}`;
              return { numero, codigo: `${bloco}-${numero}` };
            }),
          })),
        },
      ],
    });

    expect(r).toEqual({ areas: 3, unidades: 6 });
    const arvore = await estruturaRepo.arvore(ctxA);
    const no = arvore.find((a) => a.nome === bloco);
    expect(no?.filhos.map((f) => f.unidadesAtivas)).toEqual([3, 3]);
  });

  it("uma falha no meio do lote não deixa nada pela metade", async () => {
    const bloco = unico("RB");
    await estruturaRepo.criarUnidades(ctxA, [
      {
        codigo: `${bloco}-101`,
        tipo: "apartamento",
        apelidos: [],
        avisarResponsavel: false,
      },
    ]);

    await expect(
      estruturaRepo.criarEstruturaEmLote(ctxA, {
        blocos: [
          {
            nome: bloco,
            andares: [
              {
                andar: 1,
                unidades: [{ numero: "101", codigo: `${bloco}-101` }],
              },
            ],
          },
        ],
      }),
    ).rejects.toBeTruthy();

    const arvore = await estruturaRepo.arvore(ctxA);
    expect(arvore.some((a) => a.nome === bloco)).toBe(false);
  });

  it("acha código existente pelo normalizado, sem N+1", async () => {
    const sufixo = unico("");
    await estruturaRepo.criarUnidades(ctxA, [
      {
        codigo: `Q-${sufixo}`,
        tipo: "apartamento",
        apelidos: [],
        avisarResponsavel: false,
      },
    ]);

    const achados = await estruturaRepo.codigosNormalizadosExistentes(ctxA, [
      `Q${sufixo}`,
      "NAOEXISTE999",
    ]);
    const unidade = await estruturaRepo.unidadePorCodigoNormalizado(
      ctxA,
      `Q${sufixo}`,
    );

    expect(achados).toEqual([`Q${sufixo}`]);
    expect(unidade).not.toBeNull();
  });

  it("não enxerga a unidade de outro empreendimento", async () => {
    const sufixo = unico("");
    await estruturaRepo.criarUnidades(ctxB, [
      {
        codigo: `Z-${sufixo}`,
        tipo: "apartamento",
        apelidos: [],
        avisarResponsavel: false,
      },
    ]);

    await expect(
      estruturaRepo.unidadePorCodigoNormalizado(ctxA, `Z${sufixo}`),
    ).resolves.toBeNull();
    await expect(
      estruturaRepo.codigosNormalizadosExistentes(ctxA, [`Z${sufixo}`]),
    ).resolves.toEqual([]);
  });

  it("pagina por cursor sem repetir nem pular unidade", async () => {
    const bloco = unico("PG");
    await estruturaRepo.criarUnidades(
      ctxA,
      Array.from({ length: 55 }, (_, i) => ({
        codigo: `${bloco}-${i}`,
        tipo: "apartamento" as const,
        apelidos: [],
        avisarResponsavel: false,
      })),
    );

    const primeira = await estruturaRepo.listarUnidades(ctxA, { busca: bloco });
    expect(primeira.itens).toHaveLength(50);
    expect(primeira.proximo).toBeDefined();

    const segunda = await estruturaRepo.listarUnidades(ctxA, {
      busca: bloco,
      cursor: primeira.proximo,
    });
    expect(segunda.itens).toHaveLength(5);
    expect(segunda.proximo).toBeUndefined();

    const ids = [...primeira.itens, ...segunda.itens].map((u) => u.id);
    expect(new Set(ids).size).toBe(55);
  });

  it("semContato lista só quem ninguém consegue avisar", async () => {
    const sufixo = unico("");
    const [{ id: unidadeId }] = (await estruturaRepo
      .criarUnidades(ctxA, [
        {
          codigo: `SC-${sufixo}`,
          tipo: "apartamento",
          apelidos: [],
          avisarResponsavel: false,
        },
      ])
      .then((r) => r.ids.map((id) => ({ id })))) as [{ id: string }];

    const semContato = await estruturaRepo.listarUnidades(ctxA, {
      busca: `SC-${sufixo}`,
      semContato: true,
    });

    expect(semContato.itens.map((u) => u.id)).toEqual([unidadeId]);
  });

  it("recusa ciclo na árvore de áreas com AreaEmCiclo", async () => {
    const a1 = await estruturaRepo.criarArea(ctxA, { nome: unico("C1-") });
    const a2 = await estruturaRepo.criarArea(ctxA, {
      nome: unico("C2-"),
      parentId: a1.id,
    });

    await expect(
      estruturaRepo.atualizarArea(ctxA, a1.id, { parentId: a2.id }),
    ).rejects.toBeInstanceOf(AreaEmCiclo);
  });

  it("conta unidades ativas da área e vínculos ativos da unidade", async () => {
    const area = await estruturaRepo.criarArea(ctxA, { nome: unico("CT-") });
    await estruturaRepo.criarUnidades(ctxA, [
      {
        codigo: unico("CT-"),
        tipo: "apartamento",
        areaId: area.id,
        apelidos: [],
        avisarResponsavel: false,
      },
    ]);

    await expect(
      estruturaRepo.contarUnidadesAtivasNaArea(ctxA, area.id),
    ).resolves.toBe(1);
  });
});
