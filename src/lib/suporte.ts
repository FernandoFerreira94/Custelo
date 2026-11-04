import { env } from "@/lib/env";

// PROVISÓRIO: endereço de exemplo até o canal real ser definido. Para trocar,
// defina NEXT_PUBLIC_SUPORTE_URL (`mailto:...` ou `https://wa.me/...`); este
// valor deixa de valer assim que a variável existir.
const CANAL_PROVISORIO = "mailto:suporte@pacotezap.com.br";

/**
 * Contatos reais do diálogo de ajuda de /entrar. Vazio = botão de envio
 * escondido (pendência do Fernando: definir WhatsApp e e-mail de suporte).
 * `whatsapp` só com dígitos e DDI, ex.: "5511999999999".
 */
export const SUPORTE = { whatsapp: "", email: "" } as {
  whatsapp: string;
  email: string;
};

/** Único lugar que diz para onde vai o botão "Falar com o suporte". */
export const suporteUrl = env.NEXT_PUBLIC_SUPORTE_URL ?? CANAL_PROVISORIO;

/**
 * Link do canal com o código do erro já escrito na mensagem, para a pessoa não
 * precisar digitar. O código é o digest do erro, nunca dado pessoal.
 */
export function linkDeSuporte(codigo?: string, base = suporteUrl): string {
  if (!codigo) return base;
  const texto = `Aconteceu um erro no PacoteZap. Código: ${codigo}`;
  if (base.startsWith("mailto:")) {
    const assunto = encodeURIComponent("Erro no PacoteZap");
    return `${base}?subject=${assunto}&body=${encodeURIComponent(texto)}`;
  }
  return `${base}?text=${encodeURIComponent(texto)}`;
}
