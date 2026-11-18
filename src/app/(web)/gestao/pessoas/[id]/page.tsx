import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { pode } from "@/application/permissoes";
import { SemPermissao } from "@/components/feedback/sem-permissao";
import { DetalhePessoa } from "@/components/pessoas/detalhe-pessoa";
import { Button } from "@/components/ui/button";
import { mascararCpf } from "@/domain/pessoas/cpf";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";
import { pessoasRepo } from "@/infrastructure/pessoas/pessoas-repo";

import {
  autorizarRetiradaAction,
  definirRecebeAvisoAction,
  detalhePessoaAction,
  encerrarVinculoAction,
  registrarConsentimentoAction,
  revogarAutorizacaoAction,
  salvarContatoAction,
  vincularAction,
} from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pessoa" };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** PES-002 e PES-003: detalhe da pessoa, com abas. O CPF chega mascarado ao navegador. */
export default async function PessoaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await contextoDaSessao();
  if (!ctx.ok || !pode(ctx.data.papel, "cadastro.ler")) {
    return <SemPermissao voltarPara="/gestao" />;
  }
  if (!UUID.test(id)) notFound();

  const podeEditar = pode(ctx.data.papel, "cadastro.editar");
  const pessoa = await pessoasRepo.pessoaPorId(ctx.data, id);
  if (!pessoa) notFound();

  const [autorizados, unidades] = await Promise.all([
    pessoasRepo.autorizadosDe(ctx.data, id),
    podeEditar ? estruturaRepo.resumoDeUnidades(ctx.data) : Promise.resolve([]),
  ]);

  return (
    <main className="grid content-start gap-6">
      <h1 className="sr-only">Pessoa: {pessoa.nome}</h1>
      <div>
        <Button asChild variant="ghost">
          <Link href="/gestao/pessoas">
            <ArrowLeftIcon aria-hidden />
            Pessoas
          </Link>
        </Button>
      </div>
      <DetalhePessoa
        // O CPF completo nunca vai na página: só pela ação "Mostrar", que é auditada.
        pessoa={{ ...pessoa, cpf: pessoa.cpf ? mascararCpf(pessoa.cpf) : null }}
        autorizados={autorizados}
        unidadesDisponiveis={unidades.map((u) => ({
          id: u.id,
          codigo: u.codigo,
        }))}
        podeEditar={podeEditar}
        acoes={{
          detalhe: detalhePessoaAction,
          consentir: registrarConsentimentoAction,
          salvarContato: salvarContatoAction,
          definirAviso: definirRecebeAvisoAction,
          encerrar: encerrarVinculoAction,
          revogar: revogarAutorizacaoAction,
          vincular: vincularAction,
          autorizar: autorizarRetiradaAction,
        }}
      />
    </main>
  );
}
