import { describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import type {
  ConfigLeitura,
  LeituraRepo,
  NovaLeitura,
} from "@/application/recebimento/ports";
import { sugerir, tipoDaImagem } from "@/application/recebimento/sugerir";
import type { CadastroMatching } from "@/domain/recebimento/matching";
import { MSG_RECEBIMENTO } from "@/lib/mensagens";
import type { LabelExtractor } from "@/ports/label-extractor";
import { criarEvidenceStorageFake } from "@/tests/fakes/evidence-storage";
import { criarLabelExtractorFake } from "@/tests/fakes/label-extractor";

const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});
const recepcionista = ctx("recepcionista");
const ENC = "0196f000-0000-7000-8000-000000000001";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
const WEBP = new Uint8Array([
  ...new TextEncoder().encode("RIFF"),
  0,
  0,
  0,
  0,
  ...new TextEncoder().encode("WEBP"),
  1,
]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CADASTRO: CadastroMatching = {
  unidades: [
    { id: "b304", codigo: "B-304", apelidos: [], bloco: "B", numero: "304" },
  ],
  pessoas: [
    { id: "mari", nome: "Mariana Souza", unidadeId: "b304", ativo: true },
  ],
};

function repoFake(config: Partial<ConfigLeitura> = {}) {
  const leituras: NovaLeitura[] = [];
  const repo: LeituraRepo = {
    configLeitura: async () => ({
      leituraAutomatica: true,
      leiturasPorDia: 600,
      leiturasHoje: 0,
      ...config,
    }),
    cadastroMatching: async () => CADASTRO,
    gravarLeitura: async (_c, l) => {
      leituras.push(l);
      return `l-${leituras.length}`;
    },
  };
  return { repo, leituras };
}
const relogio = { now: () => new Date("2026-11-18T12:00:00Z") };

function deps(
  leitor: LabelExtractor | null,
  extra: { fora?: boolean; config?: Partial<ConfigLeitura> } = {},
) {
  const r = repoFake(extra.config);
  const s = criarEvidenceStorageFake({ fora: extra.fora });
  return {
    d: { storage: s.storage, repo: r.repo, leitor, clock: relogio },
    leituras: r.leituras,
    objetos: s.objetos,
  };
}

describe("tipoDaImagem", () => {
  it("reconhece JPEG e WebP pelos bytes e recusa PNG renomeado", () => {
    expect(tipoDaImagem(JPEG)).toEqual({ mime: "image/jpeg", ext: "jpg" });
    expect(tipoDaImagem(WEBP)).toEqual({ mime: "image/webp", ext: "webp" });
    expect(tipoDaImagem(PNG)).toBeNull();
  });
});

describe("sugerir", () => {
  it("sobe a foto no caminho do tenant e sugere B-304 com a Mariana (alta)", async () => {
    const leitor = criarLabelExtractorFake({
      unidadeTexto: "Bloco B Ap 304",
      nomeTexto: "MARIANA S SOUZA",
    }).leitor;
    const t = deps(leitor);
    const r = await sugerir(
      recepcionista,
      { encomendaId: ENC, imagem: JPEG },
      t.d,
    );
    expect(r).toMatchObject({
      ok: true,
      data: {
        fotoSalva: true,
        foto: { caminho: `o1/e1/${ENC}.jpg`, mime: "image/jpeg" },
        leituraId: "l-1",
        sugestao: {
          confianca: "alta",
          unidade: { id: "b304", codigo: "B-304" },
          pessoa: { id: "mari", nome: "Mariana Souza" },
        },
      },
    });
    expect(t.leituras[0]).toMatchObject({
      resultado: "ok",
      confianca: "alta",
      unidadeSugeridaId: "b304",
    });
    expect(t.leituras[0]).not.toHaveProperty("linhas");
  });

  it("leitura desligada: só sobe a foto, sugestão nenhuma, nada gravado de leitura", async () => {
    const t = deps(null);
    const r = await sugerir(
      recepcionista,
      { encomendaId: ENC, imagem: WEBP },
      t.d,
    );
    expect(r).toMatchObject({
      ok: true,
      data: {
        fotoSalva: true,
        sugestao: { confianca: "nenhuma" },
        motivo: null,
      },
    });
    expect(t.leituras).toHaveLength(0);
  });

  it("desligada no empreendimento também não lê", async () => {
    const f = criarLabelExtractorFake({ unidadeTexto: "Bloco B Ap 304" });
    const t = deps(f.leitor, { config: { leituraAutomatica: false } });
    await sugerir(recepcionista, { encomendaId: ENC, imagem: JPEG }, t.d);
    expect(f.chamadas).toBe(0);
  });

  it("teto do dia atingido: pausa com a mensagem do catálogo", async () => {
    const f = criarLabelExtractorFake({ unidadeTexto: "Bloco B Ap 304" });
    const t = deps(f.leitor, { config: { leiturasHoje: 600 } });
    const r = await sugerir(
      recepcionista,
      { encomendaId: ENC, imagem: JPEG },
      t.d,
    );
    expect(r).toMatchObject({
      ok: true,
      data: { motivo: MSG_RECEBIMENTO.leituraPausada },
    });
    expect(f.chamadas).toBe(0);
  });

  it("leitura falhou: nenhuma + motivo, e a falha fica registrada", async () => {
    const t = deps(
      criarLabelExtractorFake({
        ok: false,
        motivo: "ilegivel",
        repetir: false,
        latenciaMs: 300,
      }).leitor,
    );
    const r = await sugerir(
      recepcionista,
      { encomendaId: ENC, imagem: JPEG },
      t.d,
    );
    expect(r).toMatchObject({
      ok: true,
      data: {
        sugestao: { confianca: "nenhuma" },
        motivo: MSG_RECEBIMENTO.leituraIndisponivel,
      },
    });
    expect(t.leituras[0]).toMatchObject({
      resultado: "ilegivel",
      confianca: "nenhuma",
    });
  });

  it("Storage fora: fotoSalva false, mas a sugestão continua", async () => {
    const t = deps(
      criarLabelExtractorFake({ unidadeTexto: "Bloco B Ap 304" }).leitor,
      { fora: true },
    );
    const r = await sugerir(
      recepcionista,
      { encomendaId: ENC, imagem: JPEG },
      t.d,
    );
    expect(r).toMatchObject({
      ok: true,
      data: {
        fotoSalva: false,
        foto: null,
        sugestao: { unidade: { codigo: "B-304" } },
      },
    });
  });

  it("mesma foto duas vezes não duplica", async () => {
    const t = deps(null);
    await sugerir(recepcionista, { encomendaId: ENC, imagem: JPEG }, t.d);
    const r = await sugerir(
      recepcionista,
      { encomendaId: ENC, imagem: JPEG },
      t.d,
    );
    expect(r).toMatchObject({ ok: true, data: { fotoSalva: true } });
    expect(t.objetos.size).toBe(1);
  });

  it("PNG renomeado, 2 MB e auditor são recusados", async () => {
    const t = deps(null);
    expect(
      await sugerir(recepcionista, { encomendaId: ENC, imagem: PNG }, t.d),
    ).toMatchObject({ ok: false, mensagem: MSG_RECEBIMENTO.fotoFormato });
    const grande = new Uint8Array(2_000_000);
    grande.set(JPEG);
    expect(
      await sugerir(recepcionista, { encomendaId: ENC, imagem: grande }, t.d),
    ).toMatchObject({ ok: false, mensagem: MSG_RECEBIMENTO.fotoGrande });
    expect(
      await sugerir(ctx("auditor"), { encomendaId: ENC, imagem: JPEG }, t.d),
    ).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});
