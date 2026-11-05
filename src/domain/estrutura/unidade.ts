export type TipoUnidade =
  "apartamento" | "casa" | "sala" | "loja" | "area_comum" | "outro";

/** Mesma regra da coluna gerada unidades.codigo_normalizado (0011). */
export function normalizarCodigo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

const PREFIXO_SEM_BLOCO: Partial<Record<TipoUnidade, string>> = {
  casa: "Casa",
  loja: "Loja",
  sala: "Sala",
};

export function montarCodigo(e: {
  bloco?: string | null;
  numero: string;
  tipo: TipoUnidade;
}): string {
  const numero = e.numero.trim();
  const bloco = e.bloco?.trim();
  if (bloco) return `${bloco}-${numero}`;
  const prefixo = PREFIXO_SEM_BLOCO[e.tipo];
  return prefixo && /^\d/.test(numero) ? `${prefixo} ${numero}` : numero;
}

export function normalizarApelidos(
  lista: readonly string[],
  codigo: string,
): string[] {
  const proprio = normalizarCodigo(codigo);
  const vistos = new Set<string>([proprio]);
  const saida: string[] = [];
  for (const bruto of lista) {
    const texto = bruto.trim().replace(/\s+/g, " ");
    const chave = normalizarCodigo(texto);
    if (!chave || vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(texto);
  }
  return saida;
}
