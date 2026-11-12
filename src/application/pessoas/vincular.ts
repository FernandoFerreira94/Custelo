import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDePessoas } from "@/application/pessoas/ports";
import type { TipoDeVinculo } from "@/domain/pessoas/vinculo";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

/** Liga uma pessoa que já existe a uma unidade (ela pode morar em várias). */
export async function vincular(
  deps: DepsDePessoas,
  ctx: Contexto,
  e: {
    pessoaId: string;
    unidadeId: string;
    tipo: Exclude<TipoDeVinculo, "autorizado">;
    recebeAviso?: boolean;
  },
): Promise<Resultado<{ id: string }>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const ativo = await deps.repo.vinculoAtivo(ctx, e.pessoaId, e.unidadeId);
  if (ativo) {
    return falha("DUPLICADO", "Esta pessoa já está vinculada a esta unidade.");
  }

  const { id } = await deps.repo.criarVinculo(ctx, {
    pessoaId: e.pessoaId,
    unidadeId: e.unidadeId,
    tipo: e.tipo,
    recebeAviso: e.recebeAviso ?? true,
  });
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "VINCULO_CRIADO",
    alvoTipo: "vinculo",
    alvoId: id,
    depois: { pessoa_id: e.pessoaId, unidade_id: e.unidadeId, tipo: e.tipo },
    origem: "web",
  });
  return sucesso({ id }, "Vínculo criado.");
}
