import {
  type DepsDePareamento,
  MSG_PAREAMENTO,
} from "@/application/pareamento/ports";
import { normalizarCodigoDigitado } from "@/domain/aparelho/codigo-local";
import { MSG } from "@/lib/mensagens";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

/**
 * Aparelho informa o código impresso/QR. Devolve o token para o cookie httpOnly e
 * só o nome do local. Formato errado tem a mesma resposta de código inexistente.
 */
export async function parearAparelho(
  deps: DepsDePareamento,
  entrada: { codigo: string; ip: string },
): Promise<Resultado<{ token: string; localNome: string }>> {
  const codigo = normalizarCodigoDigitado(entrada.codigo);
  if (!codigo) return falha("NAO_ENCONTRADO", MSG_PAREAMENTO.naoEncontrado);

  const token = deps.segredos.novoToken();
  const r = await deps.repo.parear(
    codigo,
    deps.segredos.chaveDeOrigem(entrada.ip),
    deps.segredos.sha256(token),
  );
  if (!r.ok) {
    return r.code === "MUITAS_TENTATIVAS"
      ? falha("INDISPONIVEL", MSG.muitasTentativas)
      : falha("NAO_ENCONTRADO", MSG_PAREAMENTO.naoEncontrado);
  }
  return sucesso(
    { token, localNome: r.localNome },
    MSG_PAREAMENTO.pareado(r.localNome),
  );
}

/** Cookie do aparelho → local lembrado. Sem cookie ou revogado: etapa de código volta. */
export async function localLembrado(
  deps: DepsDePareamento,
  token: string | undefined,
) {
  if (!token) return null;
  return deps.repo.localDoAparelho(deps.segredos.sha256(token));
}
