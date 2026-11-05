import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import type { Contexto } from "@/application/auth/contexto";
import type {
  ContextoDoBanco,
  ImportacaoRepo,
  LinhaDoLote,
  ResultadoDaGravacao,
} from "@/application/importacao/ports";
import {
  areas,
  contatos,
  empreendimentos,
  importacaoLinhas,
  importacoes,
  pessoas,
  unidades,
  vinculos,
} from "@/db/schema";
import { normalizarCodigo } from "@/domain/estrutura/unidade";
import { nomeNormalizado } from "@/domain/pessoas/nome";
import { withTenantDb, type TenantDb } from "@/infrastructure/db/tenant-db";

const LOTE_DE_INSERCAO = 500;

const tenant = (ctx: Contexto) => ({
  orgId: ctx.orgId,
  empreendimentoId: ctx.empreendimentoId,
  userId: ctx.usuarioId,
});
const base = (ctx: Contexto) => ({
  orgId: ctx.orgId,
  empreendimentoId: ctx.empreendimentoId,
});

const texto = (dados: Record<string, unknown>, campo: string): string =>
  typeof dados[campo] === "string" ? (dados[campo] as string) : "";

function lerLinha(l: typeof importacaoLinhas.$inferSelect): LinhaDoLote {
  return {
    id: l.id,
    numeroLinha: l.numeroLinha,
    dados: l.dados,
    situacao: l.situacao,
    problemas: l.problemas,
    decisao: l.decisao,
    registroId: l.registroId,
  };
}

/** Tudo o que a gravação precisa saber do banco, lido uma vez por lote. */
async function carregarReferencias(db: TenantDb, ctx: Contexto) {
  const [us, ps, ars, emp] = await Promise.all([
    db
      .select({
        id: unidades.id,
        codigo: unidades.codigo,
        normalizado: unidades.codigoNormalizado,
        nome: unidades.nome,
      })
      .from(unidades)
      .where(eq(unidades.empreendimentoId, ctx.empreendimentoId)),
    db
      .select({ id: pessoas.id, nome: pessoas.nome })
      .from(pessoas)
      .where(
        and(
          eq(pessoas.empreendimentoId, ctx.empreendimentoId),
          eq(pessoas.ativo, true),
        ),
      ),
    db
      .select({ id: areas.id, nome: areas.nome })
      .from(areas)
      .where(eq(areas.empreendimentoId, ctx.empreendimentoId)),
    db
      .select({ rotulo: empreendimentos.rotuloCamadaIntermediaria })
      .from(empreendimentos)
      .where(eq(empreendimentos.id, ctx.empreendimentoId))
      .limit(1),
  ]);
  return {
    unidadePorCodigo: new Map(
      us.flatMap((u) => (u.normalizado ? [[u.normalizado, u] as const] : [])),
    ),
    pessoasPorNome: ps.reduce((mapa, p) => {
      const chave = nomeNormalizado(p.nome);
      mapa.set(chave, [...(mapa.get(chave) ?? []), p.id]);
      return mapa;
    }, new Map<string, string[]>()),
    areaPorNome: new Map(ars.map((a) => [nomeNormalizado(a.nome), a.id])),
    rotulo: emp[0]?.rotulo?.trim() || "Bloco",
  };
}

type Referencias = Awaited<ReturnType<typeof carregarReferencias>>;

