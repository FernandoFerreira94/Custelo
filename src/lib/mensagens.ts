/**
 * Catálogo único de mensagens ao usuário (padrão de 04/11/2026).
 * Toda mensagem diz o que aconteceu e o que fazer. Nunca "erro" sozinho.
 */
export const MSG = {
  semConexao: "Sem conexão. Verifique a internet e tente de novo.",
  instavel: "O PacoteZap está instável agora. Tente de novo em alguns minutos.",
  muitasTentativas: "Muitas tentativas. Aguarde 1 minuto e tente de novo.",
  sessaoExpirada: "Sua sessão terminou. Entre de novo para continuar.",
  semPermissao: "Seu perfil não pode fazer isso. Fale com o gestor.",
  inesperado:
    "Algo deu errado. Tente de novo; se continuar, fale com o suporte.",
} as const;

type ErroComStatus = { status?: unknown; name?: unknown; code?: unknown };

function estaOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Converte qualquer falha (exceção, erro do Supabase, fetch) em texto para a pessoa. */
export function mensagemDeFalha(erro: unknown): string {
  if (estaOffline()) return MSG.semConexao;

  const e = (erro ?? {}) as ErroComStatus;
  const status = typeof e.status === "number" ? e.status : undefined;
  const nome = typeof e.name === "string" ? e.name : "";

  if (status === 429 || e.code === "over_request_rate_limit") {
    return MSG.muitasTentativas;
  }
  if (status === 401) return MSG.sessaoExpirada;
  if (status === 403) return MSG.semPermissao;
  if (
    nome === "AuthRetryableFetchError" ||
    // name em vez de instanceof: o TypeError pode vir de outro realm (fetch do runtime).
    (nome === "TypeError" &&
      /fetch|network/i.test(String((erro as Error).message)))
  ) {
    return MSG.semConexao;
  }
  if (status !== undefined && status >= 500) return MSG.instavel;
  return MSG.inesperado;
}

/**
 * Executa uma ação de formulário e nunca deixa estourar sem mensagem.
 * Falha vira `{ ok: false, message }` com o texto certo.
 */
export async function comMensagemDeFalha<T extends { ok: boolean }>(
  acao: () => Promise<T>,
): Promise<T | { ok: false; message: string }> {
  try {
    return await acao();
  } catch (erro) {
    return { ok: false, message: mensagemDeFalha(erro) };
  }
}
