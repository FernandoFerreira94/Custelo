import "server-only";

import * as Sentry from "@sentry/nextjs";
import { sql, type SQL } from "drizzle-orm";

import type { Contexto } from "@/application/auth/contexto";
import type {
  EventoDaLinha,
  Rotulos,
} from "@/application/custodia/linha-do-tempo";
import type {
  ConsultasCustodiaRepo,
  CustodiaRepo,
  CustodiaTx,
  DetalheRepo,
  FiltroFila,
  LinhaEncomendaRepo,
  LinhaFilaRepo,
  LocaisRepo,
  LocalComOcupacao,
  LocalGuarda,
} from "@/application/custodia/ports";
import type { Estado, TipoEvento } from "@/domain/custodia/estados";
import { PRAZOS_PADRAO, type Prazos } from "@/domain/custodia/situacao";
import { codigoPg } from "@/infrastructure/db/erros-pg";
import { type TenantDb, withTenantDb } from "@/infrastructure/db/tenant-db";
import { MSG, MSG_CUSTODIA } from "@/lib/mensagens";
import { falha, type Resultado } from "@/lib/resultado";

const TAMANHO_DA_PAGINA = 50;
const TERMINAIS = sql`('RETIRADA', 'DEVOLVIDA', 'CANCELADA')`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ehUuid = (v: string | undefined | null): v is string =>
  !!v && UUID.test(v);

const tenant = (ctx: Contexto) => ({
  orgId: ctx.orgId,
  empreendimentoId: ctx.empreendimentoId,
  userId: ctx.usuarioId,
});

const linhas = <T>(r: unknown) => Array.from(r as Iterable<T>);

// ---- Cursor `(instante como texto do banco, id)`: o Postgres guarda microssegundos.

function codificarCursor(instante: string, id: string): string {
  return Buffer.from(`${instante}|${id}`).toString("base64url");
}
function decodificarCursor(
  c?: string,
): { instante: string; id: string } | null {
  if (!c) return null;
  const [instante, id] = Buffer.from(c, "base64url").toString().split("|");
  return instante && ehUuid(id) && !Number.isNaN(Date.parse(instante))
    ? { instante, id }
    : null;
}

// ---- Transação de custódia

/** Interrompe a transação para desfazer tudo e devolver a falha ao caso de uso. */
class Desfazer extends Error {
  constructor(readonly resultado: Resultado<never>) {
    super("desfazer");
  }
}

function infoPg(erro: unknown): { constraint?: string; message?: string } {
  const e = erro as {
    constraint_name?: string;
    message?: string;
    cause?: { constraint_name?: string; message?: string };
  };
  return {
    constraint: e?.constraint_name ?? e?.cause?.constraint_name,
    message: e?.cause?.message ?? e?.message,
  };
}

function alertarCrossTenant() {
  Sentry.captureMessage("cross_tenant_negado", {
    tags: { cross_tenant: "true", modulo: "custodia" },
  });
}

/**
 * Traduz o erro do banco (tabela da Task 4.4). `repetir` = vale rodar a
 * transação de novo: na segunda vez o caso de uso enxerga o estado real
 * (evento já gravado por outra chamada, ou estado que mudou).
 */
function traduzir(erro: unknown): { repetir: true } | Resultado<never> | null {
  const codigo = codigoPg(erro);
  const { constraint, message } = infoPg(erro);
  if (codigo === "40001") return falha("CONFLITO", MSG_CUSTODIA.foraDeOrdem);
  if (codigo === "23505") {
    if (constraint === "custody_events_pkey") return { repetir: true };
    return falha("CONFLITO", MSG_CUSTODIA.foraDeOrdem);
  }
  if (codigo === "23514" && message?.includes("TRANSICAO_PROIBIDA"))
    return { repetir: true };
  if (codigo === "23503") {
    alertarCrossTenant();
    return falha("ENTRADA_INVALIDA", MSG.instavel);
  }
  if (codigo === "42501") {
    alertarCrossTenant();
    return falha("SEM_PERMISSAO", MSG.semPermissao);
  }
  return null;
}

