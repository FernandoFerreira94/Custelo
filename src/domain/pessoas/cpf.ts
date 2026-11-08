import { falha, type Resultado, sucesso } from "@/lib/resultado";

const MENSAGEM = "CPF inválido. Confira os números.";

function digitoVerificador(base: string): number {
  const peso = base.length + 1;
  const soma = [...base].reduce((acc, d, i) => acc + Number(d) * (peso - i), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/** Devolve os 11 dígitos. O CPF nunca vai para log, analytics ou auditoria. */
export function validarCpf(texto: string): Resultado<string> {
  const digitos = texto.replace(/\D/g, "");
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
    return falha("ENTRADA_INVALIDA", MENSAGEM);
  }
  const d1 = digitoVerificador(digitos.slice(0, 9));
  const d2 = digitoVerificador(digitos.slice(0, 10));
  return d1 === Number(digitos[9]) && d2 === Number(digitos[10])
    ? sucesso(digitos)
    : falha("ENTRADA_INVALIDA", MENSAGEM);
}

/** "52998224725" → "***.982.247-**" (só o miolo aparece). */
export function mascararCpf(digitos: string): string {
  return `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`;
}

/** "52998224725" → "529.982.247-25" (só para quem pediu para ver, e a visualização é auditada). */
export function formatarCpf(digitos: string): string {
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}
