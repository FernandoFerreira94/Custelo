import "server-only";

import type { Contexto } from "@/application/auth/contexto";
import {
  detalhe,
  linhaDoTempo,
  locaisComOcupacao,
} from "@/application/custodia/consultas";
import { pode } from "@/application/permissoes";
import {
  paraDetalheDto,
  paraLinhaDto,
  paraLocaisDto,
} from "@/components/custodia/dto";
import { ehTerminal } from "@/domain/custodia/estados";
import { sucesso } from "@/lib/resultado";

import { consultasCustodiaRepo } from "./custodia-repo";

/** Tudo que o detalhe (CUS-002/003/005) precisa, nas duas superfícies. */
export async function visaoDoDetalhe(ctx: Contexto, id: string) {
  const deps = { repo: consultasCustodiaRepo, agora: () => new Date() };
  const d = await detalhe(ctx, id, deps);
  if (!d.ok) return d;
  const [linha, locais] = await Promise.all([
    linhaDoTempo(ctx, id, deps),
    pode(ctx.papel, "custodia.mover") && !ehTerminal(d.data.estado)
      ? locaisComOcupacao(ctx, d.data.ponto?.id, deps)
      : null,
  ]);
  if (!linha.ok) return linha;
  return sucesso({
    detalhe: paraDetalheDto(d.data),
    linha: paraLinhaDto(linha.data),
    locais: locais?.ok ? paraLocaisDto(locais.data, d.data.ponto?.id) : null,
  });
}
