import type { PapelCodigo } from "@/application/permissoes";
import {
  montarCodigo,
  normalizarApelidos,
  normalizarCodigo,
  semAcento,
  type TipoUnidade,
} from "@/domain/estrutura/unidade";
import { normalizarEmail, normalizarWhatsapp } from "@/domain/pessoas/contato";
import { validarCpf } from "@/domain/pessoas/cpf";
import { nomeNormalizado } from "@/domain/pessoas/nome";

import { chaveDoCabecalho, type Cadastro } from "./colunas";

export type SituacaoDaLinha = "ok" | "aviso" | "erro" | "duplicado";

export type LinhaValidada = {
  situacao: SituacaoDaLinha;
  problemas: string[];
  /** Já normalizados: é isto que vai para a tabela de conferência e, depois, para o cadastro. */
  dados: Record<string, unknown>;
};

export type ContextoDeValidacao = {
  /** Códigos de unidade que já existem, normalizados (`A112`). */
  codigosDeUnidade: ReadonlySet<string>;
  /** Unidade normalizada → pessoas ativas dela, como `nome normalizado|whatsapp`. */
  pessoasPorUnidade: ReadonlyMap<string, ReadonlySet<string>>;
  /** Unidade normalizada → nomes normalizados dos moradores ativos (para "em nome de"). */
  moradoresPorUnidade: ReadonlyMap<string, ReadonlySet<string>>;
  papelDoImportador: PapelCodigo;
  hoje: Date;
  /** Chaves já vistas NESTE arquivo. É mutado de propósito: a ordem das linhas importa. */
  vistos: Set<string>;
};

type Dados = Record<string, string>;

const TIPOS_DE_UNIDADE: Record<string, TipoUnidade> = {
  apartamento: "apartamento",
  casa: "casa",
  loja: "loja",
  sala: "sala",
  outro: "outro",
};

const PAPEIS_DE_MORADOR = {
  titular: "titular",
  morador: "morador",
  inquilino: "inquilino",
} as const;

const PAPEIS_DE_FUNCIONARIO: Record<string, PapelCodigo> = {
  porteiro: "recepcionista",
  zelador: "recepcionista",
  sindico: "auditor",
  gestor: "empreendimento_gestor",
};

const NIVEL_DO_PAPEL: Record<PapelCodigo, number> = {
  recepcionista: 1,
  auditor: 1,
  empreendimento_gestor: 2,
  org_admin: 3,
  platform_super_admin: 4,
};

const RELACOES = ["Familiar", "Diarista", "Vizinho", "Outro"] as const;
const FUNCOES_DE_LOJA = {
  responsavel: "Responsável",
  funcionariodaloja: "Funcionário da loja",
} as const;

const texto = (dados: Dados, cabecalho: string) =>
  (dados[cabecalho] ?? "").trim();

/** Procura a opção pela chave sem acento nem caixa; devolve o valor da lista ou null. */
function escolher<T>(valor: string, opcoes: Record<string, T>): T | null {
  return opcoes[chaveDoCabecalho(valor)] ?? null;
}

/** Fecha o resultado: erro vence duplicado, que vence aviso. */
function fechar(
  dados: Record<string, unknown>,
  erros: string[],
  duplicado: string | null,
  avisos: string[] = [],
): LinhaValidada {
  if (erros.length > 0) return { situacao: "erro", problemas: erros, dados };
  if (duplicado) {
    return { situacao: "duplicado", problemas: [duplicado, ...avisos], dados };
  }
  return avisos.length > 0
    ? { situacao: "aviso", problemas: avisos, dados }
    : { situacao: "ok", problemas: [], dados };
}

/** Acha a unidade já cadastrada: o mesmo número pode ser apartamento, casa, loja ou sala. */
function acharUnidade(
  ctx: ContextoDeValidacao,
  bloco: string,
  numero: string,
): { existe: boolean; codigo: string; normalizado: string } {
  const candidatos = (
    ["apartamento", "casa", "loja", "sala", "outro"] as const
  ).map((tipo) => semAcento(montarCodigo({ bloco, numero, tipo })));
  const achado = candidatos.find((c) =>
    ctx.codigosDeUnidade.has(normalizarCodigo(c)),
  );
  const codigo = achado ?? candidatos[0]!;
  return {
    existe: achado !== undefined,
    codigo,
    normalizado: normalizarCodigo(codigo),
  };
}

