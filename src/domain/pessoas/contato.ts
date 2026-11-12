import { falha, type Resultado, sucesso } from "@/lib/resultado";

export type StatusDoContato = "valido" | "falha" | "precisa_confirmacao";

export type Contato = {
  id: string;
  canal: "whatsapp" | "email";
  /** Valor normalizado (E.164 ou e-mail em minúsculas). */
  valor: string;
  status: StatusDoContato;
  ordem: number;
  /** Quando o gestor registrou, ou quando a pessoa deu opt-in. Nunca vem da planilha. */
  consentimentoEm: Date | null;
};

const MENSAGEM_WHATSAPP = "WhatsApp precisa ser celular com DDD (11 dígitos).";

/** Celular brasileiro com DDD, ou número estrangeiro escrito com "+". Devolve E.164. */
export function normalizarWhatsapp(texto: string): Resultado<string> {
  const limpo = texto.trim();
  const digitos = limpo.replace(/\D/g, "");
  const invalido = falha("ENTRADA_INVALIDA", MENSAGEM_WHATSAPP);

  if (limpo.startsWith("+")) {
    if (digitos.startsWith("55")) {
      return digitos.length === 13 ? sucesso(`+${digitos}`) : invalido;
    }
    return digitos.length >= 8 && digitos.length <= 15
      ? sucesso(`+${digitos}`)
      : invalido;
  }
  if (digitos.length === 11) return sucesso(`+55${digitos}`);
  if (digitos.length === 13 && digitos.startsWith("55")) {
    return sucesso(`+${digitos}`);
  }
  return invalido;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizarEmail(texto: string): Resultado<string> {
  const email = texto.trim().toLowerCase();
  return EMAIL.test(email)
    ? sucesso(email)
    : falha("ENTRADA_INVALIDA", "Informe um e-mail válido.");
}
