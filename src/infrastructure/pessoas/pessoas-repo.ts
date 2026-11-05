import "server-only";

import { and, asc, eq, gt, ilike, inArray, or, sql } from "drizzle-orm";

import type { Contexto } from "@/application/auth/contexto";
import { nomeNormalizado } from "@/application/pessoas/nome";
import type { PessoaBruta, PessoasRepo } from "@/application/pessoas/ports";
import { contatos, pessoas, unidades, vinculos } from "@/db/schema";
import { withTenantDb, type TenantDb } from "@/infrastructure/db/tenant-db";
import {
  codificarCursor,
  decodificarCursor,
} from "@/infrastructure/estrutura/estrutura-repo";

const TAMANHO_DA_PAGINA = 50;

const tenant = (ctx: Contexto) => ({
  orgId: ctx.orgId,
  empreendimentoId: ctx.empreendimentoId,
  userId: ctx.usuarioId,
});

const base = (ctx: Contexto) => ({
  orgId: ctx.orgId,
  empreendimentoId: ctx.empreendimentoId,
});

const colunasDeVinculo = {
  id: vinculos.id,
  pessoaId: vinculos.pessoaId,
  unidadeId: vinculos.unidadeId,
  tipo: vinculos.tipo,
  status: vinculos.status,
  recebeAviso: vinculos.recebeAviso,
  ordemAviso: vinculos.ordemAviso,
  vigenciaFim: vinculos.vigenciaFim,
  motivoEncerramento: vinculos.motivoEncerramento,
};

/** Monta a pessoa com contatos e vínculos a partir de linhas já lidas. */
async function carregarPessoas(
  db: TenantDb,
  ctx: Contexto,
  ids: string[],
): Promise<PessoaBruta[]> {
  if (ids.length === 0) return [];
  const [ps, cs, vs] = await Promise.all([
    db
      .select({ id: pessoas.id, nome: pessoas.nome, cpf: pessoas.cpf })
      .from(pessoas)
      .where(
        and(
          eq(pessoas.empreendimentoId, ctx.empreendimentoId),
          inArray(pessoas.id, ids),
        ),
      )
      .orderBy(asc(pessoas.nome)),
    db
      .select()
      .from(contatos)
      .where(
        and(
          eq(contatos.empreendimentoId, ctx.empreendimentoId),
          inArray(contatos.pessoaId, ids),
          eq(contatos.ativo, true),
        ),
      )
      .orderBy(asc(contatos.ordem)),
    db
      .select({ ...colunasDeVinculo, unidadeCodigo: unidades.codigo })
      .from(vinculos)
      .innerJoin(unidades, eq(unidades.id, vinculos.unidadeId))
      .where(
        and(
          eq(vinculos.empreendimentoId, ctx.empreendimentoId),
          inArray(vinculos.pessoaId, ids),
        ),
      ),
  ]);

  return ps.map((p) => ({
    ...p,
    contatos: cs
      .filter((c) => c.pessoaId === p.id)
      .map((c) => ({
        id: c.id,
        canal: c.canal,
        valor: c.valor,
        status: c.status,
        ordem: c.ordem,
        consentimentoEm: c.consentimentoEm,
      })),
    vinculos: vs
      .filter((v) => v.pessoaId === p.id)
      .map((v) => ({
        ...v,
        motivoEncerramento: v.motivoEncerramento ?? undefined,
      })),
  }));
}