function lerData(valor: string, hoje: Date): { iso?: string; erro?: string } {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(valor);
  if (!m) return { erro: "Data inválida. Use dia/mês/ano, ex.: 31/12/2026." };
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const data = new Date(Date.UTC(ano!, mes! - 1, dia));
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes! - 1 ||
    data.getUTCDate() !== dia
  ) {
    return { erro: "Data inválida. Use dia/mês/ano, ex.: 31/12/2026." };
  }
  const inicioDeHoje = Date.UTC(
    hoje.getUTCFullYear(),
    hoje.getUTCMonth(),
    hoje.getUTCDate(),
  );
  if (data.getTime() < inicioDeHoje) {
    return { erro: "A data precisa ser hoje ou depois." };
  }
  return { iso: data.toISOString().slice(0, 10) };
}

/** Contato opcional (WhatsApp e e-mail): vazio passa; preenchido e ruim vira erro com o texto do domínio. */
function lerContatos(dados: Dados, erros: string[]) {
  const saida: { whatsapp?: string; email?: string } = {};
  const whatsapp = texto(dados, "WhatsApp");
  if (whatsapp) {
    const r = normalizarWhatsapp(whatsapp);
    if (r.ok) saida.whatsapp = r.data;
    else erros.push(r.mensagem);
  }
  const email = texto(dados, "E-mail");
  if (email) {
    const r = normalizarEmail(email);
    if (r.ok) saida.email = r.data;
    else erros.push(r.mensagem);
  }
  return saida;
}

function validarUnidade(dados: Dados, ctx: ContextoDeValidacao): LinhaValidada {
  const erros: string[] = [];
  let duplicado: string | null = null;

  const tipo = escolher(texto(dados, "Tipo"), TIPOS_DE_UNIDADE);
  if (!tipo) {
    erros.push("Tipo precisa ser Apartamento, Casa, Loja, Sala ou Outro.");
  }
  const numero = texto(dados, "Número");
  if (!numero) erros.push("Informe o número da unidade.");

  const andarTexto = texto(dados, "Andar");
  let andar: number | null = null;
  if (andarTexto) {
    if (/^-?\d+$/.test(andarTexto)) andar = Number(andarTexto);
    else erros.push("Andar precisa ser um número.");
  }

  let codigo = "";
  let apelidos: string[] = [];
  if (tipo && numero) {
    codigo = semAcento(
      montarCodigo({ bloco: texto(dados, "Bloco/Torre/Quadra"), numero, tipo }),
    );
    apelidos = normalizarApelidos(
      texto(dados, "Como aparece na etiqueta")
        .split(";")
        .map((a) => a.trim()),
      codigo,
    );
    const normalizado = normalizarCodigo(codigo);
    if (ctx.vistos.has(`u:${normalizado}`)) {
      erros.push(`O código ${codigo} já aparece mais acima no arquivo.`);
    } else {
      ctx.vistos.add(`u:${normalizado}`);
      if (ctx.codigosDeUnidade.has(normalizado)) {
        duplicado = `A unidade ${codigo} já existe.`;
      }
    }
  }

  return fechar(
    {
      tipo,
      bloco: texto(dados, "Bloco/Torre/Quadra") || null,
      numero,
      andar,
      apelidos,
      codigo,
    },
    erros,
    duplicado,
  );
}

