/** Só caminho interno (`/x`), nunca `//host` nem URL completa: evita redirect aberto. */
export function caminhoInterno(
  valor: string | undefined,
  padrao = "/",
): string {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//")) return padrao;
  if (valor.includes("\\") || /[\r\n]/.test(valor)) return padrao;
  return valor;
}
