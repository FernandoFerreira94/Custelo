export type MotivoDoLink = "usado" | "vencido" | "invalido";

export const MENSAGEM_DO_LINK: Record<MotivoDoLink, string> = {
  usado: "Este link já foi usado. Peça um novo para entrar.",
  vencido: "Este link venceu. Peça um novo; ele vale por 1 hora.",
  invalido: "Não conseguimos abrir este link. Peça um novo.",
};

type ErroDeLink = { code?: unknown; message?: unknown };

/**
 * Classifica a falha do Supabase ao confirmar o link. O Supabase usa
 * `otp_expired` tanto para vencido quanto para já usado: só a mensagem separa.
 */
export function motivoDoLink(erro: unknown): MotivoDoLink {
  const { code, message } = (erro ?? {}) as ErroDeLink;
  const texto = typeof message === "string" ? message : "";

  if (
    code === "email_link_used" ||
    code === "flow_state_not_found" ||
    /already (been )?used|consumed/i.test(texto)
  ) {
    return "usado";
  }
  if (code === "otp_expired" || /expired/i.test(texto)) return "vencido";
  return "invalido";
}

export function ehMotivoDoLink(valor: unknown): valor is MotivoDoLink {
  return valor === "usado" || valor === "vencido" || valor === "invalido";
}
