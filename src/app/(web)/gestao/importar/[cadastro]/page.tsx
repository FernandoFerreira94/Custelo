import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pode } from "@/application/permissoes";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import { ConcluirLote } from "@/components/importacao/concluir-lote";
import { ConferirLote } from "@/components/importacao/conferir-lote";
import { EnviarPlanilha } from "@/components/importacao/enviar-planilha";
import {
  cadastroDoSlug,
  CADASTRO_NA_TELA,
} from "@/components/importacao/rotulos";
import { colunasDe } from "@/domain/importacao/colunas";
import { linhaEntra } from "@/application/importacao/selecao";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { importacaoRepo } from "@/infrastructure/importacao/importacao-repo";

import {
  cancelarLoteAction,
  confirmarImportacaoAction,
  corrigirLinhaAction,
  decidirDuplicadoAction,
  desfazerImportacaoAction,
  enviarPlanilhaAction,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Importar planilha" };

const VOLTAR: Record<string, string> = {
  unidades: "/gestao/unidades",
  moradores: "/gestao/pessoas",
  lojistas: "/gestao/pessoas",
  autorizados: "/gestao/pessoas",
  areas_comuns: "/gestao/estrutura",
};
const JANELA_PARA_DESFAZER_MS = 24 * 60 * 60 * 1000;

/** IMP-011, 012, 014 e 015: o parâmetro `lote` decide a etapa; sem ele, é o envio. */
export default async function ImportarPage({
  params,
  searchParams,
}: {
  params: Promise<{ cadastro: string }>;
  searchParams: Promise<{ lote?: string }>;
}) {
  const { cadastro: slug } = await params;
  const { lote: loteId } = await searchParams;
  const cadastro = cadastroDoSlug(slug);
  if (!cadastro) notFound();

  const ctx = await contextoDaSessao();
  if (!ctx.ok || !pode(ctx.data.papel, "importacao.executar")) {
    return <SemPermissao voltarPara="/gestao" />;
  }
  const tela = CADASTRO_NA_TELA[cadastro]!;
  const voltarPara = VOLTAR[cadastro] ?? "/gestao";
  const lote = loteId
    ? await importacaoRepo.buscarLote(ctx.data, loteId)
    : null;
  if (loteId && (!lote || lote.cadastro !== cadastro)) notFound();

  const titulo = (
    <div>
      <h1 className="font-display text-4xl font-bold">
        Importar {tela.rotulo.toLowerCase()}
      </h1>
      <p className="text-muted-foreground">
        Envie a planilha, confira as linhas e só então importe.
      </p>
    </div>
  );

  if (!lote || lote.status === "cancelada") {
    return (
      <main className="grid content-start gap-6">
        {titulo}
        <EnviarPlanilha
          cadastro={cadastro}
          slug={tela.slug}
          modelo={tela.modelo}
          enviar={enviarPlanilhaAction}
        />
      </main>
    );
  }

  const linhas = await importacaoRepo.listarLinhas(ctx.data, lote.id);

  if (lote.status === "conferindo") {
    return (
      <main className="grid content-start gap-6">
        {titulo}
        <ConferirLote
          loteId={lote.id}
          linhas={linhas}
          cabecalhos={colunasDe(cadastro).map((c) => c.cabecalho)}
          voltarPara={`/gestao/importar/${tela.slug}`}
          corrigir={corrigirLinhaAction}
          decidir={decidirDuplicadoAction}
          confirmar={confirmarImportacaoAction}
          cancelar={cancelarLoteAction}
        />
      </main>
    );
  }

  const importados = linhas.filter(linhaEntra).length;
  const limite = lote.confirmadoEm
    ? new Date(lote.confirmadoEm.getTime() + JANELA_PARA_DESFAZER_MS)
    : null;
  return (
    <main className="grid content-start gap-6">
      {titulo}
      {lote.status === "desfeita" ? (
        <p role="status">Esta importação foi desfeita.</p>
      ) : (
        <ConcluirLote
          loteId={lote.id}
          importados={importados}
          podeDesfazer={Boolean(limite && limite > new Date())}
          desfazerAte={
            limite?.toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
            }) ?? ""
          }
          verCadastros={voltarPara}
          desfazer={desfazerImportacaoAction}
        />
      )}
    </main>
  );
}