function validarMorador(dados: Dados, ctx: ContextoDeValidacao): LinhaValidada {
  const erros: string[] = [];
  let duplicado: string | null = null;

  const nome = texto(dados, "Nome completo").replace(/\s+/g, " ");
  if (!nome) erros.push("Informe o nome completo.");

  const papel = escolher(texto(dados, "Papel"), PAPEIS_DE_MORADOR);
  if (!papel) erros.push("Papel precisa ser Titular, Morador ou Inquilino.");

  const unidadeTexto = texto(dados, "Unidade");
  const unidade = unidadeTexto
    ? acharUnidade(ctx, texto(dados, "Bloco/Torre/Quadra"), unidadeTexto)
    : null;
  if (!unidade) erros.push("Informe a unidade.");
  else if (!unidade.existe) {
    erros.push(
      `Unidade ${unidade.codigo} não existe. Importe as unidades antes.`,
    );
  }

  const contatos = lerContatos(dados, erros);

  if (unidade?.existe && nome) {
    const chave = `${nomeNormalizado(nome)}|${contatos.whatsapp ?? ""}`;
    if (ctx.vistos.has(`m:${unidade.normalizado}|${chave}`)) {
      erros.push(
        "Esta pessoa já aparece mais acima no arquivo para a mesma unidade.",
      );
    } else {
      ctx.vistos.add(`m:${unidade.normalizado}|${chave}`);
      if (ctx.pessoasPorUnidade.get(unidade.normalizado)?.has(chave)) {
        duplicado = `${nome} já está cadastrada na unidade ${unidade.codigo}.`;
      }
    }
  }

  // Consentimento não existe aqui de propósito: só o gestor (ou o opt-in) o registra.
  return fechar(
    { unidadeCodigo: unidade?.codigo ?? "", nome, papel, ...contatos },
    erros,
    duplicado,
  );
}

function validarLojista(dados: Dados, ctx: ContextoDeValidacao): LinhaValidada {
  const erros: string[] = [];

  const loja = texto(dados, "Loja");
  const unidade = loja
    ? acharUnidade(ctx, texto(dados, "Piso/Bloco"), loja)
    : null;
  if (!unidade) erros.push("Informe a loja.");
  else if (!unidade.existe) {
    erros.push(`Loja ${unidade.codigo} não existe. Importe as unidades antes.`);
  }
  const nomeDaLoja = texto(dados, "Nome da loja");
  if (!nomeDaLoja) erros.push("Informe o nome da loja.");
  const contato = texto(dados, "Nome do contato").replace(/\s+/g, " ");
  if (!contato) erros.push("Informe o nome do contato.");
  const funcao = escolher(texto(dados, "Função"), FUNCOES_DE_LOJA);
  if (!funcao)
    erros.push("Função precisa ser Responsável ou Funcionário da loja.");

  const contatos = lerContatos(dados, erros);
  return fechar(
    {
      unidadeCodigo: unidade?.codigo ?? "",
      nomeDaLoja,
      nome: contato,
      funcao,
      ...contatos,
    },
    erros,
    null,
  );
}

function validarFuncionario(
  dados: Dados,
  ctx: ContextoDeValidacao,
): LinhaValidada {
  const erros: string[] = [];

  const nome = texto(dados, "Nome completo").replace(/\s+/g, " ");
  if (!nome) erros.push("Informe o nome completo.");

  const papel = escolher(texto(dados, "Papel"), PAPEIS_DE_FUNCIONARIO);
  if (!papel) {
    erros.push("Papel precisa ser Porteiro, Zelador, Síndico ou Gestor.");
  } else if (NIVEL_DO_PAPEL[papel] > NIVEL_DO_PAPEL[ctx.papelDoImportador]) {
    erros.push("Você não pode convidar alguém com papel acima do seu.");
  }

  let email = "";
  const lido = normalizarEmail(texto(dados, "E-mail"));
  if (lido.ok) email = lido.data;
  else erros.push(lido.mensagem);

  if (email) {
    if (ctx.vistos.has(`f:${email}`)) {
      erros.push("Este e-mail já aparece mais acima no arquivo.");
    } else {
      ctx.vistos.add(`f:${email}`);
    }
  }
  return fechar({ nome, email, papel }, erros, null);
}

