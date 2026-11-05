import { beforeEach, describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { autorizarRetirada } from "@/application/pessoas/autorizar-retirada";
import { criarPessoa } from "@/application/pessoas/criar-pessoa";
import { definirRecebeAviso } from "@/application/pessoas/definir-recebe-aviso";
import { detalhePessoa } from "@/application/pessoas/consultas";
import { encerrarVinculo } from "@/application/pessoas/encerrar-vinculo";
import type { DepsDePessoas } from "@/application/pessoas/ports";
import { registrarConsentimento } from "@/application/pessoas/registrar-consentimento";
import { salvarContato } from "@/application/pessoas/salvar-contato";
import { vincular } from "@/application/pessoas/vincular";
import { criarAuditoriaFake } from "@/tests/fakes/auditoria";
import { criarPessoasRepoFake } from "@/tests/fakes/pessoas-repo";

const AGORA = new Date("2026-11-05T12:00:00Z");
const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});
const gestor = ctx("empreendimento_gestor");

let fake: ReturnType<typeof criarPessoasRepoFake>;
let trilha: ReturnType<typeof criarAuditoriaFake>;
let deps: DepsDePessoas;

beforeEach(() => {
  fake = criarPessoasRepoFake();
  trilha = criarAuditoriaFake();
  deps = { repo: fake.repo, auditoria: trilha.auditoria, agora: () => AGORA };
});

const novaHelena = (extra = {}) =>
  criarPessoa(deps, gestor, {
    nome: "Helena Prado",
    unidadeId: "u-b304",
    tipo: "titular",
    whatsapp: "(11) 98765-4321",
    moradorAutorizou: true,
    ...extra,
  });

describe("criarPessoa", () => {
  it("pessoa + vínculo ativo que recebe aviso + contato com consentimento do gestor, numa transação", async () => {
    const r = await novaHelena();

    expect(r).toMatchObject({ ok: true });
    expect(fake.estado.transacoes).toBe(1);
    expect(fake.estado.vinculos[0]).toMatchObject({
      status: "ativo",
      recebeAviso: true,
      tipo: "titular",
    });
    expect(fake.estado.contatos[0]).toMatchObject({
      valor: "+5511987654321",
      consentimento: { origem: "gestor", por: "u1", em: AGORA },
    });
  });

  it("a auditoria PESSOA_CRIADA não leva telefone nem CPF", async () => {
    await novaHelena({ cpf: "529.982.247-25" });

    expect(trilha.entradas.map((e) => e.acao)).toEqual(["PESSOA_CRIADA"]);
    const texto = JSON.stringify(trilha.entradas[0]);
    expect(texto).not.toContain("987654321");
    expect(texto).not.toContain("52998224725");
  });

  it("sem marcar consentimento: contato sem consentimento e aviso explicando", async () => {
    const r = await novaHelena({ moradorAutorizou: false });

    expect(fake.estado.contatos[0]?.consentimento).toBeUndefined();
    expect(r).toMatchObject({
      ok: true,
      mensagem:
        "Sem autorização registrada: Helena não recebe aviso por WhatsApp até autorizar.",
    });
  });

  it("mesma pessoa já ativa na unidade: DUPLICADO, sem juntar sozinho", async () => {
    await novaHelena();

    const r = await novaHelena({ nome: "  helena   PRADO " });

    expect(r).toMatchObject({ ok: false, codigo: "DUPLICADO" });
    expect(fake.estado.pessoas).toHaveLength(1);
  });

  it("WhatsApp inválido: ENTRADA_INVALIDA no campo", async () => {
    const r = await novaHelena({ whatsapp: "1187654321" });

    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: {
        whatsapp: "WhatsApp precisa ser celular com DDD (11 dígitos).",
      },
    });
  });

  it("recepcionista não cadastra: SEM_PERMISSAO", async () => {
    const r = await criarPessoa(deps, ctx("recepcionista"), {
      nome: "Ana",
      unidadeId: "u1",
      tipo: "morador",
    });
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});

describe("vincular", () => {
  it("pessoa já ativa na unidade: DUPLICADO", async () => {
    const criada = await novaHelena();
    if (!criada.ok) throw new Error(criada.mensagem);

    const r = await vincular(deps, gestor, {
      pessoaId: criada.data.pessoaId,
      unidadeId: "u-b304",
      tipo: "morador",
    });

    expect(r).toMatchObject({ ok: false, codigo: "DUPLICADO" });
  });

  it("pessoa de outra unidade (pode morar em várias): ok", async () => {
    const criada = await novaHelena();
    if (!criada.ok) throw new Error(criada.mensagem);

    const r = await vincular(deps, gestor, {
      pessoaId: criada.data.pessoaId,
      unidadeId: "u-c101",
      tipo: "morador",
    });

    expect(r).toMatchObject({ ok: true });
    expect(trilha.entradas.at(-1)?.acao).toBe("VINCULO_CRIADO");
  });
});

