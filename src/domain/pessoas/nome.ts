/** Nome para comparar: sem acento, minúsculas, espaços únicos. Nunca é gravado assim. */
export function nomeNormalizado(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
