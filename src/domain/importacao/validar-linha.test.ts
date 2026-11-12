import { describe, expect, it } from "vitest";

import { normalizarCodigo } from "@/domain/estrutura/unidade";

import { type ContextoDeValidacao, validarLinha } from "./validar-linha";

const HOJE = new Date("2026-11-05T12:00:00Z");

function contexto(
  extra: Partial<ContextoDeValidacao> = {},
): ContextoDeValidacao {
  return {
    codigosDeUnidade: new Set(["A112", "B304"].map(normalizarCodigo)),
    pessoasPorUnidade: new Map(),
    moradoresPorUnidade: new Map(),
    papelDoImportador: "empreendimento_gestor",
    hoje: HOJE,
    vistos: new Set(),
    ...extra,
  };
}

describe("validarLinha — unidades", () => {
  const linha = (extra: Record<string, string> = {}) => ({
    Tipo: "Apartamento",
    "Bloco/Torre/Quadra": "C",
    Número: "101",
    ...extra,
  });

  it("linha boa fica ok e já traz o código montado", () => {
    const r = validarLinha("unidades", linha(), contexto());
    expect(r).toMatchObject({
      situacao: "ok",
      problemas: [],
      dados: { tipo: "apartamento", codigo: "C-101", numero: "101" },
    });
  });

  it("tipo fora da lista é erro com a lista escrita", () => {
    const r = validarLinha("unidades", linha({ Tipo: "Garagem" }), contexto());
    expect(r.situacao).toBe("erro");
    expect(r.problemas).toContain(
      "Tipo precisa ser Apartamento, Casa, Loja, Sala ou Outro.",
    );
  });

  it("aceita o tipo sem acento e em qualquer caixa", () => {
    const r = validarLinha("unidades", linha({ Tipo: "  LOJA " }), contexto());
    expect(r).toMatchObject({ situacao: "ok", dados: { tipo: "loja" } });
  });

  it("número vazio é erro", () => {
    const r = validarLinha("unidades", linha({ Número: " " }), contexto());
    expect(r.situacao).toBe("erro");
    expect(r.problemas).toContain("Informe o número da unidade.");
  });

  it("número '01' mantém o zero à esquerda", () => {
    const r = validarLinha("unidades", linha({ Número: "01" }), contexto());
    expect(r.dados).toMatchObject({ numero: "01", codigo: "C-01" });
  });

  it("apelidos separados por ; viram lista, sem repetir o próprio código (nem seu jeito normalizado)", () => {
    const r = validarLinha(
      "unidades",
      linha({ "Como aparece na etiqueta": "C101; Bl C ap 101 ; c-101" }),
      contexto(),
    );
    // "C101" e "c-101" normalizam igual ao próprio código (C-101): saem da lista.
    expect(r.dados).toMatchObject({ apelidos: ["Bl C ap 101"] });
  });

  it("código que já existe no banco é duplicado, não erro", () => {
    const r = validarLinha(
      "unidades",
      linha({ "Bloco/Torre/Quadra": "b", Número: "304" }),
      contexto(),
    );
    expect(r.situacao).toBe("duplicado");
    expect(r.problemas[0]).toMatch(/b-304/i);
  });

  it("o mesmo código repetido no arquivo é erro na 2ª ocorrência", () => {
    const ctx = contexto();
    const primeira = validarLinha("unidades", linha(), ctx);
    const segunda = validarLinha("unidades", linha(), ctx);

    expect(primeira.situacao).toBe("ok");
    expect(segunda.situacao).toBe("erro");
    expect(segunda.problemas[0]).toContain("já aparece mais acima");
  });

  it("tira o acento do código para bater com o normalizado do banco", () => {
    const r = validarLinha(
      "unidades",
      linha({ "Bloco/Torre/Quadra": "Térreo", Número: "L-04" }),
      contexto(),
    );
    expect(r.dados).toMatchObject({ codigo: "Terreo-L-04" });
  });
});

