import { describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { AreaEmCiclo } from "@/application/estrutura/ports";
import { codigoPg } from "@/infrastructure/db/erros-pg";
import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";
import { pessoasRepo } from "@/infrastructure/pessoas/pessoas-repo";

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
    const no = arvore.find((a) => a.nome === `Bloco ${bloco}`);
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
    expect(arvore.some((a) => a.nome === `Bloco ${bloco}`)).toBe(false);
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

describe("pessoasRepo contra o banco real (RLS)", () => {
  setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  async function unidadeNova(ctx: Contexto, prefixo: string) {
    const r = await estruturaRepo.criarUnidades(ctx, [
      {
        codigo: unico(prefixo),
        tipo: "apartamento",
        apelidos: [],
        avisarResponsavel: false,
      },
    ]);
    return r.ids[0]!;
  }

  it("cria pessoa, vínculo e contato numa transação e devolve o CPF só em dígitos", async () => {
    const unidadeId = await unidadeNova(ctxA, "PR-");

    const { pessoaId, vinculoId } = await pessoasRepo.criarPessoaCompleta(
      ctxA,
      {
        nome: "Helena Prado",
        cpf: "52998224725",
        vinculo: { unidadeId, tipo: "titular", recebeAviso: true },
        contatos: [
          {
            canal: "whatsapp",
            valor: `+5511${unico("9")}`,
            consentimento: {
              em: new Date(),
              origem: "gestor",
              por: ctxA.usuarioId,
            },
          },
        ],
      },
    );

    const p = await pessoasRepo.pessoaPorId(ctxA, pessoaId);
    expect(p).toMatchObject({ nome: "Helena Prado", cpf: "52998224725" });
    expect(p?.contatos).toHaveLength(1);
    expect(p?.contatos[0]?.consentimentoEm).toBeInstanceOf(Date);
    expect(p?.vinculos[0]).toMatchObject({ id: vinculoId, status: "ativo" });
  });

  it("não deixa gravar contato com consentimento pela metade (origem sem data)", async () => {
    const unidadeId = await unidadeNova(ctxA, "PM-");
    const { pessoaId } = await pessoasRepo.criarPessoaCompleta(ctxA, {
      nome: "Pessoa Meia",
      vinculo: { unidadeId, tipo: "morador", recebeAviso: true },
      contatos: [],
    });
    const c = await pessoasRepo.salvarContato(ctxA, {
      pessoaId,
      canal: "email",
      valor: `${unico("m")}@x.com`,
    });

    await pessoasRepo.marcarConsentimento(ctxA, c.id, {
      em: new Date(),
      origem: "gestor",
      por: ctxA.usuarioId,
    });

    const p = await pessoasRepo.pessoaPorId(ctxA, pessoaId);
    expect(p?.contatos[0]?.consentimentoEm).toBeInstanceOf(Date);
  });

  it("encerrar vínculo grava fim e desliga o aviso; novo vínculo ativo é liberado", async () => {
    const unidadeId = await unidadeNova(ctxA, "PE-");
    const { pessoaId, vinculoId } = await pessoasRepo.criarPessoaCompleta(
      ctxA,
      {
        nome: "Pessoa Encerra",
        vinculo: { unidadeId, tipo: "morador", recebeAviso: true },
        contatos: [],
      },
    );
    const vinculo = await pessoasRepo.buscarVinculo(ctxA, vinculoId);

    await pessoasRepo.salvarVinculoEncerrado(ctxA, {
      ...vinculo!,
      vigenciaFim: new Date(),
      motivoEncerramento: "mudou",
    });

    expect(
      await pessoasRepo.vinculoAtivo(ctxA, pessoaId, unidadeId),
    ).toBeNull();
    await expect(
      pessoasRepo.criarVinculo(ctxA, {
        pessoaId,
        unidadeId,
        tipo: "morador",
        recebeAviso: true,
      }),
    ).resolves.toHaveProperty("id");
  });

  it("não vincula pessoa de outro empreendimento (FK composta)", async () => {
    const unidadeA = await unidadeNova(ctxA, "PX-");
    const unidadeB = await unidadeNova(ctxB, "PX-");
    const { pessoaId } = await pessoasRepo.criarPessoaCompleta(ctxB, {
      nome: "Pessoa de B",
      vinculo: { unidadeId: unidadeB, tipo: "morador", recebeAviso: true },
      contatos: [],
    });

    await expect(
      pessoasRepo.criarVinculo(ctxA, {
        pessoaId,
        unidadeId: unidadeA,
        tipo: "morador",
        recebeAviso: true,
      }),
    ).rejects.toSatisfy((e: unknown) => codigoPg(e) === "23503");
    await expect(pessoasRepo.pessoaPorId(ctxA, pessoaId)).resolves.toBeNull();
  });

  it("acha a pessoa ativa na unidade pelo nome normalizado", async () => {
    const unidadeId = await unidadeNova(ctxA, "PN-");
    const { pessoaId } = await pessoasRepo.criarPessoaCompleta(ctxA, {
      nome: "José Álvares",
      vinculo: { unidadeId, tipo: "morador", recebeAviso: true },
      contatos: [],
    });

    const achada = await pessoasRepo.pessoaAtivaNaUnidadePorNome(
      ctxA,
      unidadeId,
      "jose alvares",
    );

    expect(achada).toEqual({ id: pessoaId });
  });

  it("resumo da árvore: moradores e 'sem contato' só contam consentimento", async () => {
    const comAviso = await unidadeNova(ctxA, "RS-");
    const semConsentimento = await unidadeNova(ctxA, "RS-");
    const vazia = await unidadeNova(ctxA, "RS-");
    await pessoasRepo.criarPessoaCompleta(ctxA, {
      nome: "Morador Com Aviso",
      vinculo: { unidadeId: comAviso, tipo: "titular", recebeAviso: true },
      contatos: [
        {
          canal: "whatsapp",
          valor: `+5511${unico("9")}`,
          consentimento: {
            em: new Date(),
            origem: "gestor",
            por: ctxA.usuarioId,
          },
        },
      ],
    });
    await pessoasRepo.criarPessoaCompleta(ctxA, {
      nome: "Morador Sem Consentimento",
      vinculo: {
        unidadeId: semConsentimento,
        tipo: "morador",
        recebeAviso: true,
      },
      contatos: [{ canal: "whatsapp", valor: `+5511${unico("8")}` }],
    });

    const resumo = await estruturaRepo.resumoDeUnidades(ctxA);
    const por = (id: string) => resumo.find((u) => u.id === id);

    expect(por(comAviso)).toMatchObject({
      moradores: ["Morador Com Aviso"],
      semContato: false,
    });
    expect(por(semConsentimento)).toMatchObject({
      moradores: ["Morador Sem Consentimento"],
      semContato: true,
    });
    expect(por(vazia)).toMatchObject({ moradores: [], semContato: true });
  });

  it("contagens e filtros de unidades: inativas e áreas comuns saem da lista padrão", async () => {
    const antes = await estruturaRepo.contagensDeUnidades(ctxA);
    const sufixo = unico("");
    const [comum, apto] = (
      await estruturaRepo.criarUnidades(ctxA, [
        {
          codigo: `Salao ${sufixo}`,
          tipo: "area_comum",
          apelidos: [],
          avisarResponsavel: false,
        },
        {
          codigo: `CN-${sufixo}`,
          tipo: "apartamento",
          apelidos: [],
          avisarResponsavel: false,
        },
      ])
    ).ids;
    await estruturaRepo.atualizarUnidade(ctxA, apto!, { ativo: false });

    const depois = await estruturaRepo.contagensDeUnidades(ctxA);
    const ativas = await estruturaRepo.listarUnidades(ctxA, { busca: sufixo });
    const desativadas = await estruturaRepo.listarUnidades(ctxA, {
      busca: sufixo,
      inativas: true,
    });
    const comuns = await estruturaRepo.listarUnidades(ctxA, {
      busca: sufixo,
      tipo: "area_comum",
    });

    expect(depois.todas).toBe(antes.todas + 1);
    expect(depois.areasComuns).toBe(antes.areasComuns + 1);
    expect(depois.inativas).toBe(antes.inativas + 1);
    expect(ativas.itens.map((u) => u.id)).toEqual([comum]);
    expect(desativadas.itens.map((u) => u.id)).toEqual([apto]);
    expect(comuns.itens.map((u) => u.id)).toEqual([comum]);
  });

  it("lista pessoas com as unidades e pagina por cursor", async () => {
    const prefixo = unico("Lista");
    const unidadeId = await unidadeNova(ctxA, "PL-");
    for (let i = 0; i < 55; i++) {
      await pessoasRepo.criarPessoaCompleta(ctxA, {
        nome: `${prefixo} ${i}`,
        vinculo: { unidadeId, tipo: "morador", recebeAviso: false },
        contatos: [],
      });
    }

    const primeira = await pessoasRepo.listarPessoas(ctxA, { busca: prefixo });
    const segunda = await pessoasRepo.listarPessoas(ctxA, {
      busca: prefixo,
      cursor: primeira.proximo,
    });

    expect(primeira.itens).toHaveLength(50);
    expect(segunda.itens).toHaveLength(5);
    expect(primeira.itens[0]?.unidades).toHaveLength(1);
    const ids = [...primeira.itens, ...segunda.itens].map((p) => p.id);
    expect(new Set(ids).size).toBe(55);
  });
});
