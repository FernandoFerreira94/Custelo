import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDeEstrutura, NovoPonto } from "@/application/estrutura/ports";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export async function criarPonto(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  p: NovoPonto,
): Promise<Resultado<{ id: string }>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;
  const nome = p.nome.trim();
  if (!nome) {
    return falha("ENTRADA_INVALIDA", "Informe o nome.", {
      nome: "Informe o nome.",
    });
  }

  const { id } = await deps.repo.criarPonto(ctx, { ...p, nome });
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "PONTO_CRIADO",
    alvoTipo: "ponto_recebimento",
    alvoId: id,
    depois: { nome },
    origem: "web",
  });
  return sucesso({ id }, `${nome} criado.`);
}

export async function editarPonto(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  id: string,
  p: Partial<NovoPonto> & { ativo?: boolean },
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  await deps.repo.atualizarPonto(ctx, id, p);
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "PONTO_EDITADO",
    alvoTipo: "ponto_recebimento",
    alvoId: id,
    depois: { campos: Object.keys(p) },
    origem: "web",
  });
  return sucesso(null, "Ponto atualizado.");
}