describe("validarLinha — moradores", () => {
  const linha = (extra: Record<string, string> = {}) => ({
    "Bloco/Torre/Quadra": "A",
    Unidade: "112",
    "Nome completo": "Helena Prado",
    Papel: "Titular",
    WhatsApp: "11987654321",
    "E-mail": "helena@exemplo.com",
    ...extra,
  });

  it("linha boa fica ok, com WhatsApp em E.164 e SEM consentimento", () => {
    const r = validarLinha("moradores", linha(), contexto());

    expect(r).toMatchObject({
      situacao: "ok",
      dados: {
        unidadeCodigo: "A-112",
        nome: "Helena Prado",
        papel: "titular",
        whatsapp: "+5511987654321",
      },
    });
    // Consentimento nunca vem da planilha: só do gestor ou do opt-in.
    expect(JSON.stringify(r.dados)).not.toMatch(/consent|autoriz/i);
  });

  it("unidade inexistente é erro e manda importar as unidades antes", () => {
    const r = validarLinha(
      "moradores",
      linha({ "Bloco/Torre/Quadra": "A", Unidade: "999" }),
      contexto(),
    );
    expect(r.situacao).toBe("erro");
    expect(r.problemas).toContain(
      "Unidade A-999 não existe. Importe as unidades antes.",
    );
  });

  it("WhatsApp inválido é erro com o texto do domínio", () => {
    const r = validarLinha(
      "moradores",
      linha({ WhatsApp: "119876" }),
      contexto(),
    );
    expect(r.situacao).toBe("erro");
    expect(r.problemas).toContain(
      "WhatsApp precisa ser celular com DDD (11 dígitos).",
    );
  });

  it("papel fora da lista é erro", () => {
    const r = validarLinha(
      "moradores",
      linha({ Papel: "Visitante" }),
      contexto(),
    );
    expect(r.situacao).toBe("erro");
    expect(r.problemas).toContain(
      "Papel precisa ser Titular, Morador ou Inquilino.",
    );
  });

  it("WhatsApp vazio é permitido (aviso só pela portaria)", () => {
    const r = validarLinha("moradores", linha({ WhatsApp: "" }), contexto());
    expect(r.situacao).toBe("ok");
  });

  it("mesma pessoa, mesma unidade e mesmo telefone já cadastrados: duplicado", () => {
    const ctx = contexto({
      pessoasPorUnidade: new Map([
        ["A112", new Set(["helena prado|+5511987654321"])],
      ]),
    });
    const r = validarLinha("moradores", linha(), ctx);
    expect(r.situacao).toBe("duplicado");
  });

  it("o mesmo morador repetido no arquivo é erro na 2ª ocorrência", () => {
    const ctx = contexto();
    expect(validarLinha("moradores", linha(), ctx).situacao).toBe("ok");
    expect(validarLinha("moradores", linha(), ctx).situacao).toBe("erro");
  });

  it("e-mail inválido é erro", () => {
    const r = validarLinha(
      "moradores",
      linha({ "E-mail": "helena" }),
      contexto(),
    );
    expect(r.situacao).toBe("erro");
    expect(r.problemas).toContain("Informe um e-mail válido.");
  });
});

describe("validarLinha — funcionários", () => {
  const linha = (extra: Record<string, string> = {}) => ({
    "Nome completo": "Ana Souza",
    "E-mail": "ana@exemplo.com",
    Papel: "Gestor",
    ...extra,
  });

  it("gestor importando gestor é ok e o papel vira o código do sistema", () => {
    const r = validarLinha("funcionarios", linha(), contexto());
    expect(r).toMatchObject({
      situacao: "ok",
      dados: { papel: "empreendimento_gestor", email: "ana@exemplo.com" },
    });
  });

  it("papel acima do de quem importa é erro", () => {
    const r = validarLinha(
      "funcionarios",
      linha(),
      contexto({ papelDoImportador: "recepcionista" }),
    );
    expect(r.situacao).toBe("erro");
    expect(r.problemas).toContain(
      "Você não pode convidar alguém com papel acima do seu.",
    );
  });

  it("Porteiro e Zelador viram recepcionista; Síndico vira auditor", () => {
    const porteiro = validarLinha(
      "funcionarios",
      linha({ Papel: "Porteiro" }),
      contexto(),
    );
    const sindico = validarLinha(
      "funcionarios",
      linha({ Papel: "Síndico", "E-mail": "s@x.com" }),
      contexto(),
    );
    expect(porteiro.dados).toMatchObject({ papel: "recepcionista" });
    expect(sindico.dados).toMatchObject({ papel: "auditor" });
  });
});