function validarAutorizado(
  dados: Dados,
  ctx: ContextoDeValidacao,
): LinhaValidada {
  const erros: string[] = [];

  const unidadeTexto = texto(dados, "Unidade");
  const unidade = unidadeTexto
    ? acharUnidade(ctx, texto(dados, "Bloco/Torre/Quadra"), unidadeTexto)
    : null;
  if (!unidade) erros.push("Informe a unidade.");
  else if (!unidade.existe) {
    erros.push(
      `Unidade ${unidade.codigo} não existe. Importe as unidades antes.`,
    );
  }

  const emNomeDe = texto(dados, "Em nome de").replace(/\s+/g, " ");
  if (!emNomeDe) erros.push("Informe em nome de quem a pessoa retira.");
  else if (
    unidade?.existe &&
    !ctx.moradoresPorUnidade
      .get(unidade.normalizado)
      ?.has(nomeNormalizado(emNomeDe))
  ) {
    erros.push(`${emNomeDe} não é morador ativo da unidade ${unidade.codigo}.`);
  }

  const nome = texto(dados, "Nome do autorizado").replace(/\s+/g, " ");
  if (!nome) erros.push("Informe o nome do autorizado.");

  const relacaoTexto = texto(dados, "Relação");
  const relacao = relacaoTexto
    ? (RELACOES.find(
        (r) => chaveDoCabecalho(r) === chaveDoCabecalho(relacaoTexto),
      ) ?? null)
    : null;
  if (relacaoTexto && !relacao) {
    erros.push("Relação precisa ser Familiar, Diarista, Vizinho ou Outro.");
  }

  let cpf: string | null = null;
  const cpfTexto = texto(dados, "CPF");
  if (cpfTexto) {
    const r = validarCpf(cpfTexto);
    if (r.ok) cpf = r.data;
    else erros.push(r.mensagem);
  }

  let valeAte: string | null = null;
  const valeTexto = texto(dados, "Vale até");
  if (valeTexto) {
    const r = lerData(valeTexto, ctx.hoje);
    if (r.iso) valeAte = r.iso;
    else erros.push(r.erro!);
  }

  return fechar(
    {
      unidadeCodigo: unidade?.codigo ?? "",
      emNomeDe,
      nome,
      relacao,
      cpf,
      valeAte,
    },
    erros,
    null,
  );
}

function validarAreaComum(
  dados: Dados,
  ctx: ContextoDeValidacao,
): LinhaValidada {
  const erros: string[] = [];
  let duplicado: string | null = null;

  const nome = texto(dados, "Nome").replace(/\s+/g, " ");
  if (!nome) erros.push("Informe o nome da área.");
  const codigo = semAcento(nome);
  if (nome) {
    const normalizado = normalizarCodigo(codigo);
    if (ctx.vistos.has(`a:${normalizado}`)) {
      erros.push(`A área ${nome} já aparece mais acima no arquivo.`);
    } else {
      ctx.vistos.add(`a:${normalizado}`);
      if (ctx.codigosDeUnidade.has(normalizado)) {
        duplicado = `A área ${nome} já existe.`;
      }
    }
  }
  return fechar(
    {
      nome,
      codigo,
      bloco: texto(dados, "Bloco/Torre/Quadra") || null,
      responsavel: texto(dados, "Responsável") || null,
      observacao: texto(dados, "Observação") || null,
    },
    erros,
    duplicado,
  );
}

/**
 * Valida UMA linha já mapeada para os cabeçalhos oficiais. Pura, salvo `contexto.vistos`,
 * que acumula o que o arquivo já trouxe. Nada aqui grava no banco.
 */
export function validarLinha(
  cadastro: Cadastro,
  dados: Dados,
  contexto: ContextoDeValidacao,
): LinhaValidada {
  switch (cadastro) {
    case "unidades":
      return validarUnidade(dados, contexto);
    case "moradores":
      return validarMorador(dados, contexto);
    case "lojistas":
      return validarLojista(dados, contexto);
    case "funcionarios":
      return validarFuncionario(dados, contexto);
    case "autorizados":
      return validarAutorizado(dados, contexto);
    case "areas_comuns":
      return validarAreaComum(dados, contexto);
  }
}
