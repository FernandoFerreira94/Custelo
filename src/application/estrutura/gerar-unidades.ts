import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { DepsDeEstrutura } from "@/application/estrutura/ports";
import { gerarUnidades as planejar } from "@/domain/estrutura/gerador";
import { normalizarCodigo, semAcento } from "@/domain/estrutura/unidade";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

const MOSTRAR_CONFLITOS = 5;

export async function gerarUnidades(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  entrada: Parameters<typeof planejar>[0],
): Promise<Resultado<{ unidades: number; blocos: number }>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const plano = planejar(entrada);
  if (!plano.ok) return plano;

  const blocos = plano.data.blocos.map((b) => ({
    ...b,
    andares: b.andares.map((a) => ({
      ...a,
      unidades: a.unidades.map((u) => ({ ...u, codigo: semAcento(u.codigo) })),
    })),
  }));
  const codigos = blocos.flatMap((b) =>
    b.andares.flatMap((a) => a.unidades.map((u) => u.codigo)),
  );

  // Tudo ou nada: se qualquer código já existe, nada é criado.
  const existentes = new Set(
    await deps.repo.codigosNormalizadosExistentes(
      ctx,
      codigos.map(normalizarCodigo),
    ),
  );
  if (existentes.size > 0) {
    const conflitos = codigos.filter((c) =>
      existentes.has(normalizarCodigo(c)),
    );
    const lista = conflitos.slice(0, MOSTRAR_CONFLITOS).join(", ");
    const resto = conflitos.length > MOSTRAR_CONFLITOS ? "…" : "";
    return falha(
      "CONFLITO",
      `Já existem: ${lista}${resto}. Ajuste e gere de novo.`,
    );
  }

  const criado = await deps.repo.criarEstruturaEmLote(ctx, { blocos });
  const comBloco = blocos.filter((b) => b.nome !== "").length;
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "UNIDADES_GERADAS",
    alvoTipo: "unidade",
    depois: { unidades: criado.unidades, blocos: comBloco },
    origem: "web",
  });
  const onde =
    comBloco === 0
      ? ""
      : ` em ${comBloco} ${comBloco === 1 ? "bloco" : "blocos"}`;
  return sucesso(
    { unidades: criado.unidades, blocos: comBloco },
    `${criado.unidades} unidades criadas${onde}.`,
  );
}
