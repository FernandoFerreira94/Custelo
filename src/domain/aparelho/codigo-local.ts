/** Sem 0/O/1/I: o código é lido em voz alta e impresso (D20). Igual ao check da 0014. */
export const ALFABETO_DO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const TAMANHO_DO_CODIGO = 6;

const FORMATO = /^[A-HJ-NP-Z2-9]{6}$/;

/** `sortear(n)` devolve um inteiro em [0, n); em produção vem de `crypto.randomInt`. */
export function gerarCodigoLocal(sortear: (limite: number) => number): string {
  let codigo = "";
  for (let i = 0; i < TAMANHO_DO_CODIGO; i++) {
    codigo += ALFABETO_DO_CODIGO[sortear(ALFABETO_DO_CODIGO.length)];
  }
  return codigo;
}

/** Aceita "abc 234" ou "ABC-234". Devolve null quando não tem o formato. */
export function normalizarCodigoDigitado(texto: string): string | null {
  const codigo = texto.toUpperCase().replace(/[\s-]/g, "");
  return FORMATO.test(codigo) ? codigo : null;
}
