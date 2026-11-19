import "server-only";

import { sql } from "drizzle-orm";

import type { Contexto } from "@/application/auth/contexto";
import type { LeituraRepo } from "@/application/recebimento/ports";
import type { CadastroMatching } from "@/domain/recebimento/matching";
import { withTenantDb } from "@/infrastructure/db/tenant-db";

const tenant = (ctx: Contexto) => ({
  orgId: ctx.orgId,
  empreendimentoId: ctx.empreendimentoId,
  userId: ctx.usuarioId,
});
const linhas = <T>(r: unknown) => Array.from(r as Iterable<T>);

/** "B-304" → bloco "B", número "304"; "Casa 23" → sem bloco, número "23". */
export function blocoENumero(codigo: string): {
  bloco: string | null;
  numero: string | null;
} {
  const numero = /(\d+[A-Z]?)\s*$/i.exec(codigo)?.[1] ?? null;
  const comBloco = /^([A-Z0-9]{1,3})\s*[-/ ]\s*\d+[A-Z]?$/i.exec(codigo.trim());
  const ehPrefixoDeTipo = /^(CASA|SALA|LOJA|AP|APTO)$/i.test(
    comBloco?.[1] ?? "",
  );
  return {
    bloco: comBloco && !ehPrefixoDeTipo ? comBloco[1]!.toUpperCase() : null,
    numero,
  };
}

// Cadastro do empreendimento em cache por 60 s: o lote da manhã lê dezenas de
// etiquetas seguidas. Chave = empreendimento; quem muda o cadastro chama `esquecer`.
const CACHE_MS = 60_000;
const cache = new Map<string, { ate: number; dado: CadastroMatching }>();
export const esquecerCadastro = (empreendimentoId: string) =>
  cache.delete(empreendimentoId);

export const leituraRepo: LeituraRepo = {
  async configLeitura(ctx) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [r] = linhas<{
        leitura_automatica: boolean;
        leituras_por_dia: number;
        hoje: number;
      }>(
        await db.execute(sql`
          select c.leitura_automatica, c.leituras_por_dia,
            (select count(*)::int from leituras_etiqueta l
              where l.empreendimento_id = c.empreendimento_id
                and l.created_at >= date_trunc('day', now() at time zone c.fuso) at time zone c.fuso
            ) as hoje
          from empreendimento_config c
          where c.empreendimento_id = ${ctx.empreendimentoId}::uuid`),
      );
      return {
        leituraAutomatica: r?.leitura_automatica ?? true,
        leiturasPorDia: r?.leituras_por_dia ?? 600,
        leiturasHoje: r?.hoje ?? 0,
      };
    });
  },

  async cadastroMatching(ctx) {
    const guardado = cache.get(ctx.empreendimentoId);
    if (guardado && guardado.ate > Date.now()) return guardado.dado;
    const dado = await withTenantDb(tenant(ctx), async (db) => {
      const unidades = linhas<{
        id: string;
        codigo: string;
        apelidos: string[];
        numero: string | null;
      }>(
        await db.execute(sql`
          select id, codigo, apelidos, numero from unidades
          where empreendimento_id = ${ctx.empreendimentoId}::uuid and ativo`),
      );
      const pessoas = linhas<{
        id: string;
        nome: string;
        unidade_id: string;
        ativo: boolean;
        encerrado_em: Date | null;
      }>(
        await db.execute(sql`
          select p.id, p.nome, v.unidade_id, (v.status = 'ativo') as ativo,
            case when v.status = 'ativo' then null else coalesce(v.vigencia_fim, v.updated_at) end as encerrado_em
          from vinculos v join pessoas p on p.id = v.pessoa_id
          where v.empreendimento_id = ${ctx.empreendimentoId}::uuid
            and (v.status = 'ativo'
                 or coalesce(v.vigencia_fim, v.updated_at) >= now() - interval '12 months')`),
      );
      return {
        unidades: unidades.map((u) => {
          const bn = blocoENumero(u.codigo);
          return {
            id: u.id,
            codigo: u.codigo,
            apelidos: u.apelidos,
            bloco: bn.bloco,
            numero: u.numero ?? bn.numero,
          };
        }),
        pessoas: pessoas.map((p) => ({
          id: p.id,
          nome: p.nome,
          unidadeId: p.unidade_id,
          ativo: p.ativo,
          encerradoEm: p.encerrado_em ? new Date(p.encerrado_em) : null,
        })),
      } satisfies CadastroMatching;
    });
    cache.set(ctx.empreendimentoId, { ate: Date.now() + CACHE_MS, dado });
    return dado;
  },

  async gravarLeitura(ctx, l) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [r] = linhas<{ id: string }>(
        await db.execute(sql`
          insert into leituras_etiqueta (org_id, empreendimento_id, provedor, modelo, versao_prompt,
            latencia_ms, resultado, confianca, unidade_lida, nome_lido, unidade_sugerida_id,
            pessoa_sugerida_id, tokens_entrada, tokens_saida, custo_micro_usd)
          values (${ctx.orgId}::uuid, ${ctx.empreendimentoId}::uuid, ${l.provedor}, ${l.modelo},
            ${l.versaoPrompt}, ${l.latenciaMs}, ${l.resultado}, ${l.confianca}, ${l.unidadeLida},
            ${l.nomeLido}, ${l.unidadeSugeridaId}::uuid, ${l.pessoaSugeridaId}::uuid,
            ${l.tokensEntrada}, ${l.tokensSaida}, ${l.custoMicroUsd})
          returning id`),
      );
      return r!.id;
    });
  },
};