function criarTx(db: TenantDb, ctx: Contexto): CustodiaTx {
  return {
    async eventoPorId(id) {
      if (!ehUuid(id)) return null;
      const [r] = linhas<{
        encomenda_id: string;
        sequencia: number;
        estado_novo: Estado;
      }>(
        await db.execute(sql`
          select encomenda_id, sequencia, estado_novo from custody_events
          where id = ${id}::uuid and empreendimento_id = ${ctx.empreendimentoId}::uuid`),
      );
      return r
        ? {
            encomendaId: r.encomenda_id,
            sequencia: r.sequencia,
            estadoNovo: r.estado_novo,
          }
        : null;
    },

    // Sem FOR UPDATE: o app não tem UPDATE em `encomendas` (só o trigger muda o estado).
    // A trava de verdade é o trigger `aplicar_evento_custodia`, que trava a linha e
    // recusa sequência ou estado divergente com 40001 (vira CONFLITO).
    async travarEncomenda(id) {
      if (!ehUuid(id)) return null;
      const [r] = linhas<{
        estado: Estado;
        versao: number;
        unidade_id: string | null;
        pessoa_id: string | null;
        local_guarda_id: string | null;
        ponto_id: string | null;
      }>(
        await db.execute(sql`
          select estado, versao, unidade_id, pessoa_id, local_guarda_id, ponto_id
          from encomendas
          where id = ${id}::uuid and empreendimento_id = ${ctx.empreendimentoId}::uuid`),
      );
      return r
        ? {
            estado: r.estado,
            versao: r.versao,
            unidadeId: r.unidade_id,
            pessoaId: r.pessoa_id,
            localGuardaId: r.local_guarda_id,
            pontoId: r.ponto_id,
          }
        : null;
    },

    async localPorId(id) {
      if (!ehUuid(id)) return null;
      const [r] = await selecionarLocais(db, ctx, sql`l.id = ${id}::uuid`);
      return r ?? null;
    },

    async criarEncomenda(e) {
      await db.execute(sql`
        insert into encomendas (id, org_id, empreendimento_id, codigo_curto, ponto_id,
          transportadora, rastreio, volumes, porte, excepcional, origem, ocorrido_em, recebido_por)
        values (${e.id}::uuid, ${ctx.orgId}::uuid, ${ctx.empreendimentoId}::uuid, ${e.codigoCurto},
          ${e.pontoId}::uuid, ${e.transportadora ?? null}, ${e.rastreio ?? null}, ${e.volumes ?? 1},
          ${e.porte ?? null}, ${e.excepcional ?? null}, ${e.origem}, ${e.ocorridoEm.toISOString()}::timestamptz,
          ${e.recebidoPor}::uuid)`);
    },

    async inserirEvento(e) {
      await db.execute(sql`
        insert into custody_events (id, org_id, empreendimento_id, encomenda_id, sequencia, tipo,
          estado_anterior, estado_novo, dados, motivo, ator_tipo, ator_usuario_id, origem,
          dispositivo_id, ocorrido_em)
        values (${e.id}::uuid, ${ctx.orgId}::uuid, ${ctx.empreendimentoId}::uuid, ${e.encomendaId}::uuid,
          ${e.sequencia}, ${e.tipo}, ${e.estadoAnterior}::encomenda_estado, ${e.estadoNovo}::encomenda_estado,
          ${JSON.stringify(e.dados)}::jsonb, ${e.motivo ?? null}, ${e.atorTipo},
          ${e.atorUsuarioId}::uuid, ${e.origem}, ${e.dispositivoId ?? null},
          ${e.ocorridoEm.toISOString()}::timestamptz)`);
    },

    async auditar(a) {
      await db.execute(sql`
        insert into audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id,
          antes, depois, motivo, origem)
        values (${ctx.orgId}::uuid, ${ctx.empreendimentoId}::uuid, ${ctx.usuarioId}::uuid, ${a.acao},
          ${a.alvoTipo}, ${a.alvoId ?? null}, ${a.antes ? JSON.stringify(a.antes) : null}::jsonb,
          ${a.depois ? JSON.stringify(a.depois) : null}::jsonb, ${a.motivo ?? null}, ${a.origem})`);
    },
  };
}

