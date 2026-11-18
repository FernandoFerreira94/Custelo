import { z } from "zod";

import type { Auditoria } from "@/application/auditoria/ports";
import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import { MSG_CUSTODIA } from "@/lib/mensagens";
import {
  falha,
  falhaDeEntrada,
  type Resultado,
  sucesso,
} from "@/lib/resultado";

import type { LocaisRepo, PlanoPrateleiras } from "./ports";

/** Fonte única: a action e o form do ponto (UNI-004) usam o mesmo esquema. */
export const esquemaDePrateleiras = z
  .array(
    z.object({
      id: z.uuid().optional(),
      codigo: z
        .string()
        .trim()
        .min(1, "Dê um nome à prateleira.")
        .max(20, "No máximo 20 caracteres."),
      capacidade: z
        .number()
        .int()
        .min(1, "Capacidade mínima é 1.")
        .max(999, "Capacidade máxima é 999.")
        .nullable(),
      volumeGrande: z.boolean().default(false),
    }),
  )
  .max(100, "No máximo 100 prateleiras por ponto.");

const chave = (codigo: string) => codigo.trim().toUpperCase();

/**
 * Salva a lista inteira de prateleiras do ponto: cria, atualiza e desativa numa
 * transação. Prateleira com encomenda ativa não sai (mova antes).
 */
export async function salvarPrateleiras(
  ctx: Contexto,
  pontoId: string,
  entrada: unknown,
  deps: { repo: LocaisRepo; auditoria: Auditoria },
): Promise<Resultado<{ ativas: number }>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const lido = esquemaDePrateleiras.safeParse(entrada);
  if (!lido.success) return falhaDeEntrada(lido.error);
  const lista = lido.data;

  const vistos = new Set<string>();
  for (const p of lista) {
    if (vistos.has(chave(p.codigo)))
      return falha(
        "DUPLICADO",
        `Já existe a prateleira ${p.codigo} neste ponto.`,
      );
    vistos.add(chave(p.codigo));
  }

  const atuais = await deps.repo.locaisDoPonto(ctx, pontoId);
  if (!atuais)
    return falha("NAO_ENCONTRADO", "Não achamos esse ponto de recebimento.");

  const idsAtuais = new Set(atuais.map((l) => l.id));
  const mantidos = new Set(lista.flatMap((p) => (p.id ? [p.id] : [])));
  if ([...mantidos].some((id) => !idsAtuais.has(id)))
    return falha(
      "CONFLITO",
      "A lista de prateleiras mudou. Atualize a página e tente de novo.",
    );

  const removidas = atuais.filter((l) => !mantidos.has(l.id));
  const comEncomenda = removidas.reduce((n, l) => n + l.usado, 0);
  if (comEncomenda > 0)
    return falha("CONFLITO", MSG_CUSTODIA.prateleiraComEncomenda(comEncomenda));

  const plano: PlanoPrateleiras = {
    criar: lista.filter((p) => !p.id),
    atualizar: lista.flatMap((p) => (p.id ? [{ ...p, id: p.id }] : [])),
    desativar: removidas.map((l) => l.id),
  };
  const aplicado = await deps.repo.aplicarPrateleiras(ctx, pontoId, plano);
  if (aplicado.comEncomenda > 0)
    return falha(
      "CONFLITO",
      MSG_CUSTODIA.prateleiraComEncomenda(aplicado.comEncomenda),
    );

  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "PRATELEIRAS_SALVAS",
    alvoTipo: "ponto_recebimento",
    alvoId: pontoId,
    depois: {
      criadas: plano.criar.length,
      atualizadas: plano.atualizar.length,
      desativadas: plano.desativar.length,
    },
    origem: "web",
  });
  return sucesso({ ativas: lista.length }, "Prateleiras salvas.");
}