export const pessoasRepo: PessoasRepo = {
  async criarPessoaCompleta(ctx, e) {
    // Uma transação só: pessoa, vínculo e contatos entram juntos ou nenhum entra.
    return withTenantDb(tenant(ctx), async (db) => {
      const [pessoa] = await db
        .insert(pessoas)
        .values({ ...base(ctx), nome: e.nome, cpf: e.cpf ?? null })
        .returning({ id: pessoas.id });
      const [vinculo] = await db
        .insert(vinculos)
        .values({
          ...base(ctx),
          pessoaId: pessoa!.id,
          unidadeId: e.vinculo.unidadeId,
          tipo: e.vinculo.tipo,
          recebeAviso: e.vinculo.recebeAviso,
          ordemAviso: e.vinculo.ordemAviso ?? 0,
          relacao: e.vinculo.relacao ?? null,
          emNomeDePessoaId: e.vinculo.emNomeDePessoaId ?? null,
          vigenciaFim: e.vinculo.vigenciaFim ?? null,
        })
        .returning({ id: vinculos.id });
      for (const [ordem, c] of e.contatos.entries()) {
        await db.insert(contatos).values({
          ...base(ctx),
          pessoaId: pessoa!.id,
          canal: c.canal,
          valor: c.valor,
          ordem,
          consentimentoEm: c.consentimento?.em ?? null,
          consentimentoOrigem: c.consentimento?.origem ?? null,
          consentimentoPor: c.consentimento?.por ?? null,
        });
      }
      return { pessoaId: pessoa!.id, vinculoId: vinculo!.id };
    });
  },

  async criarPessoa(ctx, e) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [p] = await db
        .insert(pessoas)
        .values({ ...base(ctx), nome: e.nome, cpf: e.cpf ?? null })
        .returning({ id: pessoas.id });
      return p!;
    });
  },

  async pessoaAtivaNaUnidadePorNome(ctx, unidadeId, normalizado) {
    return withTenantDb(tenant(ctx), async (db) => {
      // Poucas pessoas por unidade: comparar em memória evita depender de unaccent no banco.
      const linhas = await db
        .select({ id: pessoas.id, nome: pessoas.nome })
        .from(vinculos)
        .innerJoin(pessoas, eq(pessoas.id, vinculos.pessoaId))
        .where(
          and(
            eq(vinculos.empreendimentoId, ctx.empreendimentoId),
            eq(vinculos.unidadeId, unidadeId),
            eq(vinculos.status, "ativo"),
          ),
        );
      const achada = linhas.find(
        (l) => nomeNormalizado(l.nome) === normalizado,
      );
      return achada ? { id: achada.id } : null;
    });
  },

  async vinculoAtivo(ctx, pessoaId, unidadeId) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [v] = await db
        .select({ id: vinculos.id })
        .from(vinculos)
        .where(
          and(
            eq(vinculos.empreendimentoId, ctx.empreendimentoId),
            eq(vinculos.pessoaId, pessoaId),
            eq(vinculos.unidadeId, unidadeId),
            eq(vinculos.status, "ativo"),
          ),
        )
        .limit(1);
      return v ?? null;
    });
  },

  async criarVinculo(ctx, v) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [criado] = await db
        .insert(vinculos)
        .values({
          ...base(ctx),
          pessoaId: v.pessoaId,
          unidadeId: v.unidadeId,
          tipo: v.tipo,
          recebeAviso: v.recebeAviso,
          ordemAviso: v.ordemAviso ?? 0,
          relacao: v.relacao ?? null,
          emNomeDePessoaId: v.emNomeDePessoaId ?? null,
          vigenciaFim: v.vigenciaFim ?? null,
        })
        .returning({ id: vinculos.id });
      return criado!;
    });
  },

  async buscarVinculo(ctx, id) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [v] = await db
        .select(colunasDeVinculo)
        .from(vinculos)
        .where(
          and(
            eq(vinculos.empreendimentoId, ctx.empreendimentoId),
            eq(vinculos.id, id),
          ),
        )
        .limit(1);
      return v
        ? { ...v, motivoEncerramento: v.motivoEncerramento ?? undefined }
        : null;
    });
  },

  async salvarVinculoEncerrado(ctx, v) {
    await withTenantDb(tenant(ctx), (db) =>
      db
        .update(vinculos)
        .set({
          status: "encerrado",
          // O relógio do app pode estar atrás do banco (vigencia_inicio vem do now() do Postgres):
          // o fim nunca fica antes do início, senão o CHECK vinculos_vigencia_ordem recusa.
          vigenciaFim: sql`greatest(${v.vigenciaFim?.toISOString()}::timestamptz, ${vinculos.vigenciaInicio})`,
          recebeAviso: false,
          motivoEncerramento: v.motivoEncerramento ?? null,
        })
        .where(
          and(
            eq(vinculos.empreendimentoId, ctx.empreendimentoId),
            eq(vinculos.id, v.id),
          ),
        ),
    );
  },

  async salvarContato(ctx, e) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [c] = await db
        .insert(contatos)
        .values({
          ...base(ctx),
          pessoaId: e.pessoaId,
          canal: e.canal,
          valor: e.valor,
        })
        .returning({ id: contatos.id });
      return c!;
    });
  },

  async marcarConsentimento(ctx, contatoId, c) {
    await withTenantDb(tenant(ctx), (db) =>
      db
        .update(contatos)
        .set({
          consentimentoEm: c.em,
          consentimentoOrigem: c.origem,
          consentimentoPor: c.por,
        })
        .where(
          and(
            eq(contatos.empreendimentoId, ctx.empreendimentoId),
            eq(contatos.id, contatoId),
          ),
        ),
    );
  },

  async pessoaPorId(ctx, id) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [pessoa] = await carregarPessoas(db, ctx, [id]);
      return pessoa ?? null;
    });
  },

  async listarPessoas(ctx, f) {
    return withTenantDb(tenant(ctx), async (db) => {
      const cursor = f.cursor ? decodificarCursor(f.cursor) : null;
      const condicoes = [eq(pessoas.empreendimentoId, ctx.empreendimentoId)];
      if (f.busca?.trim()) {
        condicoes.push(
          ilike(pessoas.nome, `%${f.busca.trim().replace(/[%_]/g, "\\$&")}%`),
        );
      }
      if (f.tipo) {
        condicoes.push(
          inArray(
            pessoas.id,
            db
              .select({ id: vinculos.pessoaId })
              .from(vinculos)
              .where(
                and(
                  eq(vinculos.empreendimentoId, ctx.empreendimentoId),
                  eq(vinculos.tipo, f.tipo),
                  eq(vinculos.status, "ativo"),
                ),
              ),
          ),
        );
      }
      if (f.semContato) {
        condicoes.push(
          sql`not exists (select 1 from contatos c where c.pessoa_id = ${pessoas.id} and c.ativo and c.consentimento_em is not null and c.status <> 'falha')`,
        );
      }
      if (f.unidadeId) {
        condicoes.push(
          inArray(
            pessoas.id,
            db
              .select({ id: vinculos.pessoaId })
              .from(vinculos)
              .where(
                and(
                  eq(vinculos.empreendimentoId, ctx.empreendimentoId),
                  eq(vinculos.unidadeId, f.unidadeId),
                  eq(vinculos.status, "ativo"),
                ),
              ),
          ),
        );
      }
      if (cursor) {
        condicoes.push(
          or(
            sql`${pessoas.createdAt} > ${cursor.criadoEm}::timestamptz`,
            and(
              sql`${pessoas.createdAt} = ${cursor.criadoEm}::timestamptz`,
              gt(pessoas.id, cursor.id),
            ),
          )!,
        );
      }

      const linhas = await db
        .select({
          id: pessoas.id,
          nome: pessoas.nome,
          ativo: pessoas.ativo,
          cursorTs: sql<string>`${pessoas.createdAt}::text`,
        })
        .from(pessoas)
        .where(and(...condicoes))
        .orderBy(asc(pessoas.createdAt), asc(pessoas.id))
        .limit(TAMANHO_DA_PAGINA + 1);

      const temMais = linhas.length > TAMANHO_DA_PAGINA;
      const pagina = linhas.slice(0, TAMANHO_DA_PAGINA);
      const ids = pagina.map((p) => p.id);
      const codigos = ids.length
        ? await db
            .select({ pessoaId: vinculos.pessoaId, codigo: unidades.codigo })
            .from(vinculos)
            .innerJoin(unidades, eq(unidades.id, vinculos.unidadeId))
            .where(
              and(
                eq(vinculos.empreendimentoId, ctx.empreendimentoId),
                inArray(vinculos.pessoaId, ids),
                eq(vinculos.status, "ativo"),
              ),
            )
        : [];
      const ultimo = pagina.at(-1);
      return {
        itens: pagina.map((p) => ({
          id: p.id,
          nome: p.nome,
          ativo: p.ativo,
          unidades: codigos
            .filter((c) => c.pessoaId === p.id)
            .map((c) => c.codigo),
        })),
        proximo:
          temMais && ultimo
            ? codificarCursor(ultimo.cursorTs, ultimo.id)
            : undefined,
      };
    });
  },

  async salvarRecebeAviso(ctx, vinculoId, recebeAviso) {
    await withTenantDb(tenant(ctx), (db) =>
      db
        .update(vinculos)
        .set({ recebeAviso })
        .where(
          and(
            eq(vinculos.empreendimentoId, ctx.empreendimentoId),
            eq(vinculos.id, vinculoId),
          ),
        ),
    );
  },

  async autorizadosDe(ctx, pessoaId) {
    return withTenantDb(tenant(ctx), (db) =>
      db
        .select({
          vinculoId: vinculos.id,
          pessoaId: pessoas.id,
          nome: pessoas.nome,
          unidadeCodigo: unidades.codigo,
          relacao: vinculos.relacao,
          validoAte: vinculos.vigenciaFim,
        })
        .from(vinculos)
        .innerJoin(pessoas, eq(pessoas.id, vinculos.pessoaId))
        .innerJoin(unidades, eq(unidades.id, vinculos.unidadeId))
        .where(
          and(
            eq(vinculos.empreendimentoId, ctx.empreendimentoId),
            eq(vinculos.emNomeDePessoaId, pessoaId),
            eq(vinculos.tipo, "autorizado"),
            eq(vinculos.status, "ativo"),
          ),
        )
        .orderBy(asc(pessoas.nome)),
    );
  },

  async contagensDePessoas(ctx) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [r] = await db.execute<{
        todas: number;
        titulares: number;
        moradores: number;
        inquilinos: number;
        autorizados: number;
        sem_contato: number;
      }>(sql`
        select
          count(*) filter (where p.ativo)::int as todas,
          count(*) filter (where p.ativo and exists (select 1 from vinculos v where v.pessoa_id = p.id and v.status = 'ativo' and v.tipo = 'titular'))::int as titulares,
          count(*) filter (where p.ativo and exists (select 1 from vinculos v where v.pessoa_id = p.id and v.status = 'ativo' and v.tipo = 'morador'))::int as moradores,
          count(*) filter (where p.ativo and exists (select 1 from vinculos v where v.pessoa_id = p.id and v.status = 'ativo' and v.tipo = 'inquilino'))::int as inquilinos,
          count(*) filter (where p.ativo and exists (select 1 from vinculos v where v.pessoa_id = p.id and v.status = 'ativo' and v.tipo = 'autorizado'))::int as autorizados,
          count(*) filter (where p.ativo and not exists (select 1 from contatos c where c.pessoa_id = p.id and c.ativo and c.consentimento_em is not null and c.status <> 'falha'))::int as sem_contato
        from pessoas p
        where p.empreendimento_id = ${ctx.empreendimentoId}::uuid
      `);
      return {
        todas: r?.todas ?? 0,
        titulares: r?.titulares ?? 0,
        moradores: r?.moradores ?? 0,
        inquilinos: r?.inquilinos ?? 0,
        autorizados: r?.autorizados ?? 0,
        semContato: r?.sem_contato ?? 0,
      };
    });
  },

  async pessoasDaUnidade(ctx, unidadeId) {
    return withTenantDb(tenant(ctx), async (db) => {
      const ids = await db
        .select({ id: vinculos.pessoaId })
        .from(vinculos)
        .where(
          and(
            eq(vinculos.empreendimentoId, ctx.empreendimentoId),
            eq(vinculos.unidadeId, unidadeId),
            eq(vinculos.status, "ativo"),
          ),
        );
      return carregarPessoas(
        db,
        ctx,
        ids.map((i) => i.id),
      );
    });
  },

  async unidadesDaPessoa(ctx, pessoaId) {
    return withTenantDb(tenant(ctx), async (db) =>
      db
        .select({ id: unidades.id, codigo: unidades.codigo })
        .from(vinculos)
        .innerJoin(unidades, eq(unidades.id, vinculos.unidadeId))
        .where(
          and(
            eq(vinculos.empreendimentoId, ctx.empreendimentoId),
            eq(vinculos.pessoaId, pessoaId),
            eq(vinculos.status, "ativo"),
          ),
        )
        .orderBy(asc(unidades.codigo)),
    );
  },
};
