import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import type { Pagina } from "@/application/estrutura/ports";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type {
  DepsDePessoas,
  FiltroDePessoas,
  PessoaBruta,
  PessoaResumo,
} from "@/application/pessoas/ports";
import { mascararCpf } from "@/domain/pessoas/cpf";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export async function listarPessoas(
  deps: DepsDePessoas,
  ctx: Contexto,
  filtro: FiltroDePessoas,
): Promise<Resultado<Pagina<PessoaResumo>>> {
  const negado = negarSemPermissao(ctx, "cadastro.ler");
  if (negado) return negado;
  return sucesso(await deps.repo.listarPessoas(ctx, filtro));
}

export async function pessoasDaUnidade(
  deps: DepsDePessoas,
  ctx: Contexto,
  unidadeId: string,
): Promise<Resultado<PessoaBruta[]>> {
  const negado = negarSemPermissao(ctx, "cadastro.ler");
  if (negado) return negado;
  const pessoas = await deps.repo.pessoasDaUnidade(ctx, unidadeId);
  return sucesso(
    pessoas.map((p) => ({ ...p, cpf: p.cpf ? mascararCpf(p.cpf) : null })),
  );
}

export async function unidadesDaPessoa(
  deps: DepsDePessoas,
  ctx: Contexto,
  pessoaId: string,
): Promise<Resultado<{ id: string; codigo: string }[]>> {
  const negado = negarSemPermissao(ctx, "cadastro.ler");
  if (negado) return negado;
  return sucesso(await deps.repo.unidadesDaPessoa(ctx, pessoaId));
}

/**
 * O CPF sai mascarado. O completo só para quem edita cadastro e só quando pede
 * (`mostrarCpf`): cada visualização deixa `CPF_VISUALIZADO` na auditoria, sem o número.
 */
export async function detalhePessoa(
  deps: DepsDePessoas,
  ctx: Contexto,
  id: string,
  opcoes: { mostrarCpf?: boolean } = {},
): Promise<Resultado<PessoaBruta>> {
  const negado = negarSemPermissao(ctx, "cadastro.ler");
  if (negado) return negado;
  if (opcoes.mostrarCpf) {
    const semEdicao = negarSemPermissao(ctx, "cadastro.editar");
    if (semEdicao) return semEdicao;
  }

  const pessoa = await deps.repo.pessoaPorId(ctx, id);
  if (!pessoa) return falha("NAO_ENCONTRADO", "Não achamos essa pessoa.");

  if (opcoes.mostrarCpf && pessoa.cpf) {
    await registrarAuditoria(deps.auditoria, ctx, {
      acao: "CPF_VISUALIZADO",
      alvoTipo: "pessoa",
      alvoId: id,
      origem: "web",
    });
    return sucesso(pessoa);
  }
  return sucesso({
    ...pessoa,
    cpf: pessoa.cpf ? mascararCpf(pessoa.cpf) : null,
  });
}