describe("validarLinha — autorizados", () => {
  const moradores = new Map([["A112", new Set(["helena prado"])]]);
  const linha = (extra: Record<string, string> = {}) => ({
    "Bloco/Torre/Quadra": "A",
    Unidade: "112",
    "Em nome de": "Helena Prado",
    "Nome do autorizado": "Roberto Prado",
    Relação: "Familiar",
    CPF: "529.982.247-25",
    "Vale até": "31/12/2026",
    ...extra,
  });

  it("linha boa vira ok, com CPF só em dígitos e a data em ISO", () => {
    const r = validarLinha(
      "autorizados",
      linha(),
      contexto({ moradoresPorUnidade: moradores }),
    );
    expect(r).toMatchObject({
      situacao: "ok",
      dados: { cpf: "52998224725", valeAte: "2026-12-31" },
    });
  });

  it("CPF inválido é erro", () => {
    const r = validarLinha(
      "autorizados",
      linha({ CPF: "111.111.111-11" }),
      contexto({ moradoresPorUnidade: moradores }),
    );
    expect(r.situacao).toBe("erro");
    expect(r.problemas).toContain("CPF inválido. Confira os números.");
  });

  it("'em nome de' sem morador ativo na unidade é erro", () => {
    const r = validarLinha(
      "autorizados",
      linha({ "Em nome de": "Fulano" }),
      contexto({ moradoresPorUnidade: moradores }),
    );
    expect(r.situacao).toBe("erro");
    expect(r.problemas[0]).toContain("Fulano");
  });

  it("data no passado e data malformada são erros", () => {
    const ctx = contexto({ moradoresPorUnidade: moradores });
    expect(
      validarLinha("autorizados", linha({ "Vale até": "01/10/2026" }), ctx)
        .problemas,
    ).toContain("A data precisa ser hoje ou depois.");
    expect(
      validarLinha("autorizados", linha({ "Vale até": "amanhã" }), ctx)
        .problemas,
    ).toContain("Data inválida. Use dia/mês/ano, ex.: 31/12/2026.");
  });

  it("CPF e data são opcionais", () => {
    const r = validarLinha(
      "autorizados",
      linha({ CPF: "", "Vale até": "" }),
      contexto({ moradoresPorUnidade: moradores }),
    );
    expect(r.situacao).toBe("ok");
  });
});

describe("validarLinha — áreas comuns", () => {
  it("nome obrigatório e código que já existe vira duplicado", () => {
    expect(
      validarLinha("areas_comuns", { Nome: " " }, contexto()).situacao,
    ).toBe("erro");

    const ctx = contexto({ codigosDeUnidade: new Set(["ACADEMIA"]) });
    expect(
      validarLinha("areas_comuns", { Nome: "Academia" }, ctx).situacao,
    ).toBe("duplicado");
  });

  it("linha boa fica ok", () => {
    const r = validarLinha(
      "areas_comuns",
      { Nome: "Salão de festas", Responsável: "Marta" },
      contexto(),
    );
    expect(r).toMatchObject({
      situacao: "ok",
      dados: { nome: "Salão de festas", responsavel: "Marta" },
    });
  });
});

describe("validarLinha — lojistas", () => {
  it("loja inexistente é erro; função fora da lista também", () => {
    const base = {
      "Piso/Bloco": "A",
      Loja: "112",
      "Nome da loja": "Padaria",
      "Nome do contato": "Rui",
      Função: "Responsável",
    };
    expect(validarLinha("lojistas", base, contexto()).situacao).toBe("ok");
    expect(
      validarLinha("lojistas", { ...base, Loja: "999" }, contexto()).situacao,
    ).toBe("erro");
    expect(
      validarLinha("lojistas", { ...base, Função: "Dono" }, contexto())
        .problemas,
    ).toContain("Função precisa ser Responsável ou Funcionário da loja.");
  });
});