export const importacaoRepo: ImportacaoRepo = {
  async contextoDeValidacao(ctx, cadastro) {
    return withTenantDb(tenant(ctx), async (db): Promise<ContextoDoBanco> => {
      const codigos = await db
        .select({ c: unidades.codigoNormalizado })
        .from(unidades)
        .where(eq(unidades.empreendimentoId, ctx.empreendimentoId));
      const codigosDeUnidade = new Set(
        codigos.flatMap((l) => (l.c ? [l.c] : [])),
      );

      const pessoasPorUnidade = new Map<string, Set<string>>();
      const moradoresPorUnidade = new Map<string, Set<string>>();
      if (
        cadastro === "moradores" ||
        cadastro === "lojistas" ||
        cadastro === "autorizados"
      ) {
        const linhas = await db
          .select({
            unidade: unidades.codigoNormalizado,
            nome: pessoas.nome,
            pessoaId: pessoas.id,
          })
          .from(vinculos)
          .innerJoin(unidades, eq(unidades.id, vinculos.unidadeId))
          .innerJoin(pessoas, eq(pessoas.id, vinculos.pessoaId))
          .where(
            and(
              eq(vinculos.empreendimentoId, ctx.empreendimentoId),
              eq(vinculos.status, "ativo"),
              sql`${vinculos.tipo} <> 'autorizado'`,
            ),
          );
        const zaps = linhas.length
          ? await db
              .select({ pessoaId: contatos.pessoaId, valor: contatos.valor })
              .from(contatos)
              .where(
                and(
                  eq(contatos.empreendimentoId, ctx.empreendimentoId),
                  eq(contatos.canal, "whatsapp"),
                  eq(contatos.ativo, true),
                  inArray(
                    contatos.pessoaId,
                    linhas.map((l) => l.pessoaId),
                  ),
                ),
              )
          : [];
        for (const l of linhas) {
          if (!l.unidade) continue;
          const nome = nomeNormalizado(l.nome);
          (
            moradoresPorUnidade.get(l.unidade) ??
            moradoresPorUnidade.set(l.unidade, new Set()).get(l.unidade)!
          ).add(nome);
          const chaves = zaps
            .filter((z) => z.pessoaId === l.pessoaId)
            .map((z) => z.valor);
          const set =
            pessoasPorUnidade.get(l.unidade) ??
            pessoasPorUnidade.set(l.unidade, new Set()).get(l.unidade)!;
          for (const zap of chaves.length ? chaves : [""])
            set.add(`${nome}|${zap}`);
        }
      }
      return { codigosDeUnidade, pessoasPorUnidade, moradoresPorUnidade };
    });
  },

  async criarLote(ctx, e) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [lote] = await db
        .insert(importacoes)
        .values({
          ...base(ctx),
          cadastro: e.cadastro,
          arquivoNome: e.arquivoNome,
          linhasTotal: e.linhas.length,
          criadoPor: ctx.usuarioId,
        })
        .returning({ id: importacoes.id });
      for (let i = 0; i < e.linhas.length; i += LOTE_DE_INSERCAO) {
        await db.insert(importacaoLinhas).values(
          e.linhas.slice(i, i + LOTE_DE_INSERCAO).map((l) => ({
            ...base(ctx),
            importacaoId: lote!.id,
            numeroLinha: l.numeroLinha,
            dados: l.dados,
            situacao: l.situacao,
            problemas: l.problemas,
          })),
        );
      }
      return lote!;
    });
  },

  async buscarLote(ctx, id) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [l] = await db
        .select()
        .from(importacoes)
        .where(
          and(
            eq(importacoes.empreendimentoId, ctx.empreendimentoId),
            eq(importacoes.id, id),
          ),
        )
        .limit(1);
      return l
        ? {
            id: l.id,
            cadastro: l.cadastro,
            arquivoNome: l.arquivoNome,
            linhasTotal: l.linhasTotal,
            status: l.status,
            criadoPor: l.criadoPor,
            confirmadoEm: l.confirmadoEm,
          }
        : null;
    });
  },

  async lotesEmConferencia(ctx) {
    return withTenantDb(tenant(ctx), async (db) => {
      const lotes = await db
        .select()
        .from(importacoes)
        .where(
          and(
            eq(importacoes.empreendimentoId, ctx.empreendimentoId),
            eq(importacoes.status, "conferindo"),
          ),
        )
        .orderBy(desc(importacoes.createdAt));
      return lotes.map((l) => ({
        id: l.id,
        cadastro: l.cadastro,
        arquivoNome: l.arquivoNome,
        linhasTotal: l.linhasTotal,
        criadoEm: l.createdAt,
      }));
    });
  },

  async cancelarLote(ctx, id) {
    await withTenantDb(tenant(ctx), (db) =>
      db
        .update(importacoes)
        .set({ status: "cancelada" })
        .where(
          and(
            eq(importacoes.empreendimentoId, ctx.empreendimentoId),
            eq(importacoes.id, id),
            eq(importacoes.status, "conferindo"),
          ),
        ),
    );
  },

  async listarLinhas(ctx, loteId) {
    return withTenantDb(tenant(ctx), async (db) => {
      const linhas = await db
        .select()
        .from(importacaoLinhas)
        .where(
          and(
            eq(importacaoLinhas.empreendimentoId, ctx.empreendimentoId),
            eq(importacaoLinhas.importacaoId, loteId),
          ),
        )
        .orderBy(asc(importacaoLinhas.numeroLinha));
      return linhas.map(lerLinha);
    });
  },

  async atualizarLinha(ctx, linhaId, e) {
    await withTenantDb(tenant(ctx), (db) =>
      db
        .update(importacaoLinhas)
        .set({
          ...(e.dados ? { dados: e.dados } : {}),
          situacao: e.situacao,
          problemas: e.problemas,
          ...(e.decisao !== undefined ? { decisao: e.decisao } : {}),
        })
        .where(
          and(
            eq(importacaoLinhas.empreendimentoId, ctx.empreendimentoId),
            eq(importacaoLinhas.id, linhaId),
          ),
        ),
    );
  },

  async gravarLote(ctx, { lote, linhas, agora }) {
    // Uma transação só: o lote inteiro entra, ou nada entra.
    return withTenantDb(tenant(ctx), async (db) => {
      const refs = await carregarReferencias(db, ctx);
      const total: ResultadoDaGravacao = {
        criados: 0,
        atualizados: 0,
        ignorados: 0,
      };
      const registros = new Map<string, string>();

      for (const linha of linhas) {
        const atualiza = linha.situacao === "duplicado";
        const r = await gravarLinha(
          db,
          ctx,
          refs,
          lote.cadastro,
          linha.dados,
          atualiza,
        );
        if (r.registroId && !atualiza) registros.set(linha.id, r.registroId);
        if (r.acao === "criou") total.criados += 1;
        else if (r.acao === "atualizou") total.atualizados += 1;
        else total.ignorados += 1;
      }

      for (const [linhaId, registroId] of registros) {
        await db
          .update(importacaoLinhas)
          .set({ registroId })
          .where(eq(importacaoLinhas.id, linhaId));
      }
      await db
        .update(importacoes)
        .set({
          status: "confirmada",
          confirmadoPor: ctx.usuarioId,
          confirmadoEm: agora,
        })
        .where(eq(importacoes.id, lote.id));
      return total;
    });
  },

  async desfazerLote(ctx, { lote, linhas, agora }) {
    return withTenantDb(tenant(ctx), async (db) => {
      const ids = linhas.flatMap((l) => (l.registroId ? [l.registroId] : []));
      if (ids.length > 0) {
        if (lote.cadastro === "unidades" || lote.cadastro === "areas_comuns") {
          await db
            .update(unidades)
            .set({ ativo: false })
            .where(
              and(
                eq(unidades.empreendimentoId, ctx.empreendimentoId),
                inArray(unidades.id, ids),
              ),
            );
        } else {
          // Encerrar, não apagar: o fim nunca fica antes do início (relógio do banco).
          await db
            .update(vinculos)
            .set({
              status: "encerrado",
              recebeAviso: false,
              vigenciaFim: sql`greatest(${agora.toISOString()}::timestamptz, ${vinculos.vigenciaInicio})`,
              motivoEncerramento: "Importação desfeita",
            })
            .where(
              and(
                eq(vinculos.empreendimentoId, ctx.empreendimentoId),
                inArray(vinculos.pessoaId, ids),
                eq(vinculos.status, "ativo"),
              ),
            );
          await db
            .update(pessoas)
            .set({ ativo: false })
            .where(
              and(
                eq(pessoas.empreendimentoId, ctx.empreendimentoId),
                inArray(pessoas.id, ids),
              ),
            );
        }
      }
      await db
        .update(importacoes)
        .set({ status: "desfeita" })
        .where(eq(importacoes.id, lote.id));
      return { desfeitos: ids.length };
    });
  },
};

