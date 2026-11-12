import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDePessoas } from "@/application/pessoas/ports";
import { encerrarVinculo } from "@/domain/pessoas/vinculo";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export async function revogarAutorizacao(
  deps: DepsDePessoas,
  ctx: Contexto,
  e: { vinculoId: string; motivo: string },
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const atual = await deps.repo.buscarVinculo(ctx, e.vinculoId);
  if (!atual || atual.tipo !== "autorizado") {
    return falha("NAO_ENCONTRADO", "Não achamos essa autorização.");
  }
  const encerrado = encerrarVinculo(atual, {
    motivo: e.motivo,
    agora: deps.agora(),
  });
  if (!encerrado.ok) return encerrado;

  await deps.repo.salvarVinculoEncerrado(ctx, encerrado.data);
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "AUTORIZACAO_REVOGADA",
    alvoTipo: "vinculo",
    alvoId: e.vinculoId,
    motivo: encerrado.data.motivoEncerramento,
    origem: "web",
  });
  return sucesso(null, "Autorização revogada.");
}
