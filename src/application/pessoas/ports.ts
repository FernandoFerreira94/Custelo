import type { Auditoria } from "@/application/auditoria/ports";
import type { Contexto } from "@/application/auth/contexto";
import type { Pagina } from "@/application/estrutura/ports";
import type { Contato } from "@/domain/pessoas/contato";
import type { TipoDeVinculo, Vinculo } from "@/domain/pessoas/vinculo";

export type ContatoNovo = {
  canal: "whatsapp" | "email";
  /** Já normalizado (E.164 ou e-mail em minúsculas). */
  valor: string;
  consentimento?: { em: Date; origem: "gestor" | "opt_in"; por: string };
};

export type VinculoNovo = {
  pessoaId: string;
  unidadeId: string;
  tipo: TipoDeVinculo;
  recebeAviso: boolean;
  ordemAviso?: number;
  relacao?: string | null;
  emNomeDePessoaId?: string | null;
  vigenciaFim?: Date | null;
};

export type PessoaResumo = {
  id: string;
  nome: string;
  unidades: string[];
  ativo: boolean;
};

export type PessoaBruta = {
  id: string;
  nome: string;
  /** Só dígitos. Nunca sai daqui sem passar pelo caso de uso. */
  cpf: string | null;
  contatos: (Contato & { id: string })[];
  vinculos: (Vinculo & { unidadeCodigo: string })[];
};

export type FiltroDePessoas = {
  busca?: string;
  unidadeId?: string;
  cursor?: string;
};

export interface PessoasRepo {
  /** Pessoa + vínculo + contatos numa transação só. */
  criarPessoaCompleta(
    ctx: Contexto,
    e: {
      nome: string;
      cpf?: string | null;
      vinculo: Omit<VinculoNovo, "pessoaId">;
      contatos: ContatoNovo[];
    },
  ): Promise<{ pessoaId: string; vinculoId: string }>;
  criarPessoa(
    ctx: Contexto,
    e: { nome: string; cpf?: string | null },
  ): Promise<{ id: string }>;
  pessoaAtivaNaUnidadePorNome(
    ctx: Contexto,
    unidadeId: string,
    nomeNormalizado: string,
  ): Promise<{ id: string } | null>;
  vinculoAtivo(
    ctx: Contexto,
    pessoaId: string,
    unidadeId: string,
  ): Promise<{ id: string } | null>;
  criarVinculo(ctx: Contexto, v: VinculoNovo): Promise<{ id: string }>;
  buscarVinculo(ctx: Contexto, id: string): Promise<Vinculo | null>;
  salvarVinculoEncerrado(ctx: Contexto, v: Vinculo): Promise<void>;
  salvarContato(
    ctx: Contexto,
    e: { pessoaId: string } & Omit<ContatoNovo, "consentimento">,
  ): Promise<{ id: string }>;
  marcarConsentimento(
    ctx: Contexto,
    contatoId: string,
    c: { em: Date; origem: "gestor" | "opt_in"; por: string },
  ): Promise<void>;
  pessoaPorId(ctx: Contexto, id: string): Promise<PessoaBruta | null>;
  listarPessoas(
    ctx: Contexto,
    f: FiltroDePessoas,
  ): Promise<Pagina<PessoaResumo>>;
  pessoasDaUnidade(ctx: Contexto, unidadeId: string): Promise<PessoaBruta[]>;
  unidadesDaPessoa(
    ctx: Contexto,
    pessoaId: string,
  ): Promise<{ id: string; codigo: string }[]>;
}

export type DepsDePessoas = {
  repo: PessoasRepo;
  auditoria: Auditoria;
  agora: () => Date;
};
