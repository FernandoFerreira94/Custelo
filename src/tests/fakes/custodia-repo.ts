import type { EntradaAuditoria } from "@/application/auditoria/ports";
import type {
  CustodiaRepo,
  CustodiaTx,
  EncomendaTravada,
  EventoParaGravar,
  LocalGuarda,
  NovaEncomenda,
} from "@/application/custodia/ports";
import { type Estado, ehTerminal } from "@/domain/custodia/estados";

type EncomendaFake = EncomendaTravada & {
  id: string;
  empreendimentoId: string;
};

type Dados = {
  encomendas: EncomendaFake[];
  eventos: EventoParaGravar[];
  auditoria: EntradaAuditoria[];
};

const PROJECAO: Partial<Record<string, keyof EncomendaTravada>> = {
  unidade_id: "unidadeId",
  pessoa_id: "pessoaId",
  local_guarda_id: "localGuardaId",
  ponto_id: "pontoId",
};

const copiar = (d: Dados): Dados => ({
  encomendas: d.encomendas.map((e) => ({ ...e })),
  eventos: [...d.eventos],
  auditoria: [...d.auditoria],
});

/**
 * Repositório em memória que imita o banco: tenant pela RLS, trava, sequência
 * por encomenda, projeção de `estado`/`versao` e rollback quando `fn` falha ou lança.
 */
export function criarCustodiaRepoFake() {
  let dados: Dados = { encomendas: [], eventos: [], auditoria: [] };
  const locais: (Omit<LocalGuarda, "usado"> & { empreendimentoId: string })[] =
    [];

  const semearLocal = (
    l: Partial<Omit<LocalGuarda, "usado">> & { id: string; codigo: string },
  ) => {
    locais.push({
      pontoId: "p1",
      capacidade: null,
      volumeGrande: false,
      ativo: true,
      empreendimentoId: "e1",
      ...l,
    });
  };

  const semear = (
    e: Partial<EncomendaFake> & { id: string; estado: Estado; versao: number },
  ) => {
    dados.encomendas.push({
      unidadeId: null,
      pessoaId: null,
      localGuardaId: null,
      pontoId: null,
      empreendimentoId: "e1",
      ...e,
    });
  };

  const repo: CustodiaRepo = {
    async naTransacao(ctx, fn) {
      const rascunho = copiar(dados);
      const visivel = (id: string) =>
        rascunho.encomendas.find(
          (e) => e.id === id && e.empreendimentoId === ctx.empreendimentoId,
        );

      const tx: CustodiaTx = {
        async eventoPorId(id) {
          const ev = rascunho.eventos.find((e) => e.id === id);
          return ev
            ? {
                encomendaId: ev.encomendaId,
                sequencia: ev.sequencia,
                estadoNovo: ev.estadoNovo,
              }
            : null;
        },
        async travarEncomenda(id) {
          const e = visivel(id);
          if (!e) return null;
          const { id: _id, empreendimentoId: _emp, ...travada } = e;
          return travada;
        },
        async localPorId(id) {
          const l = locais.find(
            (x) => x.id === id && x.empreendimentoId === ctx.empreendimentoId,
          );
          if (!l) return null;
          const { empreendimentoId: _emp, ...local } = l;
          const usado = rascunho.encomendas.filter(
            (e) => e.localGuardaId === id && !ehTerminal(e.estado),
          ).length;
          return { ...local, usado };
        },
        async criarEncomenda(e: NovaEncomenda) {
          rascunho.encomendas.push({
            id: e.id,
            empreendimentoId: ctx.empreendimentoId,
            estado: "RECEBIDA",
            versao: 0,
            unidadeId: null,
            pessoaId: null,
            localGuardaId: null,
            pontoId: e.pontoId,
          });
        },
        async inserirEvento(ev) {
          const e = visivel(ev.encomendaId);
          if (!e || ev.sequencia !== e.versao + 1)
            throw new Error("sequência fora de ordem");
          rascunho.eventos.push(ev);
          e.estado = ev.estadoNovo;
          e.versao = ev.sequencia;
          for (const [campo, valor] of Object.entries(ev.dados.para ?? {})) {
            const coluna = PROJECAO[campo];
            if (coluna) (e as Record<string, unknown>)[coluna] = valor ?? null;
          }
        },
        async auditar(entrada) {
          rascunho.auditoria.push(entrada);
        },
      };

      const r = await fn(tx);
      if (r.ok) dados = rascunho;
      return r;
    },
  };

  return {
    repo,
    semear,
    semearLocal,
    get encomendas() {
      return dados.encomendas;
    },
    get eventos() {
      return dados.eventos;
    },
    get auditoria() {
      return dados.auditoria;
    },
  };
}
