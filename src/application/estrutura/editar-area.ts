import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import {
  AreaEmCiclo,
  type DepsDeEstrutura,
  MSG_ESTRUTURA,
  type NovaArea,
} from "@/application/estrutura/ports";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export async function editarArea(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  id: string,
  a: Partial<NovaArea>,
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  try {
    await deps.repo.atualizarArea(ctx, id, a);
  } catch (erro) {
    // O banco recusa a árvore com ciclo (trigger AREA_CICLO); o repo traduz.
    if (erro instanceof AreaEmCiclo) {
      return falha("CONFLITO", MSG_ESTRUTURA.ciclo);
    }
    throw erro;
  }
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "AREA_EDITADA",
    alvoTipo: "area",
    alvoId: id,
    depois: { campos: Object.keys(a) },
    origem: "web",
  });
  return sucesso(null, "Área atualizada.");
}