async function selecionarLocais(
  db: TenantDb,
  ctx: Contexto,
  onde: SQL,
): Promise<LocalComOcupacao[]> {
  const r = linhas<{
    id: string;
    codigo: string;
    ponto_id: string;
    ponto_nome: string;
    capacidade: number | null;
    volume_grande: boolean;
    ativo: boolean;
    usado: number;
  }>(
    await db.execute(sql`
      select l.id, l.codigo, l.ponto_id, p.nome as ponto_nome, l.capacidade, l.volume_grande, l.ativo,
        (select count(*)::int from encomendas e
          where e.local_guarda_id = l.id and e.estado not in ${TERMINAIS}) as usado
      from locais_guarda l
      join pontos_recebimento p on p.id = l.ponto_id
      where l.empreendimento_id = ${ctx.empreendimentoId}::uuid and ${onde}
      order by p.nome, l.ordem, l.codigo`),
  );
  return r.map((l) => ({
    id: l.id,
    codigo: l.codigo,
    pontoId: l.ponto_id,
    pontoNome: l.ponto_nome,
    capacidade: l.capacidade,
    volumeGrande: l.volume_grande,
    ativo: l.ativo,
    usado: l.usado,
  }));
}

export const custodiaRepo: CustodiaRepo = {
  async naTransacao<T>(
    ctx: Contexto,
    fn: (tx: CustodiaTx) => Promise<Resultado<T>>,
  ): Promise<Resultado<T>> {
    const rodar = () =>
      withTenantDb(tenant(ctx), async (db) => {
        const r = await fn(criarTx(db, ctx));
        if (!r.ok) throw new Desfazer(r);
        return r;
      });

    for (let tentativa = 1; ; tentativa++) {
      try {
        return await rodar();
      } catch (erro) {
        if (erro instanceof Desfazer) return erro.resultado;
        const traduzido = traduzir(erro);
        if (!traduzido) throw erro;
        if ("repetir" in traduzido) {
          if (tentativa < 2) continue;
          return falha("CONFLITO", MSG_CUSTODIA.foraDeOrdem);
        }
        return traduzido;
      }
    }
  },
};

// ---- Prateleiras

export const locaisRepo: LocaisRepo = {
  async locaisDoPonto(ctx, pontoId) {
    if (!ehUuid(pontoId)) return null;
    return withTenantDb(tenant(ctx), async (db) => {
      const [ponto] = linhas<{ id: string }>(
        await db.execute(sql`
          select id from pontos_recebimento
          where id = ${pontoId}::uuid and empreendimento_id = ${ctx.empreendimentoId}::uuid`),
      );
      if (!ponto) return null;
      const locais = await selecionarLocais(
        db,
        ctx,
        sql`l.ponto_id = ${pontoId}::uuid and l.ativo`,
      );
      return locais.map(({ pontoNome: _p, ...l }): LocalGuarda => l);
    });
  },

  async aplicarPrateleiras(ctx, pontoId, plano) {
    try {
      return await withTenantDb(tenant(ctx), async (db) => {
        if (plano.desativar.length > 0) {
          // FOR UPDATE conflita com o KEY SHARE que a FK da encomenda pega ao guardar:
          // ninguém guarda numa prateleira enquanto ela é desativada.
          const ids = sql.join(
            plano.desativar.map((id) => sql`${id}::uuid`),
            sql`, `,
          );
          await db.execute(sql`
            select id from locais_guarda
            where id in (${ids}) and empreendimento_id = ${ctx.empreendimentoId}::uuid
            for update`);
          const [r] = linhas<{ n: number }>(
            await db.execute(sql`
              select count(*)::int as n from encomendas
              where local_guarda_id in (${ids}) and estado not in ${TERMINAIS}`),
          );
          if ((r?.n ?? 0) > 0)
            throw new Desfazer(falha("CONFLITO", String(r!.n)));
          await db.execute(sql`
            update locais_guarda set ativo = false
            where id in (${ids}) and ponto_id = ${pontoId}::uuid
              and empreendimento_id = ${ctx.empreendimentoId}::uuid`);
        }
        for (const [ordem, p] of plano.atualizar.entries()) {
          await db.execute(sql`
            update locais_guarda
            set codigo = ${p.codigo}, capacidade = ${p.capacidade}, volume_grande = ${p.volumeGrande},
                ordem = ${ordem}
            where id = ${p.id}::uuid and ponto_id = ${pontoId}::uuid
              and empreendimento_id = ${ctx.empreendimentoId}::uuid and ativo`);
        }
        for (const [i, p] of plano.criar.entries()) {
          await db.execute(sql`
            insert into locais_guarda (org_id, empreendimento_id, ponto_id, codigo, capacidade,
              volume_grande, ordem)
            values (${ctx.orgId}::uuid, ${ctx.empreendimentoId}::uuid, ${pontoId}::uuid, ${p.codigo},
              ${p.capacidade}, ${p.volumeGrande}, ${plano.atualizar.length + i})`);
        }
        return { comEncomenda: 0 };
      });
    } catch (erro) {
      if (erro instanceof Desfazer && !erro.resultado.ok)
        return { comEncomenda: Number(erro.resultado.mensagem) };
      throw erro;
    }
  },
};

