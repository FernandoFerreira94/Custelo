import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import {
  type DepsDeEstrutura,
  MSG_ESTRUTURA,
} from "@/application/estrutura/ports";
import {
  montarCodigo,
  normalizarApelidos,
  normalizarCodigo,
  semAcento,
  type TipoUnidade,
} from "@/domain/estrutura/unidade";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export type EntradaDeUnidade = {
  bloco?: string | null;
  numero: string;
  tipo: TipoUnidade;
  areaId?: string | null;
  apelidos?: string[];
  nome?: string | null;
  responsavelPessoaId?: string | null;
  avisarResponsavel?: boolean;
};

/** Valida a regra da área comum. Devolve a falha ou null. */
export function validarResponsavel(e: {
  tipo: TipoUnidade;
  avisarResponsavel?: boolean;
  responsavelPessoaId?: string | null;
}) {
  if (
    e.tipo === "area_comum" &&
    e.avisarResponsavel &&
    !e.responsavelPessoaId
  ) {
    return falha("ENTRADA_INVALIDA", "Confira os campos destacados.", {
      responsavel: MSG_ESTRUTURA.responsavel,
    });
  }
  return null;
}

export function mensagemDeDuplicada(codigo: string): string {
  return `Já existe a unidade ${codigo}. Abra ela para editar.`;
}

export async function criarUnidade(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  e: EntradaDeUnidade,
): Promise<Resultado<{ id: string; codigo: string }>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;
  const invalido = validarResponsavel(e);
  if (invalido) return invalido;

  // O banco não tira acento; o código já entra sem ele para os dois normalizarem igual.
  const codigo = semAcento(
    montarCodigo({ bloco: e.bloco, numero: e.numero, tipo: e.tipo }),
  );
  if (!normalizarCodigo(codigo)) {
    return falha("ENTRADA_INVALIDA", "Informe o número da unidade.", {
      numero: "Informe o número da unidade.",
    });
  }
  const existente = await deps.repo.unidadePorCodigoNormalizado(
    ctx,
    normalizarCodigo(codigo),
  );
  if (existente) return falha("DUPLICADO", mensagemDeDuplicada(codigo));

  const { ids } = await deps.repo.criarUnidades(ctx, [
    {
      codigo,
      tipo: e.tipo,
      areaId: e.areaId ?? null,
      numero: e.numero.trim(),
      apelidos: normalizarApelidos(e.apelidos ?? [], codigo),
      nome: e.nome ?? null,
      responsavelPessoaId: e.responsavelPessoaId ?? null,
      avisarResponsavel: e.avisarResponsavel ?? false,
    },
  ]);
  const id = ids[0]!;
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "UNIDADE_CRIADA",
    alvoTipo: "unidade",
    alvoId: id,
    depois: { codigo, tipo: e.tipo },
    origem: "web",
  });
  return sucesso({ id, codigo }, `Unidade ${codigo} criada.`);
}
