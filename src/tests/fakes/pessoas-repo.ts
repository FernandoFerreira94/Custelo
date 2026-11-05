import type {
  PessoasRepo,
  ContatoNovo,
  VinculoNovo,
} from "@/application/pessoas/ports";
import type { Vinculo } from "@/domain/pessoas/vinculo";

type PessoaFake = { id: string; nome: string; cpf: string | null };
type VinculoFake = Vinculo & { empreendimento: string };

/** Repositório em memória: guarda o que os casos de uso gravaram para os testes olharem. */
export function criarPessoasRepoFake() {
  const estado = {
    pessoas: [] as PessoaFake[],
    vinculos: [] as VinculoFake[],
    contatos: [] as (ContatoNovo & { id: string; pessoaId: string })[],
    consentimentos: [] as { contatoId: string; origem: string; por: string }[],
    transacoes: 0,
  };
  let seq = 0;
  const id = (p: string) => `${p}-${++seq}`;

  const vinculoDe = (
    pessoaId: string,
    unidadeId: string,
    v: Omit<VinculoNovo, "pessoaId" | "unidadeId">,
  ): VinculoFake => ({
    id: id("v"),
    pessoaId,
    unidadeId,
    tipo: v.tipo,
    status: "ativo",
    recebeAviso: v.recebeAviso,
    ordemAviso: v.ordemAviso ?? 0,
    vigenciaFim: v.vigenciaFim ?? null,
    empreendimento: "e1",
  });

  const repo: PessoasRepo = {
    async criarPessoaCompleta(_ctx, e) {
      estado.transacoes += 1;
      const pessoa = { id: id("p"), nome: e.nome, cpf: e.cpf ?? null };
      estado.pessoas.push(pessoa);
      const vinculo = vinculoDe(pessoa.id, e.vinculo.unidadeId, e.vinculo);
      estado.vinculos.push(vinculo);
      for (const c of e.contatos) {
        estado.contatos.push({ ...c, id: id("c"), pessoaId: pessoa.id });
      }
      return { pessoaId: pessoa.id, vinculoId: vinculo.id };
    },
    async criarPessoa(_ctx, e) {
      const pessoa = { id: id("p"), nome: e.nome, cpf: e.cpf ?? null };
      estado.pessoas.push(pessoa);
      return { id: pessoa.id };
    },
    async pessoaAtivaNaUnidadePorNome(_ctx, unidadeId, nomeNormalizado) {
      const v = estado.vinculos.find((x) => {
        const p = estado.pessoas.find((y) => y.id === x.pessoaId);
        return (
          x.unidadeId === unidadeId &&
          x.status === "ativo" &&
          p &&
          p.nome
            .normalize("NFD")
            .replace(/\p{M}/gu, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim() === nomeNormalizado
        );
      });
      return v ? { id: v.pessoaId } : null;
    },
    async vinculoAtivo(_ctx, pessoaId, unidadeId) {
      const v = estado.vinculos.find(
        (x) =>
          x.pessoaId === pessoaId &&
          x.unidadeId === unidadeId &&
          x.status === "ativo",
      );
      return v ? { id: v.id } : null;
    },
    async criarVinculo(_ctx, v) {
      const novo = vinculoDe(v.pessoaId, v.unidadeId, v);
      estado.vinculos.push(novo);
      return { id: novo.id };
    },
    async buscarVinculo(_ctx, vinculoId) {
      return estado.vinculos.find((v) => v.id === vinculoId) ?? null;
    },
    async salvarVinculoEncerrado(_ctx, v) {
      const i = estado.vinculos.findIndex((x) => x.id === v.id);
      if (i >= 0) estado.vinculos[i] = { ...estado.vinculos[i]!, ...v };
    },
    async salvarContato(_ctx, e) {
      const novo = { ...e, id: id("c") };
      estado.contatos.push(novo);
      return { id: novo.id };
    },
    async marcarConsentimento(_ctx, contatoId, c) {
      estado.consentimentos.push({ contatoId, origem: c.origem, por: c.por });
    },
    async pessoaPorId(_ctx, pessoaId) {
      const p = estado.pessoas.find((x) => x.id === pessoaId);
      if (!p) return null;
      return {
        id: p.id,
        nome: p.nome,
        cpf: p.cpf,
        contatos: estado.contatos
          .filter((c) => c.pessoaId === p.id)
          .map((c) => ({
            id: c.id,
            canal: c.canal,
            valor: c.valor,
            status: "valido" as const,
            ordem: 0,
            consentimentoEm: c.consentimento?.em ?? null,
          })),
        vinculos: estado.vinculos
          .filter((v) => v.pessoaId === p.id)
          .map((v) => ({ ...v, unidadeCodigo: v.unidadeId })),
      };
    },
    async listarPessoas() {
      return { itens: [] };
    },
    async salvarRecebeAviso(_ctx, vinculoId, recebeAviso) {
      const v = estado.vinculos.find((x) => x.id === vinculoId);
      if (v) v.recebeAviso = recebeAviso;
    },
    async autorizadosDe() {
      return [];
    },
    async contagensDePessoas() {
      return {
        todas: 0,
        titulares: 0,
        moradores: 0,
        inquilinos: 0,
        autorizados: 0,
        semContato: 0,
      };
    },
    async pessoasDaUnidade() {
      return [];
    },
    async unidadesDaPessoa() {
      return [];
    },
  };

  return { repo, estado };
}
