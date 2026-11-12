import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDePessoas } from "@/application/pessoas/ports";
import { encerrarVinculo as encerrar } from "@/domain/pessoas/vinculo";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

/** Encerra o vínculo, desliga o aviso e deixa o motivo na auditoria. Não apaga nada. */
export async function encerrarVinculo(
  deps: DepsDePessoas,
  ctx: Contexto,
  e: { vinculoId: string; motivo: string },
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const atual = await deps.repo.buscarVinculo(ctx, e.vinculoId);
  if (!atual) return falha("NAO_ENCONTRADO", "Não achamos esse vínculo.");

  const encerrado = encerrar(atual, { motivo: e.motivo, agora: deps.agora() });
  if (!encerrado.ok) return encerrado;

  await deps.repo.salvarVinculoEncerrado(ctx, encerrado.data);
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "VINCULO_ENCERRADO",
    alvoTipo: "vinculo",
    alvoId: e.vinculoId,
    antes: { status: "ativo", recebe_aviso: atual.recebeAviso },
    depois: { status: "encerrado", recebe_aviso: false },
    motivo: encerrado.data.motivoEncerramento,
    origem: "web",
  });
  return sucesso(null, "Vínculo encerrado.");
}
