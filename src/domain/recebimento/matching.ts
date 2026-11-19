import { normalizarCodigo } from "@/domain/estrutura/unidade";

import { normalizarTexto } from "./texto";

export type UnidadeMatching = {
  id: string;
  codigo: string;
  apelidos: readonly string[];
  bloco: string | null;
  numero: string | null;
};
export type PessoaMatching = {
  id: string;
  nome: string;
  unidadeId: string;
  ativo: boolean;
  encerradoEm?: Date | null;
};
export type CadastroMatching = {
  unidades: readonly UnidadeMatching[];
  pessoas: readonly PessoaMatching[];
};
export type EntradaMatching = {
  linhas: readonly string[];
  unidadeTexto: string | null;
  nomeTexto: string | null;
};
export type Confianca = "alta" | "media" | "baixa" | "nenhuma";
export type Alerta = "UNIDADE_AMBIGUA" | "NOME_NAO_BATE" | "EX_MORADOR";
export type Candidata = {
  unidadeId: string;
  pontos: number;
  motivo: "codigo" | "bloco_numero" | "numero_unico" | "numero_repetido";
};
export type Sugestao = {
  confianca: Confianca;
  unidadeId: string | null;
  pessoaId: string | null;
  candidatas: Candidata[];
  alertas: Alerta[];
  exMorador?: { pessoaId: string; encerradoEm: Date | null };
};

// Número solto só conta com prefixo de unidade: sem ele, seria CEP ou número da rua.
const UNID =
  "(?:APARTAMENTO|APTO|APT|AP|UNIDADE|UND|UN|CASA|CS|SALA|SL|LOJA|LJ|CONJUNTO|CONJ|CJ)";
const BLOCO = "(?:BLOCO|BLC|BL|TORRE|TR|QUADRA|QD|EDIFICIO|ED)";
const RE_BLOCO_NUM = new RegExp(
  `\\b${BLOCO} ([A-Z0-9]{1,3}) (?:${UNID} )?(\\d{1,5}[A-Z]?)\\b`,
  "g",
);
const RE_NUM_BLOCO = new RegExp(
  `\\b${UNID} (\\d{1,5}[A-Z]?)(?: ${BLOCO} ([A-Z0-9]{1,3}))?\\b`,
  "g",
);
const RE_CEP = /\b\d{5} ?\d{3}\b/g;
const PARTICULAS = new Set(["DE", "DA", "DO", "DAS", "DOS", "E"]);
/** A partir daqui o nome "bate" com a pessoa do cadastro. */
const FORTE = 0.75;

const semZeros = (n: string) => n.replace(/^0+(?=\d)/, "");

function tokensNome(s: string): string[] {
  return normalizarTexto(s)
    .split(" ")
    .filter((t) => t && !PARTICULAS.has(t));
}

/** Primeiro nome precisa bater; o resto conta por token (inicial "S" bate com "SOUZA"). */
export function similaridadeNome(lido: string, cadastro: string): number {
  const a = tokensNome(lido);
  const b = tokensNome(cadastro);
  if (!a.length || !b.length || a[0] !== b[0]) return 0;
  const restoA = a.slice(1);
  const restoB = b.slice(1);
  if (!restoA.length) return 0.5;
  const batem = restoA.filter((t) =>
    restoB.some((u) => (t.length === 1 ? u.startsWith(t) : u === t)),
  ).length;
  return 0.5 + 0.5 * (batem / restoA.length);
}

