import "server-only";

import {
  and,
  asc,
  count,
  eq,
  gt,
  ilike,
  inArray,
  notExists,
  notInArray,
  or,
  sql,
} from "drizzle-orm";

import type { Contexto } from "@/application/auth/contexto";
import {
  AreaEmCiclo,
  type EstruturaRepo,
  type NoArvore,
  type UnidadeNaArvore,
} from "@/application/estrutura/ports";
import {
  areas,
  contatos,
  empreendimentos,
  encomendas,
  pessoas,
  pontosRecebimento,
  unidades,
  vinculos,
} from "@/db/schema";
import { withTenantDb } from "@/infrastructure/db/tenant-db";

const TAMANHO_DA_PAGINA = 50;
const LIMITE_DA_ARVORE = 5000;

const tenant = (ctx: Contexto) => ({
  orgId: ctx.orgId,
  empreendimentoId: ctx.empreendimentoId,
  userId: ctx.usuarioId,
});

/**
 * Cursor `(created_at, id)` em base64url. O `created_at` vai como TEXTO do banco: um
 * `Date` do JS só tem milissegundos e o Postgres guarda microssegundos, então linhas
 * criadas juntas repetiriam na página seguinte.
 */
export function codificarCursor(criadoEm: string, id: string): string {
  return Buffer.from(`${criadoEm}|${id}`).toString("base64url");
}

export function decodificarCursor(
  cursor: string,
): { criadoEm: string; id: string } | null {
  const [criadoEm, id] = Buffer.from(cursor, "base64url").toString().split("|");
  return criadoEm && id ? { criadoEm, id } : null;
}

function montarArvore(
  linhas: {
    id: string;
    nome: string;
    ordem: number;
    parentId: string | null;
  }[],
  porArea: Map<string, number>,
): NoArvore[] {
  const nos = new Map<string, NoArvore>(
    linhas.map((a) => [
      a.id,
      {
        id: a.id,
        nome: a.nome,
        ordem: a.ordem,
        unidadesAtivas: porArea.get(a.id) ?? 0,
        filhos: [],
      },
    ]),
  );
  const raizes: NoArvore[] = [];
  for (const a of linhas) {
    const no = nos.get(a.id)!;
    const pai = a.parentId ? nos.get(a.parentId) : undefined;
    (pai ? pai.filhos : raizes).push(no);
  }
  return raizes;
}

