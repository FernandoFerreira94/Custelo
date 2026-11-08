import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDePessoas } from "@/application/pessoas/ports";
import { validarCpf } from "@/domain/pessoas/cpf";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export type EntradaDeAutorizacao = {
  unidadeId: string;
  nome: string;
  cpf: string;
  relacao: string;
  valeAte: Date;
  /** Morador que autoriza: precisa ter vínculo ativo na unidade. */
  emNomeDePessoaId: string;
  /** Pessoa que já existe; sem ela, o caso de uso cria. */
  pessoaId?: string;
};

function inicioDoDia(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/** Autorizado retira encomenda até uma data. Não recebe aviso. */
export async function autorizarRetirada(
  deps: DepsDePessoas,
  ctx: Contexto,
  e: EntradaDeAutorizacao,
): Promise<Resultado<{ pessoaId: string; vinculoId: string }>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const campos: Record<string, string> = {};
  const nome = e.nome.trim().replace(/\s+/g, " ");
  if (!nome) campos.nome = "Informe o nome.";
  const cpf = validarCpf(e.cpf);
  if (!cpf.ok) campos.cpf = cpf.mensagem;
  if (e.valeAte < inicioDoDia(deps.agora())) {
    campos.valeAte = "A data precisa ser hoje ou depois.";
  }
  const emNome = await deps.repo.vinculoAtivo(
    ctx,
    e.emNomeDePessoaId,
    e.unidadeId,
  );
  if (!emNome) {
    campos.emNomeDe = "Escolha um morador com vínculo ativo nesta unidade.";
  }
  if (Object.keys(campos).length > 0) {
    return falha("ENTRADA_INVALIDA", "Confira os campos destacados.", campos);
  }

  const pessoaId =
    e.pessoaId ??
    (await deps.repo.criarPessoa(ctx, { nome, cpf: cpf.ok ? cpf.data : null }))
      .id;
  const { id: vinculoId } = await deps.repo.criarVinculo(ctx, {
    pessoaId,
    unidadeId: e.unidadeId,
    tipo: "autorizado",
    recebeAviso: false,
    relacao: e.relacao.trim() || null,
    emNomeDePessoaId: e.emNomeDePessoaId,
    vigenciaFim: e.valeAte,
  });
  // Sem CPF na trilha: só a unidade e a validade.
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "AUTORIZACAO_CRIADA",
    alvoTipo: "vinculo",
    alvoId: vinculoId,
    depois: { unidade_id: e.unidadeId, vale_ate: e.valeAte.toISOString() },
    origem: "web",
  });
  return sucesso({ pessoaId, vinculoId }, `${nome} autorizada a retirar.`);
}