function candidatas(
  texto: string,
  unidades: readonly UnidadeMatching[],
): Candidata[] {
  const pontos = new Map<string, Candidata>();
  const marcar = (
    unidadeId: string,
    p: number,
    motivo: Candidata["motivo"],
  ) => {
    const atual = pontos.get(unidadeId);
    if (!atual || atual.pontos < p)
      pontos.set(unidadeId, { unidadeId, pontos: p, motivo });
  };

  // 1) Código ou apelido como sequência de 1 a 4 palavras ("B 304", "CASA 23", "BL B AP 304").
  const palavras = texto.split(" ");
  const indice = new Map<string, string>();
  for (const u of unidades) {
    for (const c of [u.codigo, ...u.apelidos]) {
      const n = normalizarCodigo(c);
      if (/[A-Z]/.test(n) && /\d/.test(n)) indice.set(n, u.id); // número puro não entra aqui
    }
  }
  for (let i = 0; i < palavras.length; i++) {
    for (let tam = 1; tam <= 4 && i + tam <= palavras.length; tam++) {
      const id = indice.get(palavras.slice(i, i + tam).join(""));
      if (id) marcar(id, 100, "codigo");
    }
  }

  // 2) Bloco + número, nas duas ordens.
  const pares: { bloco: string | null; numero: string }[] = [];
  for (const m of texto.matchAll(RE_BLOCO_NUM))
    pares.push({ bloco: m[1]!, numero: m[2]! });
  for (const m of texto.matchAll(RE_NUM_BLOCO))
    pares.push({ bloco: m[2] ?? null, numero: m[1]! });
  for (const { bloco, numero } of pares) {
    const mesmoNumero = unidades.filter(
      (u) => u.numero && semZeros(u.numero) === semZeros(numero),
    );
    if (bloco) {
      for (const u of mesmoNumero)
        if (u.bloco && normalizarCodigo(u.bloco) === bloco)
          marcar(u.id, 95, "bloco_numero");
    } else if (mesmoNumero.length === 1) {
      marcar(mesmoNumero[0]!.id, 70, "numero_unico");
    } else {
      for (const u of mesmoNumero) marcar(u.id, 40, "numero_repetido");
    }
  }
  return [...pontos.values()].sort((x, y) => y.pontos - x.pontos);
}

/**
 * Sugere o destino a partir do que a etiqueta diz. A unidade é o filtro primário;
 * o nome só desempata ou confirma (invariante 7). O texto é dado, nunca instrução:
 * nada aqui interpreta o conteúdo além de procurar código, bloco e número.
 */
export function sugerirDestino(
  entrada: EntradaMatching,
  cadastro: CadastroMatching,
): Sugestao {
  const texto = normalizarTexto(
    [entrada.unidadeTexto ?? "", ...entrada.linhas].join(" \n "),
  ).replace(RE_CEP, " ");
  const lista = candidatas(texto, cadastro.unidades);
  const vazio: Sugestao = {
    confianca: "nenhuma",
    unidadeId: null,
    pessoaId: null,
    candidatas: lista,
    alertas: [],
  };
  if (!lista.length) return vazio;

  const nome = entrada.nomeTexto?.trim() || null;
  const melhorPessoa = (unidadeId: string, ativo: boolean) =>
    nome
      ? cadastro.pessoas
          .filter((p) => p.unidadeId === unidadeId && p.ativo === ativo)
          .map((p) => ({ p, s: similaridadeNome(nome, p.nome) }))
          .filter((x) => x.s >= FORTE)
          .sort((a, b) => b.s - a.s)[0]?.p
      : undefined;

  // Empate no topo: o nome pode desempatar. Sem desempate, baixa.
  const topo = lista.filter((c) => c.pontos === lista[0]!.pontos);
  let escolhida = topo[0]!;
  let desempatePeloNome = false;
  if (topo.length > 1) {
    const comNome = topo.filter((c) => melhorPessoa(c.unidadeId, true));
    if (comNome.length !== 1)
      return { ...vazio, confianca: "baixa", alertas: ["UNIDADE_AMBIGUA"] };
    escolhida = comNome[0]!;
    desempatePeloNome = true;
  }

  const pessoa = melhorPessoa(escolhida.unidadeId, true) ?? null;
  const ex = !pessoa ? melhorPessoa(escolhida.unidadeId, false) : undefined;
  const alertas: Alerta[] = [];
  if (nome && !pessoa) alertas.push(ex ? "EX_MORADOR" : "NOME_NAO_BATE");

  const confianca: Confianca =
    escolhida.pontos >= 90 && !alertas.length && !desempatePeloNome
      ? "alta"
      : escolhida.pontos >= 40
        ? "media"
        : "baixa";

  return {
    confianca,
    unidadeId: escolhida.unidadeId,
    pessoaId: pessoa?.id ?? null,
    candidatas: lista,
    alertas,
    ...(ex
      ? { exMorador: { pessoaId: ex.id, encerradoEm: ex.encerradoEm ?? null } }
      : {}),
  };
}
