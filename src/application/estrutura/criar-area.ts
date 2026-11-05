import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDeEstrutura, NovaArea } from "@/application/estrutura/ports";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export async function criarArea(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  a: NovaArea,
): Promise<Resultado<{ id: string }>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;
  const nome = a.nome.trim();
  if (!nome) {
    return falha("ENTRADA_INVALIDA", "Informe o nome.", {
      nome: "Informe o nome.",
    });
  }

  const { id } = await deps.repo.criarArea(ctx, { ...a, nome });
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "AREA_CRIADA",
    alvoTipo: "area",
    alvoId: id,
    depois: { nome },
    origem: "web",
  });
  return sucesso({ id }, `${nome} criada.`);
}
