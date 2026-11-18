import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { visaoDoDetalhe } from "@/infrastructure/custodia/visao-detalhe";
import { responder } from "@/infrastructure/http/resposta";

export const dynamic = "force-dynamic";

/** CUS-002/003 da portaria. Id de outro empreendimento responde 404, igual a inexistente. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return responder(ctx);
  const { id } = await params;
  return responder(await visaoDoDetalhe(ctx.data, id));
}
