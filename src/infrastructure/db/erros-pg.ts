import * as Sentry from "@sentry/nextjs";

import { MSG } from "@/lib/mensagens";
import { type Falha, falha } from "@/lib/resultado";

/** O drizzle embrulha o erro do driver em `cause`; o código do Postgres está num dos dois. */
export function codigoPg(erro: unknown): string | undefined {
  const e = erro as { code?: unknown; cause?: { code?: unknown } } | null;
  const codigo = e?.code ?? e?.cause?.code;
  return typeof codigo === "string" ? codigo : undefined;
}

/**
 * Traduz o erro do banco para a falha que a tela entende (tabela da Task 3.6).
 * Devolve `null` quando não é um erro que o cadastro sabe explicar.
 */
export function falhaDeErroPg(erro: unknown): Falha | null {
  switch (codigoPg(erro)) {
    case "23505":
      return falha("DUPLICADO", "Já existe um cadastro igual a este.");
    case "23503":
      // Referência a algo de outro empreendimento: ou é bug, ou é tentativa. Avisa a observabilidade.
      Sentry.captureMessage("cross_tenant_negado", {
        tags: { cross_tenant: "true" },
      });
      return falha(
        "ENTRADA_INVALIDA",
        "Esse item não pertence a este empreendimento. Atualize a página e escolha de novo.",
      );
    case "23514":
      return falha("ENTRADA_INVALIDA", MSG.dadosInvalidos);
    case "42501":
      Sentry.captureMessage("cross_tenant_negado", {
        tags: { cross_tenant: "true" },
      });
      return falha("SEM_PERMISSAO", MSG.semPermissao);
    default:
      return null;
  }
}
