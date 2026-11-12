import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDePessoas } from "@/application/pessoas/ports";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

/**
 * Liga ou desliga o aviso daquele vínculo. Ligar exige consentimento: sem contato
 * autorizado, o aviso não teria para onde sair (D3), então a tela recusa em vez de fingir.
 */
export async function definirRecebeAviso(
  deps: DepsDePessoas,
  ctx: Contexto,
  e: { vinculoId: string; recebeAviso: boolean },
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const vinculo = await deps.repo.buscarVinculo(ctx, e.vinculoId);
  if (!vinculo) return falha("NAO_ENCONTRADO", "Não achamos esse vínculo.");
  if (vinculo.status !== "ativo") {
    return falha("CONFLITO", "Este vínculo já está encerrado.");
  }
  if (vinculo.tipo === "autorizado") {
    return falha(
      "ENTRADA_INVALIDA",
      "Autorizado retira encomenda, mas não recebe aviso.",
    );
  }

  if (e.recebeAviso) {
    const pessoa = await deps.repo.pessoaPorId(ctx, vinculo.pessoaId);
    const consentido = pessoa?.contatos.some(
      (c) => c.consentimentoEm !== null && c.status !== "falha",
    );
    if (!consentido) {
      return falha(
        "ENTRADA_INVALIDA",
        "Registre a autorização do morador antes de ligar o aviso.",
      );
    }
  }

  await deps.repo.salvarRecebeAviso(ctx, e.vinculoId, e.recebeAviso);
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: e.recebeAviso ? "AVISO_LIGADO" : "AVISO_DESLIGADO",
    alvoTipo: "vinculo",
    alvoId: e.vinculoId,
    origem: "web",
  });
  return sucesso(null, e.recebeAviso ? "Aviso ligado." : "Aviso desligado.");
}
