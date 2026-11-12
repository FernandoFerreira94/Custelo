import {
  AreaEmCiclo,
  type EstruturaRepo,
  type NovaArea,
  type NovaUnidade,
  type PlanoDeEstrutura,
} from "@/application/estrutura/ports";
import type { Contexto } from "@/application/auth/contexto";
import { normalizarCodigo } from "@/domain/estrutura/unidade";

/** Repositório em memória com os ganchos que os testes de caso de uso precisam. */
export function criarEstruturaRepoFake() {
  const estado = {
    unidades: [] as (NovaUnidade & { id: string; ativo: boolean })[],
    areas: [] as (NovaArea & { id: string })[],
    lotes: [] as PlanoDeEstrutura[],
    unidadesAtivasNaArea: new Map<string, number>(),
    vinculosAtivosNaUnidade: new Map<string, number>(),
    cicloAoAtualizarArea: false,
    listagens: [] as unknown[],
    atualizacoesDeUnidade: [] as { id: string; patch: unknown }[],
  };
  let seq = 0;
  const id = () => `id-${++seq}`;

  const repo: EstruturaRepo = {
    async arvore() {
      return [];
    },
    async areasComuns() {
      return [];
    },
    async pontos() {
      return [];
    },
    async contagensDeUnidades() {
      return { todas: 0, semContato: 0, areasComuns: 0, inativas: 0 };
    },
    async resumoDeUnidades() {
      return [];
    },
    async listarUnidades(_ctx: Contexto, f) {
      estado.listagens.push(f);
      return { itens: [] };
    },
    async unidadePorCodigoNormalizado(_ctx, codigoNormalizado) {
      const u = estado.unidades.find(
        (x) => normalizarCodigo(x.codigo) === codigoNormalizado,
      );
      return u ? { id: u.id } : null;
    },
    async codigosNormalizadosExistentes(_ctx, codigos) {
      const existentes = new Set(
        estado.unidades.map((u) => normalizarCodigo(u.codigo)),
      );
      return codigos.filter((c) => existentes.has(c));
    },
    async unidadePorId(_ctx, unidadeId) {
      const u = estado.unidades.find((x) => x.id === unidadeId);
      return u ? { id: u.id, codigo: u.codigo } : null;
    },
    async criarArea(_ctx, a) {
      const nova = { ...a, id: id() };
      estado.areas.push(nova);
      return { id: nova.id };
    },
    async atualizarArea() {
      if (estado.cicloAoAtualizarArea) throw new AreaEmCiclo();
    },
    async criarUnidades(_ctx, lista) {
      const ids = lista.map((u) => {
        const nova = { ...u, id: id(), ativo: true };
        estado.unidades.push(nova);
        return nova.id;
      });
      return { ids };
    },
    async criarEstruturaEmLote(_ctx, plano) {
      estado.lotes.push(plano);
      const andares = plano.blocos.reduce((n, b) => n + b.andares.length, 0);
      const unidades = plano.blocos.reduce(
        (n, b) => n + b.andares.reduce((m, a) => m + a.unidades.length, 0),
        0,
      );
      return { areas: plano.blocos.length + andares, unidades };
    },
    async atualizarUnidade(_ctx, unidadeId, patch) {
      estado.atualizacoesDeUnidade.push({ id: unidadeId, patch });
      const u = estado.unidades.find((x) => x.id === unidadeId);
      if (u) Object.assign(u, patch);
    },
    async contarUnidadesAtivasNaArea(_ctx, areaId) {
      return estado.unidadesAtivasNaArea.get(areaId) ?? 0;
    },
    async contarVinculosAtivosDaUnidade(_ctx, unidadeId) {
      return estado.vinculosAtivosNaUnidade.get(unidadeId) ?? 0;
    },
    async criarPonto() {
      return { id: id() };
    },
    async atualizarPonto() {},
  };

  return { repo, estado };
}