// ---- Consultas

/** Minúsculas e sem acento, igual dos dois lados (não depende da extensão unaccent). */
const SEM_ACENTO = (col: SQL) =>
  sql`translate(lower(${col}), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')`;

function normalizarBusca(busca: string) {
  const texto = busca.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const escapado = texto.replace(/[\\%_]/g, "\\$&");
  return {
    nome: `%${escapado}%`,
    unidade: `%${texto.toUpperCase().replace(/[^0-9A-Z]/g, "")}%`,
    codigo: texto.toUpperCase().replace(/^PZ-?/, ""),
  };
}

/** Condição por encomenda (alias `e`, com `u` = unidade e `p` = pessoa). */
function condicaoBusca(busca?: string): SQL {
  if (!busca?.trim()) return sql`true`;
  const b = normalizarBusca(busca);
  const partes = [
    sql`${SEM_ACENTO(sql`coalesce(p.nome, e.nome_destinatario, '')`)} like ${b.nome}`,
    sql`e.codigo_curto = ${b.codigo}`,
  ];
  if (b.unidade !== "%%")
    partes.push(sql`coalesce(u.codigo_normalizado, '') like ${b.unidade}`);
  return sql`(${sql.join(partes, sql` or `)})`;
}

function condicaoFiltro(filtro: FiltroFila | undefined, p: Prazos): SQL {
  switch (filtro) {
    case "prontas":
      return sql`e.estado = 'NOTIFICADA'`;
    case "falha":
      return sql`e.estado = 'FALHA_NOTIFICACAO'`;
    case "naoIdent":
      return sql`e.estado = 'NAO_IDENTIFICADA'`;
    case "prazo":
      return p.atrasoLigado
        ? sql`(e.estado not in ${TERMINAIS} and e.ocorrido_em <= now() - make_interval(days => ${p.atrasoDias}))`
        : sql`false`;
    default:
      return sql`true`;
  }
}