export const estruturaRepo: EstruturaRepo = {
  async arvore(ctx) {
    return withTenantDb(tenant(ctx), async (db) => {
      const linhas = await db
        .select({
          id: areas.id,
          nome: areas.nome,
          ordem: areas.ordem,
          parentId: areas.parentId,
        })
        .from(areas)
        .where(
          and(
            eq(areas.empreendimentoId, ctx.empreendimentoId),
            eq(areas.ativo, true),
          ),
        )
        .orderBy(asc(areas.ordem), asc(areas.nome));
      const contagem = await db
        .select({ areaId: unidades.areaId, total: count() })
        .from(unidades)
        .where(
          and(
            eq(unidades.empreendimentoId, ctx.empreendimentoId),
            eq(unidades.ativo, true),
          ),
        )
        .groupBy(unidades.areaId);
      const porArea = new Map(
        contagem.flatMap((c) =>
          c.areaId ? [[c.areaId, c.total] as const] : [],
        ),
      );
      return montarArvore(linhas, porArea);
    });
  },

  async resumoDeUnidades(ctx) {
    return withTenantDb(tenant(ctx), async (db) => {
      const linhas = await db.execute<{
        id: string;
        codigo: string;
        tipo: UnidadeNaArvore["tipo"];
        area_id: string | null;
        apelidos: string[];
        moradores: string[];
        sem_contato: boolean;
      }>(sql`
        select
          u.id, u.codigo, u.tipo, u.area_id, u.apelidos,
          coalesce((
            select array_agg(p.nome order by p.nome)
            from vinculos v join pessoas p on p.id = v.pessoa_id
            where v.unidade_id = u.id and v.status = 'ativo' and v.tipo <> 'autorizado'
          ), '{}') as moradores,
          not exists (
            select 1
            from vinculos v join contatos c on c.pessoa_id = v.pessoa_id
            where v.unidade_id = u.id and v.status = 'ativo' and v.recebe_aviso
              and c.ativo and c.consentimento_em is not null and c.status <> 'falha'
          ) as sem_contato
        from unidades u
        where u.empreendimento_id = ${ctx.empreendimentoId}::uuid and u.ativo
        order by u.codigo_normalizado
        limit ${LIMITE_DA_ARVORE}
      `);
      return Array.from(linhas).map((l) => ({
        id: l.id,
        codigo: l.codigo,
        tipo: l.tipo,
        areaId: l.area_id,
        apelidos: l.apelidos,
        moradores: l.moradores,
        semContato: l.sem_contato,
      }));
    });
  },

  async areasComuns(ctx) {
    return withTenantDb(tenant(ctx), async (db) => {
      const linhas = await db
        .select({
          id: unidades.id,
          codigo: unidades.codigo,
          responsavelPessoaId: unidades.responsavelPessoaId,
          responsavelNome: pessoas.nome,
          avisarResponsavel: unidades.avisarResponsavel,
          ativo: unidades.ativo,
        })
        .from(unidades)
        .leftJoin(pessoas, eq(pessoas.id, unidades.responsavelPessoaId))
        .where(
          and(
            eq(unidades.empreendimentoId, ctx.empreendimentoId),
            eq(unidades.tipo, "area_comum"),
            eq(unidades.ativo, true),
          ),
        )
        .orderBy(asc(unidades.codigoNormalizado));
      return linhas;
    });
  },

  async pontos(ctx) {
    return withTenantDb(tenant(ctx), (db) =>
      db
        .select({
          id: pontosRecebimento.id,
          nome: pontosRecebimento.nome,
          funcionamento: pontosRecebimento.funcionamento,
          ativo: pontosRecebimento.ativo,
        })
        .from(pontosRecebimento)
        .where(eq(pontosRecebimento.empreendimentoId, ctx.empreendimentoId))
        .orderBy(asc(pontosRecebimento.nome)),
    );
  },

  async contagensDeUnidades(ctx) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [r] = await db.execute<{
        todas: number;
        sem_contato: number;
        areas_comuns: number;
        inativas: number;
      }>(sql`
        select
          count(*) filter (where u.ativo)::int as todas,
          count(*) filter (where u.ativo and u.tipo = 'area_comum')::int as areas_comuns,
          count(*) filter (where not u.ativo)::int as inativas,
          count(*) filter (where u.ativo and not exists (
            select 1
            from vinculos v join contatos c on c.pessoa_id = v.pessoa_id
            where v.unidade_id = u.id and v.status = 'ativo' and v.recebe_aviso
              and c.ativo and c.consentimento_em is not null and c.status <> 'falha'
          ))::int as sem_contato
        from unidades u
        where u.empreendimento_id = ${ctx.empreendimentoId}::uuid
      `);
      return {
        todas: r?.todas ?? 0,
        semContato: r?.sem_contato ?? 0,
        areasComuns: r?.areas_comuns ?? 0,
        inativas: r?.inativas ?? 0,
      };
    });
  },

  async listarUnidades(ctx, f) {
    return withTenantDb(tenant(ctx), async (db) => {
      const cursor = f.cursor ? decodificarCursor(f.cursor) : null;
      const condicoes = [
        eq(unidades.empreendimentoId, ctx.empreendimentoId),
        eq(unidades.ativo, !f.inativas),
      ];
      if (f.areaId) condicoes.push(eq(unidades.areaId, f.areaId));
      if (f.tipo) condicoes.push(eq(unidades.tipo, f.tipo));
      if (f.busca?.trim()) {
        const termo = `%${f.busca.trim().replace(/[%_]/g, "\\$&")}%`;
        condicoes.push(
          or(
            ilike(unidades.codigo, termo),
            ilike(unidades.nome, termo),
            sql`array_to_string(${unidades.apelidos}, ' ') ilike ${termo}`,
          )!,
        );
      }
      if (f.semContato) {
        // Sem ninguém que possa ser avisado: vínculo ativo que recebe aviso E contato consentido.
        condicoes.push(
          notExists(
            db
              .select({ um: sql`1` })
              .from(vinculos)
              .innerJoin(contatos, eq(contatos.pessoaId, vinculos.pessoaId))
              .where(
                and(
                  eq(vinculos.unidadeId, unidades.id),
                  eq(vinculos.status, "ativo"),
                  eq(vinculos.recebeAviso, true),
                  eq(contatos.ativo, true),
                  sql`${contatos.consentimentoEm} is not null`,
                  sql`${contatos.status} <> 'falha'`,
                ),
              ),
          ),
        );
      }
      if (cursor) {
        condicoes.push(
          or(
            sql`${unidades.createdAt} > ${cursor.criadoEm}::timestamptz`,
            and(
              sql`${unidades.createdAt} = ${cursor.criadoEm}::timestamptz`,
              gt(unidades.id, cursor.id),
            ),
          )!,
        );
      }

      const linhas = await db
        .select({
          id: unidades.id,
          codigo: unidades.codigo,
          tipo: unidades.tipo,
          areaId: unidades.areaId,
          ativo: unidades.ativo,
          apelidos: unidades.apelidos,
          cursorTs: sql<string>`${unidades.createdAt}::text`,
        })
        .from(unidades)
        .where(and(...condicoes))
        .orderBy(asc(unidades.createdAt), asc(unidades.id))
        .limit(TAMANHO_DA_PAGINA + 1);

      const temMais = linhas.length > TAMANHO_DA_PAGINA;
      const itens = linhas.slice(0, TAMANHO_DA_PAGINA);
      const ultimo = itens.at(-1);
      return {
        itens: itens.map(({ cursorTs: _ts, ...u }) => u),
        proximo:
          temMais && ultimo
            ? codificarCursor(ultimo.cursorTs, ultimo.id)
            : undefined,
      };
    });
  },

  async unidadePorCodigoNormalizado(ctx, codigoNormalizado) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [u] = await db
        .select({ id: unidades.id })
        .from(unidades)
        .where(
          and(
            eq(unidades.empreendimentoId, ctx.empreendimentoId),
            eq(unidades.codigoNormalizado, codigoNormalizado),
          ),
        )
        .limit(1);
      return u ?? null;
    });
  },

  async codigosNormalizadosExistentes(ctx, codigos) {
    if (codigos.length === 0) return [];
    return withTenantDb(tenant(ctx), async (db) => {
      const linhas = await db
        .select({ c: unidades.codigoNormalizado })
        .from(unidades)
        .where(
          and(
            eq(unidades.empreendimentoId, ctx.empreendimentoId),
            inArray(unidades.codigoNormalizado, codigos),
          ),
        );
      return linhas.flatMap((l) => (l.c ? [l.c] : []));
    });
  },

  async unidadePorId(ctx, id) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [u] = await db
        .select({ id: unidades.id, codigo: unidades.codigo })
        .from(unidades)
        .where(
          and(
            eq(unidades.empreendimentoId, ctx.empreendimentoId),
            eq(unidades.id, id),
          ),
        )
        .limit(1);
      return u ?? null;
    });
  },

  async criarArea(ctx, a) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [criada] = await db
        .insert(areas)
        .values({
          orgId: ctx.orgId,
          empreendimentoId: ctx.empreendimentoId,
          nome: a.nome,
          parentId: a.parentId ?? null,
          ordem: a.ordem ?? 0,
        })
        .returning({ id: areas.id });
      return criada!;
    });
  },

  async atualizarArea(ctx, id, a) {
    try {
      await withTenantDb(tenant(ctx), (db) =>
        db
          .update(areas)
          .set(a)
          .where(
            and(
              eq(areas.empreendimentoId, ctx.empreendimentoId),
              eq(areas.id, id),
            ),
          ),
      );
    } catch (erro) {
      // O trigger do banco recusa a árvore com ciclo.
      if (
        /AREA_CICLO/.test(
          String((erro as Error)?.message) +
            String((erro as { cause?: Error })?.cause?.message),
        )
      ) {
        throw new AreaEmCiclo();
      }
      throw erro;
    }
  },

  async criarUnidades(ctx, lista) {
    return withTenantDb(tenant(ctx), async (db) => {
      const criadas = await db
        .insert(unidades)
        .values(
          lista.map((u) => ({
            orgId: ctx.orgId,
            empreendimentoId: ctx.empreendimentoId,
            ...u,
          })),
        )
        .returning({ id: unidades.id });
      return { ids: criadas.map((c) => c.id) };
    });
  },

  async criarEstruturaEmLote(ctx, plano) {
    // Uma transação só: o `withTenantDb` já abre uma, e tudo abaixo roda dentro dela.
    return withTenantDb(tenant(ctx), async (db) => {
      let totalAreas = 0;
      let totalUnidades = 0;
      // "Bloco", "Torre", "Quadra"…: o rótulo é do empreendimento.
      const [emp] = await db
        .select({ rotulo: empreendimentos.rotuloCamadaIntermediaria })
        .from(empreendimentos)
        .where(eq(empreendimentos.id, ctx.empreendimentoId))
        .limit(1);
      const rotulo = emp?.rotulo?.trim() || "Bloco";
      for (const [ordemBloco, bloco] of plano.blocos.entries()) {
        let blocoId: string | null = null;
        if (bloco.nome !== "") {
          const [criado] = await db
            .insert(areas)
            .values({
              orgId: ctx.orgId,
              empreendimentoId: ctx.empreendimentoId,
              nome: `${rotulo} ${bloco.nome}`,
              ordem: ordemBloco,
            })
            .returning({ id: areas.id });
          blocoId = criado!.id;
          totalAreas += 1;
        }
        for (const andar of bloco.andares) {
          const [areaDoAndar] = await db
            .insert(areas)
            .values({
              orgId: ctx.orgId,
              empreendimentoId: ctx.empreendimentoId,
              nome: `${andar.andar}º andar`,
              parentId: blocoId,
              ordem: andar.andar,
            })
            .returning({ id: areas.id });
          totalAreas += 1;
          await db.insert(unidades).values(
            andar.unidades.map((u) => ({
              orgId: ctx.orgId,
              empreendimentoId: ctx.empreendimentoId,
              areaId: areaDoAndar!.id,
              codigo: u.codigo,
              numero: u.numero,
              tipo: "apartamento" as const,
            })),
          );
          totalUnidades += andar.unidades.length;
        }
      }
      return { areas: totalAreas, unidades: totalUnidades };
    });
  },

  async atualizarUnidade(ctx, id, u) {
    await withTenantDb(tenant(ctx), (db) =>
      db
        .update(unidades)
        .set(u)
        .where(
          and(
            eq(unidades.empreendimentoId, ctx.empreendimentoId),
            eq(unidades.id, id),
          ),
        ),
    );
  },

  async contarUnidadesAtivasNaArea(ctx, areaId) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [r] = await db
        .select({ total: count() })
        .from(unidades)
        .where(
          and(
            eq(unidades.empreendimentoId, ctx.empreendimentoId),
            eq(unidades.areaId, areaId),
            eq(unidades.ativo, true),
          ),
        );
      return r?.total ?? 0;
    });
  },

  async contarVinculosAtivosDaUnidade(ctx, unidadeId) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [r] = await db
        .select({ total: count() })
        .from(vinculos)
        .where(
          and(
            eq(vinculos.empreendimentoId, ctx.empreendimentoId),
            eq(vinculos.unidadeId, unidadeId),
            eq(vinculos.status, "ativo"),
          ),
        );
      return r?.total ?? 0;
    });
  },

  async contarEncomendasAtivasDaUnidade(ctx, unidadeId) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [r] = await db
        .select({ total: count() })
        .from(encomendas)
        .where(
          and(
            eq(encomendas.empreendimentoId, ctx.empreendimentoId),
            eq(encomendas.unidadeId, unidadeId),
            notInArray(encomendas.estado, [
              "RETIRADA",
              "DEVOLVIDA",
              "CANCELADA",
            ]),
          ),
        );
      return r?.total ?? 0;
    });
  },

  async criarPonto(ctx, p) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [criado] = await db
        .insert(pontosRecebimento)
        .values({
          orgId: ctx.orgId,
          empreendimentoId: ctx.empreendimentoId,
          nome: p.nome,
          funcionamento: p.funcionamento ?? null,
        })
        .returning({ id: pontosRecebimento.id });
      return criado!;
    });
  },

  async atualizarPonto(ctx, id, p) {
    await withTenantDb(tenant(ctx), (db) =>
      db
        .update(pontosRecebimento)
        .set(p)
        .where(
          and(
            eq(pontosRecebimento.empreendimentoId, ctx.empreendimentoId),
            eq(pontosRecebimento.id, id),
          ),
        ),
    );
  },
};