type Acao = { acao: "criou" | "atualizou" | "ignorou"; registroId?: string };

/** Garante o bloco (área) pelo nome; "A" vira "Bloco A", "Quadra 5" fica como está. */
async function garantirArea(
  db: TenantDb,
  ctx: Contexto,
  refs: Referencias,
  bloco: string,
): Promise<string | null> {
  const nome = bloco.length <= 3 ? `${refs.rotulo} ${bloco}` : bloco;
  const chave = nomeNormalizado(nome);
  const existente = refs.areaPorNome.get(chave);
  if (existente) return existente;
  const [criada] = await db
    .insert(areas)
    .values({ ...base(ctx), nome })
    .returning({ id: areas.id });
  refs.areaPorNome.set(chave, criada!.id);
  return criada!.id;
}

async function garantirContato(
  db: TenantDb,
  ctx: Contexto,
  pessoaId: string,
  canal: "whatsapp" | "email",
  valor: string,
  ordem: number,
) {
  // Sem consentimento: ele não vem da planilha, só do gestor ou do opt-in.
  await db
    .insert(contatos)
    .values({ ...base(ctx), pessoaId, canal, valor, ordem })
    .onConflictDoNothing();
}

async function gravarLinha(
  db: TenantDb,
  ctx: Contexto,
  refs: Referencias,
  cadastro: string,
  dados: Record<string, unknown>,
  duplicada: boolean,
): Promise<Acao> {
  switch (cadastro) {
    case "unidades": {
      const codigo = texto(dados, "codigo");
      const existente = refs.unidadePorCodigo.get(normalizarCodigo(codigo));
      const bloco = texto(dados, "bloco");
      const areaId = bloco ? await garantirArea(db, ctx, refs, bloco) : null;
      const valores = {
        tipo: dados.tipo as "apartamento",
        numero: texto(dados, "numero"),
        apelidos: (dados.apelidos as string[] | undefined) ?? [],
        areaId,
      };
      if (duplicada && existente) {
        await db
          .update(unidades)
          .set(valores)
          .where(eq(unidades.id, existente.id));
        return { acao: "atualizou" };
      }
      const [u] = await db
        .insert(unidades)
        .values({ ...base(ctx), codigo, ...valores })
        .returning({
          id: unidades.id,
          normalizado: unidades.codigoNormalizado,
        });
      refs.unidadePorCodigo.set(u!.normalizado ?? normalizarCodigo(codigo), {
        id: u!.id,
        codigo,
        normalizado: u!.normalizado,
        nome: null,
      });
      return { acao: "criou", registroId: u!.id };
    }

    case "areas_comuns": {
      const codigo = texto(dados, "codigo");
      const responsavel = texto(dados, "responsavel");
      const candidatos = responsavel
        ? (refs.pessoasPorNome.get(nomeNormalizado(responsavel)) ?? [])
        : [];
      // Só liga o aviso quando o responsável é uma pessoa só e já cadastrada.
      const responsavelPessoaId =
        candidatos.length === 1 ? candidatos[0]! : null;
      const existente = refs.unidadePorCodigo.get(normalizarCodigo(codigo));
      if (duplicada && existente) {
        await db
          .update(unidades)
          .set({
            responsavelPessoaId,
            avisarResponsavel: responsavelPessoaId !== null,
          })
          .where(eq(unidades.id, existente.id));
        return { acao: "atualizou" };
      }
      const [u] = await db
        .insert(unidades)
        .values({
          ...base(ctx),
          codigo,
          tipo: "area_comum",
          responsavelPessoaId,
          avisarResponsavel: responsavelPessoaId !== null,
        })
        .returning({
          id: unidades.id,
          normalizado: unidades.codigoNormalizado,
        });
      refs.unidadePorCodigo.set(u!.normalizado ?? normalizarCodigo(codigo), {
        id: u!.id,
        codigo,
        normalizado: u!.normalizado,
        nome: null,
      });
      return { acao: "criou", registroId: u!.id };
    }

    case "moradores":
    case "lojistas": {
      const unidade = refs.unidadePorCodigo.get(
        normalizarCodigo(texto(dados, "unidadeCodigo")),
      );
      if (!unidade) return { acao: "ignorou" };
      const nome = texto(dados, "nome");
      const tipo =
        cadastro === "lojistas"
          ? dados.funcao === "Responsável"
            ? ("titular" as const)
            : ("morador" as const)
          : (dados.papel as "titular" | "morador" | "inquilino");
      if (
        cadastro === "lojistas" &&
        texto(dados, "nomeDaLoja") &&
        !unidade.nome
      ) {
        await db
          .update(unidades)
          .set({ nome: texto(dados, "nomeDaLoja") })
          .where(eq(unidades.id, unidade.id));
      }

      if (duplicada) {
        const achada = (refs.pessoasPorNome.get(nomeNormalizado(nome)) ??
          [])[0];
        if (!achada) return { acao: "ignorou" };
        if (texto(dados, "whatsapp"))
          await garantirContato(
            db,
            ctx,
            achada,
            "whatsapp",
            texto(dados, "whatsapp"),
            0,
          );
        if (texto(dados, "email"))
          await garantirContato(
            db,
            ctx,
            achada,
            "email",
            texto(dados, "email"),
            1,
          );
        return { acao: "atualizou" };
      }

      const [pessoa] = await db
        .insert(pessoas)
        .values({ ...base(ctx), nome })
        .returning({ id: pessoas.id });
      await db.insert(vinculos).values({
        ...base(ctx),
        pessoaId: pessoa!.id,
        unidadeId: unidade.id,
        tipo,
        recebeAviso: true,
      });
      if (texto(dados, "whatsapp"))
        await garantirContato(
          db,
          ctx,
          pessoa!.id,
          "whatsapp",
          texto(dados, "whatsapp"),
          0,
        );
      if (texto(dados, "email"))
        await garantirContato(
          db,
          ctx,
          pessoa!.id,
          "email",
          texto(dados, "email"),
          1,
        );
      refs.pessoasPorNome.set(nomeNormalizado(nome), [
        ...(refs.pessoasPorNome.get(nomeNormalizado(nome)) ?? []),
        pessoa!.id,
      ]);
      return { acao: "criou", registroId: pessoa!.id };
    }

    case "autorizados": {
      const unidade = refs.unidadePorCodigo.get(
        normalizarCodigo(texto(dados, "unidadeCodigo")),
      );
      if (!unidade) return { acao: "ignorou" };
      // O morador que autoriza: a pessoa ativa com esse nome e vínculo ativo na unidade.
      const candidatos =
        refs.pessoasPorNome.get(nomeNormalizado(texto(dados, "emNomeDe"))) ??
        [];
      const moradores = candidatos.length
        ? await db
            .select({ pessoaId: vinculos.pessoaId })
            .from(vinculos)
            .where(
              and(
                eq(vinculos.empreendimentoId, ctx.empreendimentoId),
                eq(vinculos.unidadeId, unidade.id),
                eq(vinculos.status, "ativo"),
                inArray(vinculos.pessoaId, candidatos),
              ),
            )
        : [];
      const emNome = moradores[0]?.pessoaId;
      if (!emNome) return { acao: "ignorou" };

      const [pessoa] = await db
        .insert(pessoas)
        .values({
          ...base(ctx),
          nome: texto(dados, "nome"),
          cpf: texto(dados, "cpf") || null,
        })
        .returning({ id: pessoas.id });
      const valeAte = texto(dados, "valeAte");
      await db.insert(vinculos).values({
        ...base(ctx),
        pessoaId: pessoa!.id,
        unidadeId: unidade.id,
        tipo: "autorizado",
        recebeAviso: false,
        relacao: texto(dados, "relacao") || null,
        emNomeDePessoaId: emNome,
        vigenciaFim: valeAte ? new Date(`${valeAte}T23:59:59Z`) : null,
      });
      return { acao: "criou", registroId: pessoa!.id };
    }

    default:
      return { acao: "ignorou" };
  }
}
