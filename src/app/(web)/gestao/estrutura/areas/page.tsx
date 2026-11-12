import type { Metadata } from "next";

import { pode } from "@/application/permissoes";
import { AreasEPontos } from "@/components/estrutura/areas-e-pontos";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";
import { pessoasRepo } from "@/infrastructure/pessoas/pessoas-repo";

import { criarPontoAction, editarPontoAction } from "../actions";
import {
  criarUnidadeAction,
  editarUnidadeAction,
} from "../../unidades/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Áreas e pontos de recebimento" };

/** UNI-003 e UNI-004: onde a encomenda pode ser destinada e onde fica guardada. */
export default async function AreasEPontosPage() {
  const ctx = await contextoDaSessao();
  if (!ctx.ok || !pode(ctx.data.papel, "cadastro.ler")) {
    return <SemPermissao voltarPara="/gestao" />;
  }
  const podeEditar = pode(ctx.data.papel, "cadastro.editar");
  const [areas, pontos, pessoas] = await Promise.all([
    estruturaRepo.areasComuns(ctx.data),
    estruturaRepo.pontos(ctx.data),
    pessoasRepo.listarPessoas(ctx.data, {}),
  ]);

  return (
    <main className="grid content-start gap-6">
      <div>
        <h1 className="font-display text-4xl font-bold">
          Áreas e pontos de recebimento
        </h1>
        <p className="text-muted-foreground">
          Onde a encomenda pode ser destinada e onde ela fica guardada.
        </p>
      </div>
      <AreasEPontos
        areas={areas}
        pontos={pontos}
        pessoas={pessoas.itens.map((p) => ({ id: p.id, nome: p.nome }))}
        salvarArea={
          podeEditar
            ? { criar: criarUnidadeAction, editar: editarUnidadeAction }
            : undefined
        }
        salvarPonto={
          podeEditar
            ? { criar: criarPontoAction, editar: editarPontoAction }
            : undefined
        }
        alternarPonto={podeEditar ? editarPontoAction : undefined}
      />
    </main>
  );
}