export const consultasCustodiaRepo: ConsultasCustodiaRepo = {
  async prazos(ctx) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [c] = linhas<{
        prazo_lembrete_dias: number;
        prazo_lembrete_ligado: boolean;
        prazo_atraso_dias: number;
        prazo_atraso_ligado: boolean;
        prazo_devolucao_dias: number;
        prazo_devolucao_ligado: boolean;
      }>(
        await db.execute(sql`
          select * from empreendimento_config
          where empreendimento_id = ${ctx.empreendimentoId}::uuid`),
      );
      if (!c) return PRAZOS_PADRAO;
      return {
        lembreteDias: c.prazo_lembrete_dias,
        lembreteLigado: c.prazo_lembrete_ligado,
        atrasoDias: c.prazo_atraso_dias,
        atrasoLigado: c.prazo_atraso_ligado,
        devolucaoDias: c.prazo_devolucao_dias,
        devolucaoLigado: c.prazo_devolucao_ligado,
      };
    });
  },

  async filaPorUnidade(ctx, f, prazos) {
    const cursor = decodificarCursor(f.cursor);
    return withTenantDb(tenant(ctx), async (db) => {
      const r = linhas<{
        chave: string;
        unidade_id: string | null;
        unidade_codigo: string | null;
        destinatario: string | null;
        encomendas: number;
        volumes: number;
        local: string | null;
        id_mais_antiga: string;
        mais_antiga: string;
        itens: { estado: Estado; ocorrido_em: string }[];
      }>(
        await db.execute(sql`
          with ativas as (
            select e.id, e.estado, e.ocorrido_em, e.volumes, e.unidade_id, e.local_guarda_id,
              coalesce(p.nome, e.nome_destinatario) as destinatario,
              coalesce(e.unidade_id, e.id) as chave,
              ${condicaoBusca(f.busca)} as casa_busca,
              ${condicaoFiltro(f.filtro, prazos)} as casa_filtro
            from encomendas e
            left join unidades u on u.id = e.unidade_id
            left join pessoas p on p.id = e.pessoa_id
            where e.empreendimento_id = ${ctx.empreendimentoId}::uuid
              and e.estado not in ${TERMINAIS}
          ), grupos as (
            select chave,
              (array_agg(id order by ocorrido_em, id))[1] as id_mais_antiga,
              min(ocorrido_em) as mais_antiga,
              count(*)::int as encomendas,
              sum(volumes)::int as volumes,
              json_agg(json_build_object('estado', estado, 'ocorrido_em', ocorrido_em)) as itens
            from ativas
            group by chave
            having bool_or(casa_busca) and bool_or(casa_filtro)
          )
          select g.chave, g.id_mais_antiga, g.mais_antiga::text as mais_antiga, g.encomendas,
            g.volumes, g.itens, a.unidade_id, u.codigo as unidade_codigo, a.destinatario,
            l.codigo as local
          from grupos g
          join ativas a on a.id = g.id_mais_antiga
          left join unidades u on u.id = a.unidade_id
          left join locais_guarda l on l.id = a.local_guarda_id
          where ${
            cursor
              ? sql`(g.mais_antiga, g.id_mais_antiga) > (${cursor.instante}::timestamptz, ${cursor.id}::uuid)`
              : sql`true`
          }
          order by g.mais_antiga, g.id_mais_antiga
          limit ${TAMANHO_DA_PAGINA + 1}`),
      );
      const pagina = r.slice(0, TAMANHO_DA_PAGINA);
      const ultima = pagina.at(-1);
      return {
        proximo:
          r.length > TAMANHO_DA_PAGINA && ultima
            ? codificarCursor(ultima.mais_antiga, ultima.id_mais_antiga)
            : null,
        itens: pagina.map((l): LinhaFilaRepo => ({
          chave: l.chave,
          unidadeId: l.unidade_id,
          unidadeCodigo: l.unidade_codigo,
          destinatario: l.destinatario,
          encomendas: l.encomendas,
          volumes: l.volumes,
          localMaisAntiga: l.local,
          idMaisAntiga: l.id_mais_antiga,
          ocorridoEmMaisAntiga: new Date(l.mais_antiga),
          itens: l.itens.map((i) => ({
            estado: i.estado,
            ocorridoEm: new Date(i.ocorrido_em),
          })),
        })),
      };
    });
  },

  async listaEncomendas(ctx, f, prazos) {
    const cursor = decodificarCursor(f.cursor);
    const condicoes: SQL[] = [
      sql`e.empreendimento_id = ${ctx.empreendimentoId}::uuid`,
      condicaoBusca(f.busca),
      condicaoFiltro(f.filtro, prazos),
    ];
    if (f.estado) condicoes.push(sql`e.estado = ${f.estado}::encomenda_estado`);
    if (ehUuid(f.unidadeId))
      condicoes.push(sql`e.unidade_id = ${f.unidadeId}::uuid`);
    if (f.de)
      condicoes.push(sql`e.ocorrido_em >= ${f.de.toISOString()}::timestamptz`);
    if (f.ate)
      condicoes.push(sql`e.ocorrido_em < ${f.ate.toISOString()}::timestamptz`);
    if (cursor)
      condicoes.push(
        sql`(e.ocorrido_em, e.id) < (${cursor.instante}::timestamptz, ${cursor.id}::uuid)`,
      );

    return withTenantDb(tenant(ctx), async (db) => {
      const r = linhas<{
        id: string;
        codigo_curto: string;
        estado: Estado;
        unidade_codigo: string | null;
        destinatario: string | null;
        local: string | null;
        ocorrido_em: string;
        recebido_por: string | null;
      }>(
        await db.execute(sql`
          select e.id, e.codigo_curto, e.estado, u.codigo as unidade_codigo,
            coalesce(p.nome, e.nome_destinatario) as destinatario, l.codigo as local,
            e.ocorrido_em::text as ocorrido_em, us.nome as recebido_por
          from encomendas e
          left join unidades u on u.id = e.unidade_id
          left join pessoas p on p.id = e.pessoa_id
          left join locais_guarda l on l.id = e.local_guarda_id
          left join usuarios us on us.id = e.recebido_por
          where ${sql.join(condicoes, sql` and `)}
          order by e.ocorrido_em desc, e.id desc
          limit ${TAMANHO_DA_PAGINA + 1}`),
      );
      const pagina = r.slice(0, TAMANHO_DA_PAGINA);
      const ultima = pagina.at(-1);
      return {
        proximo:
          r.length > TAMANHO_DA_PAGINA && ultima
            ? codificarCursor(ultima.ocorrido_em, ultima.id)
            : null,
        itens: pagina.map((l): LinhaEncomendaRepo => ({
          id: l.id,
          codigoCurto: l.codigo_curto,
          estado: l.estado,
          unidadeCodigo: l.unidade_codigo,
          destinatario: l.destinatario,
          local: l.local,
          ocorridoEm: new Date(l.ocorrido_em),
          recebidoPor: l.recebido_por,
        })),
      };
    });
  },

  async contadores(ctx, p) {
    return withTenantDb(tenant(ctx), async (db) => {
      const [r] = linhas<{
        todas: number;
        prontas: number;
        falha: number;
        prazo: number;
        nao_ident: number;
      }>(
        await db.execute(sql`
          select count(*)::int as todas,
            count(*) filter (where e.estado = 'NOTIFICADA')::int as prontas,
            count(*) filter (where e.estado = 'FALHA_NOTIFICACAO')::int as falha,
            count(*) filter (where ${condicaoFiltro("prazo", p)})::int as prazo,
            count(*) filter (where e.estado = 'NAO_IDENTIFICADA')::int as nao_ident
          from encomendas e
          where e.empreendimento_id = ${ctx.empreendimentoId}::uuid
            and e.estado not in ${TERMINAIS}`),
      );
      return {
        todas: r?.todas ?? 0,
        prontas: r?.prontas ?? 0,
        falha: r?.falha ?? 0,
        prazo: r?.prazo ?? 0,
        naoIdent: r?.nao_ident ?? 0,
      };
    });
  },

  async detalhe(ctx, id): Promise<DetalheRepo | null> {
    if (!ehUuid(id)) return null;
    return withTenantDb(tenant(ctx), async (db) => {
      const [d] = linhas<{
        id: string;
        codigo_curto: string;
        estado: Estado;
        versao: number;
        ocorrido_em: Date;
        registrado_em: Date;
        origem: "online" | "offline";
        volumes: number;
        porte: string | null;
        excepcional: string | null;
        transportadora: string | null;
        rastreio: string | null;
        unidade_id: string | null;
        unidade_codigo: string | null;
        destinatario: string | null;
        local_id: string | null;
        local_codigo: string | null;
        ponto_id: string | null;
        ponto_nome: string | null;
        recebido_por: string | null;
      }>(
        await db.execute(sql`
          select e.id, e.codigo_curto, e.estado, e.versao, e.ocorrido_em, e.registrado_em, e.origem,
            e.volumes, e.porte, e.excepcional, e.transportadora, e.rastreio,
            u.id as unidade_id, u.codigo as unidade_codigo,
            coalesce(p.nome, e.nome_destinatario) as destinatario,
            l.id as local_id, l.codigo as local_codigo, pr.id as ponto_id, pr.nome as ponto_nome,
            us.nome as recebido_por
          from encomendas e
          left join unidades u on u.id = e.unidade_id
          left join pessoas p on p.id = e.pessoa_id
          left join locais_guarda l on l.id = e.local_guarda_id
          left join pontos_recebimento pr on pr.id = e.ponto_id
          left join usuarios us on us.id = e.recebido_por
          where e.id = ${id}::uuid and e.empreendimento_id = ${ctx.empreendimentoId}::uuid`),
      );
      if (!d) return null;
      const outras = d.unidade_id
        ? linhas<{ id: string; codigo_curto: string; estado: Estado }>(
            await db.execute(sql`
              select id, codigo_curto, estado from encomendas
              where empreendimento_id = ${ctx.empreendimentoId}::uuid
                and unidade_id = ${d.unidade_id}::uuid and id <> ${id}::uuid
                and estado not in ${TERMINAIS}
              order by ocorrido_em
              limit 20`),
          )
        : [];
      return {
        id: d.id,
        codigoCurto: d.codigo_curto,
        estado: d.estado,
        versao: d.versao,
        ocorridoEm: new Date(d.ocorrido_em),
        registradoEm: new Date(d.registrado_em),
        origem: d.origem,
        volumes: d.volumes,
        porte: d.porte,
        excepcional: d.excepcional,
        transportadora: d.transportadora,
        rastreio: d.rastreio,
        unidade:
          d.unidade_id && d.unidade_codigo
            ? { id: d.unidade_id, codigo: d.unidade_codigo }
            : null,
        destinatario: d.destinatario,
        local:
          d.local_id && d.local_codigo
            ? { id: d.local_id, codigo: d.local_codigo }
            : null,
        ponto:
          d.ponto_id && d.ponto_nome
            ? { id: d.ponto_id, nome: d.ponto_nome }
            : null,
        recebidoPor: d.recebido_por,
        outrasAtivas: outras.map((o) => ({
          id: o.id,
          codigoCurto: o.codigo_curto,
          estado: o.estado,
        })),
      };
    });
  },

  async eventos(ctx, id) {
    const vazio: { eventos: EventoDaLinha[]; rotulos: Rotulos } = {
      eventos: [],
      rotulos: { unidades: {}, locais: {}, pontos: {} },
    };
    if (!ehUuid(id)) return vazio;
    return withTenantDb(tenant(ctx), async (db) => {
      const evs = linhas<{
        id: string;
        sequencia: number;
        tipo: TipoEvento;
        dados: EventoDaLinha["dados"];
        motivo: string | null;
        origem: "online" | "offline";
        ator_tipo: "usuario" | "sistema";
        ator_nome: string | null;
        ocorrido_em: Date;
        registrado_em: Date;
      }>(
        await db.execute(sql`
          select ce.id, ce.sequencia, ce.tipo, ce.dados, ce.motivo, ce.origem, ce.ator_tipo,
            us.nome as ator_nome, ce.ocorrido_em, ce.registrado_em
          from custody_events ce
          left join usuarios us on us.id = ce.ator_usuario_id
          where ce.encomenda_id = ${id}::uuid and ce.empreendimento_id = ${ctx.empreendimentoId}::uuid
          order by ce.sequencia`),
      );
      if (evs.length === 0) return vazio;

      const ids = (chave: string) => [
        ...new Set(
          evs.flatMap((e) =>
            [
              e.dados.de?.[chave as "unidade_id"],
              e.dados.para?.[chave as "unidade_id"],
            ].filter(ehUuid),
          ),
        ),
      ];
      const mapa = async (tabela: SQL, coluna: SQL, lista: string[]) => {
        if (lista.length === 0) return {};
        const r = linhas<{ id: string; rotulo: string }>(
          await db.execute(sql`
            select id, ${coluna} as rotulo from ${tabela}
            where empreendimento_id = ${ctx.empreendimentoId}::uuid
              and id in (${sql.join(
                lista.map((x) => sql`${x}::uuid`),
                sql`, `,
              )})`),
        );
        return Object.fromEntries(r.map((x) => [x.id, x.rotulo]));
      };

      return {
        eventos: evs.map((e) => ({
          id: e.id,
          sequencia: e.sequencia,
          tipo: e.tipo,
          dados: e.dados,
          motivo: e.motivo,
          origem: e.origem,
          atorTipo: e.ator_tipo,
          atorNome: e.ator_nome,
          ocorridoEm: new Date(e.ocorrido_em),
          registradoEm: new Date(e.registrado_em),
        })),
        rotulos: {
          unidades: await mapa(sql`unidades`, sql`codigo`, ids("unidade_id")),
          locais: await mapa(
            sql`locais_guarda`,
            sql`codigo`,
            ids("local_guarda_id"),
          ),
          pontos: await mapa(
            sql`pontos_recebimento`,
            sql`nome`,
            ids("ponto_id"),
          ),
        },
      };
    });
  },

  async locaisComOcupacao(ctx, pontoId) {
    return withTenantDb(tenant(ctx), (db) =>
      selecionarLocais(
        db,
        ctx,
        ehUuid(pontoId)
          ? sql`l.ativo and l.ponto_id = ${pontoId}::uuid`
          : sql`l.ativo`,
      ),
    );
  },
};
