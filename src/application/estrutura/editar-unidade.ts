import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import {
  mensagemDeDuplicada,
  validarResponsavel,
} from "@/application/estrutura/criar-unidade";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDeEstrutura } from "@/application/estrutura/ports";
import {
  normalizarApelidos,
  normalizarCodigo,
  semAcento,
  type TipoUnidade,
} from "@/domain/estrutura/unidade";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export type EdicaoDeUnidade = {
  codigo?: string;
  tipo?: TipoUnidade;
  areaId?: string | null;
  apelidos?: string[];
  nome?: string | null;
  responsavelPessoaId?: string | null;
  avisarResponsavel?: boolean;
};

export async function editarUnidade(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  id: string,
  e: EdicaoDeUnidade,
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;
  if (e.tipo) {
    const invalido = validarResponsavel({ ...e, tipo: e.tipo });
    if (invalido) return invalido;
  }

  const patch = { ...e };
  if (e.codigo !== undefined) {
    const codigo = semAcento(e.codigo.trim());
    const outra = await deps.repo.unidadePorCodigoNormalizado(
      ctx,
      normalizarCodigo(codigo),
    );
    if (outra && outra.id !== id) {
      return falha("DUPLICADO", mensagemDeDuplicada(codigo));
    }
    patch.codigo = codigo;
    if (e.apelidos) patch.apelidos = normalizarApelidos(e.apelidos, codigo);
  }

  await deps.repo.atualizarUnidade(ctx, id, patch);
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "UNIDADE_EDITADA",
    alvoTipo: "unidade",
    alvoId: id,
    depois: { campos: Object.keys(e) },
    origem: "web",
  });
  return sucesso(null, "Unidade atualizada.");
}
