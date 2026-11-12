import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDePessoas } from "@/application/pessoas/ports";
import { normalizarEmail, normalizarWhatsapp } from "@/domain/pessoas/contato";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

/** Contato novo nasce sem consentimento; quem consente é `registrarConsentimento`. */
export async function salvarContato(
  deps: DepsDePessoas,
  ctx: Contexto,
  e: { pessoaId: string; canal: "whatsapp" | "email"; valor: string },
): Promise<Resultado<{ id: string }>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const normalizado =
    e.canal === "whatsapp"
      ? normalizarWhatsapp(e.valor)
      : normalizarEmail(e.valor);
  if (!normalizado.ok) {
    return falha("ENTRADA_INVALIDA", "Confira os campos destacados.", {
      valor: normalizado.mensagem,
    });
  }

  const { id } = await deps.repo.salvarContato(ctx, {
    pessoaId: e.pessoaId,
    canal: e.canal,
    valor: normalizado.data,
  });
  // O valor do contato é dado pessoal: a trilha só sabe o canal.
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "CONTATO_SALVO",
    alvoTipo: "contato",
    alvoId: id,
    depois: { pessoa_id: e.pessoaId, canal: e.canal },
    origem: "web",
  });
  return sucesso({ id }, "Contato salvo.");
}