describe("encerrarVinculo", () => {
  it("gestor com motivo: encerra, desliga o aviso e audita VINCULO_ENCERRADO", async () => {
    const criada = await novaHelena();
    if (!criada.ok) throw new Error(criada.mensagem);

    const r = await encerrarVinculo(deps, gestor, {
      vinculoId: criada.data.vinculoId,
      motivo: "vendeu o apartamento",
    });

    expect(r).toMatchObject({ ok: true });
    expect(fake.estado.vinculos[0]).toMatchObject({
      status: "encerrado",
      recebeAviso: false,
      vigenciaFim: AGORA,
    });
    expect(trilha.entradas.at(-1)).toMatchObject({
      acao: "VINCULO_ENCERRADO",
      motivo: "vendeu o apartamento",
    });
  });

  it("recepcionista: SEM_PERMISSAO", async () => {
    const r = await encerrarVinculo(deps, ctx("recepcionista"), {
      vinculoId: "v-1",
      motivo: "x",
    });
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});

describe("autorizarRetirada", () => {
  const base = {
    unidadeId: "u-b304",
    nome: "Joana Prates",
    cpf: "529.982.247-25",
    relacao: "irmã",
    valeAte: new Date("2026-12-01T00:00:00Z"),
  };

  async function comMoradora() {
    const m = await novaHelena();
    if (!m.ok) throw new Error(m.mensagem);
    return m.data.pessoaId;
  }

  it("cria a pessoa e o vínculo autorizado até a data, sem aviso", async () => {
    const emNomeDePessoaId = await comMoradora();

    const r = await autorizarRetirada(deps, gestor, {
      ...base,
      emNomeDePessoaId,
    });

    expect(r).toMatchObject({ ok: true });
    const v = fake.estado.vinculos.at(-1)!;
    expect(v).toMatchObject({
      tipo: "autorizado",
      recebeAviso: false,
      vigenciaFim: base.valeAte,
    });
    expect(fake.estado.pessoas.at(-1)?.cpf).toBe("52998224725");
  });

  it("'em nome de' sem vínculo ativo na unidade: ENTRADA_INVALIDA", async () => {
    const r = await autorizarRetirada(deps, gestor, {
      ...base,
      emNomeDePessoaId: "ninguem",
    });

    expect(r).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
  });

  it("vale até no passado: ENTRADA_INVALIDA", async () => {
    const emNomeDePessoaId = await comMoradora();

    const r = await autorizarRetirada(deps, gestor, {
      ...base,
      emNomeDePessoaId,
      valeAte: new Date("2026-11-01T00:00:00Z"),
    });

    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: { valeAte: "A data precisa ser hoje ou depois." },
    });
  });

  it("CPF inválido: ENTRADA_INVALIDA no campo", async () => {
    const emNomeDePessoaId = await comMoradora();

    const r = await autorizarRetirada(deps, gestor, {
      ...base,
      emNomeDePessoaId,
      cpf: "111.111.111-11",
    });

    expect(r).toMatchObject({
      ok: false,
      campos: { cpf: "CPF inválido. Confira os números." },
    });
  });
});

describe("contatos e consentimento", () => {
  it("salvarContato com WhatsApp inválido devolve o texto do domínio", async () => {
    const r = await salvarContato(deps, gestor, {
      pessoaId: "p1",
      canal: "whatsapp",
      valor: "119876",
    });

    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: {
        valor: "WhatsApp precisa ser celular com DDD (11 dígitos).",
      },
    });
  });

  it("salvarContato audita sem o valor do contato", async () => {
    await salvarContato(deps, gestor, {
      pessoaId: "p1",
      canal: "email",
      valor: "Ana@X.com",
    });

    expect(fake.estado.contatos[0]?.valor).toBe("ana@x.com");
    expect(JSON.stringify(trilha.entradas)).not.toContain("ana@x.com");
  });

  it("registrarConsentimento grava origem gestor e quem, e audita", async () => {
    const r = await registrarConsentimento(deps, gestor, { contatoId: "c-9" });

    expect(r).toMatchObject({ ok: true });
    expect(fake.estado.consentimentos).toEqual([
      { contatoId: "c-9", origem: "gestor", por: "u1" },
    ]);
    expect(trilha.entradas.at(-1)?.acao).toBe("CONSENTIMENTO_REGISTRADO");
  });
});

