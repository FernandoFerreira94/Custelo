import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDePessoas } from "@/application/pessoas/ports";
import { type Resultado, sucesso } from "@/lib/resultado";

/** O gestor marca "o morador autorizou": grava a data, a origem e quem registrou (D3). */
export async function registrarConsentimento(
  deps: DepsDePessoas,
  ctx: Contexto,
  e: { contatoId: string },
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  await deps.repo.marcarConsentimento(ctx, e.contatoId, {
    em: deps.agora(),
    origem: "gestor",
    por: ctx.usuarioId,
  });
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "CONSENTIMENTO_REGISTRADO",
    alvoTipo: "contato",
    alvoId: e.contatoId,
    depois: { origem: "gestor" },
    origem: "web",
  });
  return sucesso(null, "Autorização registrada.");
}
