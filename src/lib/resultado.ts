import type { ZodError } from "zod";

export type CodigoFalha =
  | "SEM_SESSAO"
  | "SEM_PERMISSAO"
  | "ENTRADA_INVALIDA"
  | "NAO_ENCONTRADO"
  | "CONFLITO"
  | "DUPLICADO"
  | "INDISPONIVEL";

export type Falha = {
  ok: false;
  codigo: CodigoFalha;
  mensagem: string;
  campos?: Record<string, string>;
};

export type Resultado<T> = { ok: true; data: T; mensagem?: string } | Falha;

export function sucesso<T>(data: T, mensagem?: string): Resultado<T> {
  return mensagem === undefined
    ? { ok: true, data }
    : { ok: true, data, mensagem };
}

export function falha(
  codigo: CodigoFalha,
  mensagem: string,
  campos?: Record<string, string>,
): Falha {
  return campos
    ? { ok: false, codigo, mensagem, campos }
    : { ok: false, codigo, mensagem };
}

export function falhaDeEntrada(erro: ZodError): Falha {
  const campos: Record<string, string> = {};
  for (const issue of erro.issues) {
    const chave = issue.path.join(".") || "_";
    if (!(chave in campos)) campos[chave] = issue.message;
  }
  return falha("ENTRADA_INVALIDA", "Confira os campos destacados.", campos);
}