describe("detalhePessoa", () => {
  async function comCpf() {
    const m = await novaHelena({ cpf: "529.982.247-25" });
    if (!m.ok) throw new Error(m.mensagem);
    return m.data.pessoaId;
  }

  it("devolve o CPF mascarado por padrão", async () => {
    const id = await comCpf();

    const r = await detalhePessoa(deps, gestor, id);

    expect(r).toMatchObject({ ok: true, data: { cpf: "***.982.247-**" } });
    expect(trilha.entradas.some((e) => e.acao === "CPF_VISUALIZADO")).toBe(
      false,
    );
  });

  it("o completo só sai a quem edita cadastro, quando pede, e gera CPF_VISUALIZADO", async () => {
    const id = await comCpf();

    const r = await detalhePessoa(deps, gestor, id, { mostrarCpf: true });

    expect(r).toMatchObject({ ok: true, data: { cpf: "52998224725" } });
    const evento = trilha.entradas.at(-1);
    expect(evento?.acao).toBe("CPF_VISUALIZADO");
    expect(JSON.stringify(evento)).not.toContain("52998224725");
  });

  it("auditor lê, mas não vê o CPF completo", async () => {
    const id = await comCpf();

    const r = await detalhePessoa(deps, ctx("auditor"), id, {
      mostrarCpf: true,
    });

    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});

describe("definirRecebeAviso", () => {
  it("com contato consentido, liga e desliga o aviso e audita", async () => {
    const criada = await novaHelena();
    if (!criada.ok) throw new Error(criada.mensagem);

    await definirRecebeAviso(deps, gestor, {
      vinculoId: criada.data.vinculoId,
      recebeAviso: false,
    });
    expect(fake.estado.vinculos[0]?.recebeAviso).toBe(false);

    const r = await definirRecebeAviso(deps, gestor, {
      vinculoId: criada.data.vinculoId,
      recebeAviso: true,
    });

    expect(r).toMatchObject({ ok: true });
    expect(fake.estado.vinculos[0]?.recebeAviso).toBe(true);
    expect(trilha.entradas.map((e) => e.acao).slice(-2)).toEqual([
      "AVISO_DESLIGADO",
      "AVISO_LIGADO",
    ]);
  });

  it("sem consentimento não liga: o aviso não teria para onde sair", async () => {
    const criada = await novaHelena({ moradorAutorizou: false });
    if (!criada.ok) throw new Error(criada.mensagem);
    fake.estado.vinculos[0]!.recebeAviso = false;

    const r = await definirRecebeAviso(deps, gestor, {
      vinculoId: criada.data.vinculoId,
      recebeAviso: true,
    });

    expect(r).toEqual({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      mensagem: "Registre a autorização do morador antes de ligar o aviso.",
    });
    expect(fake.estado.vinculos[0]?.recebeAviso).toBe(false);
  });

  it("autorizado e vínculo encerrado não recebem aviso", async () => {
    const criada = await novaHelena();
    if (!criada.ok) throw new Error(criada.mensagem);
    const autorizada = await autorizarRetirada(deps, gestor, {
      unidadeId: "u-b304",
      nome: "Joana Prates",
      cpf: "529.982.247-25",
      relacao: "irmã",
      valeAte: new Date("2026-12-01T00:00:00Z"),
      emNomeDePessoaId: criada.data.pessoaId,
    });
    if (!autorizada.ok) throw new Error(autorizada.mensagem);

    await expect(
      definirRecebeAviso(deps, gestor, {
        vinculoId: autorizada.data.vinculoId,
        recebeAviso: true,
      }),
    ).resolves.toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });

    await encerrarVinculo(deps, gestor, {
      vinculoId: criada.data.vinculoId,
      motivo: "mudou",
    });
    await expect(
      definirRecebeAviso(deps, gestor, {
        vinculoId: criada.data.vinculoId,
        recebeAviso: true,
      }),
    ).resolves.toMatchObject({ ok: false, codigo: "CONFLITO" });
  });

  it("recepcionista: SEM_PERMISSAO", async () => {
    await expect(
      definirRecebeAviso(deps, ctx("recepcionista"), {
        vinculoId: "v-1",
        recebeAviso: true,
      }),
    ).resolves.toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});
