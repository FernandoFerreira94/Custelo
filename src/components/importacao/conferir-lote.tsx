"use client"; // filtro, correção por linha e confirmação mudam o estado da tela

import { ArrowLeftIcon, DownloadIcon, PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { contarLote, linhaEntra } from "@/application/importacao/selecao";
import type { LinhaDoLote } from "@/application/importacao/ports";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty";
import { FilterCounters } from "@/components/ui/filter-counters";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { relatorioDeErros } from "@/domain/importacao/relatorio-de-erros";
import type { Resultado } from "@/lib/resultado";

import { SITUACAO_NA_TELA } from "./rotulos";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

function entradaDa(l: LinhaDoLote): Record<string, string> {
  const e = l.dados._entrada;
  return e && typeof e === "object" ? (e as Record<string, string>) : {};
}

/** IMP-012 (conferir) e IMP-014 (confirmar): as duas etapas ficam na mesma página. */
export function ConferirLote({
  loteId,
  linhas,
  cabecalhos,
  voltarPara,
  corrigir,
  decidir,
  confirmar,
  cancelar,
}: {
  loteId: string;
  linhas: LinhaDoLote[];
  cabecalhos: string[];
  voltarPara: string;
  corrigir: Acao;
  decidir: Acao;
  confirmar: Acao;
  cancelar: Acao;
}) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"conferir" | "confirmar">("conferir");
  const [filtro, setFiltro] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [autorizou, setAutorizou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const c = contarLote(linhas);
  const visiveis = filtro
    ? linhas.filter((l) => l.situacao === filtro)
    : linhas;

  function rodar(acao: Acao, entrada: unknown, depois: () => void) {
    setErro(null);
    iniciar(async () => {
      const r = await acao(entrada);
      if (!r.ok) return setErro(r.mensagem);
      depois();
    });
  }

  function baixarRelatorio() {
    const fora = linhas.filter((l) => !linhaEntra(l));
    const csv = relatorioDeErros(
      cabecalhos,
      fora.map((l) => ({
        numeroLinha: l.numeroLinha,
        situacao: SITUACAO_NA_TELA[l.situacao].rotulo,
        problemas: l.problemas,
        entrada: entradaDa(l),
      })),
    );
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-de-erros.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (c.entram === 0 && c.semDecisao === 0) {
    return (
      <EmptyState
        title="Nenhuma linha pronta."
        description="Corrija no arquivo e envie de novo."
        action={
          <Button onClick={baixarRelatorio}>
            <DownloadIcon /> Baixar relatório de erros
          </Button>
        }
        secondaryAction={
          <Button
            variant="outline"
            disabled={pendente}
            onClick={() =>
              rodar(cancelar, { loteId }, () => router.push(voltarPara))
            }
          >
            Enviar outro arquivo
          </Button>
        }
      />
    );
  }

  if (etapa === "confirmar") {
    return (
      <div className="grid max-w-xl gap-5">
        <h2 className="font-display text-2xl font-bold">
          Confirmar importação
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Resumo rotulo="Entram" valor={c.entram} />
          <Resumo rotulo="Com aviso" valor={c.avisos} />
          <Resumo rotulo="Com erro (ficam de fora)" valor={c.erros} />
          <Resumo rotulo="Duplicadas sem decisão" valor={c.semDecisao} />
        </dl>
        <div className="flex items-start gap-3">
          <Checkbox
            id="autorizacao"
            checked={autorizou}
            onCheckedChange={(v) => setAutorizou(v === true)}
          />
          <Label htmlFor="autorizacao">
            Confirmo que tenho autorização para cadastrar estes dados.
          </Label>
        </div>
        {erro ? (
          <Alert variant="danger" role="alert">
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            disabled={!autorizou || pendente}
            onClick={() =>
              rodar(confirmar, { loteId, confirmou: autorizou }, () =>
                router.refresh(),
              )
            }
          >
            {pendente ? "Importando…" : `Importar ${c.entram} cadastros`}
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled={pendente}
            onClick={() => setEtapa("conferir")}
          >
            <ArrowLeftIcon /> Voltar para a conferência
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <FilterCounters
        value={filtro}
        onValueChange={setFiltro}
        items={[
          { value: "ok", label: "Prontas", count: c.prontas, tone: "success" },
          {
            value: "aviso",
            label: "Com aviso",
            count: c.avisos,
            tone: "warning",
          },
          { value: "erro", label: "Com erro", count: c.erros, tone: "danger" },
          {
            value: "duplicado",
            label: "Duplicadas",
            count: c.duplicadas,
            tone: "info",
          },
        ]}
      />

      {erro ? (
        <Alert variant="danger" role="alert">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Linha</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Problemas</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiveis.map((l) => {
              const s = SITUACAO_NA_TELA[l.situacao];
              return (
                <LinhaDaTabela
                  key={l.id}
                  linha={l}
                  situacao={<Badge variant={s.variante}>{s.rotulo}</Badge>}
                  editando={editando === l.id}
                  cabecalhos={cabecalhos}
                  rascunho={rascunho}
                  pendente={pendente}
                  aoEditar={() => {
                    setEditando(l.id);
                    setRascunho(entradaDa(l));
                  }}
                  aoMudar={(cab, valor) =>
                    setRascunho((r) => ({ ...r, [cab]: valor }))
                  }
                  aoSalvar={() =>
                    rodar(
                      corrigir,
                      { loteId, linhaId: l.id, dados: rascunho },
                      () => {
                        setEditando(null);
                        router.refresh();
                      },
                    )
                  }
                  aoCancelar={() => setEditando(null)}
                  aoDecidir={(decisao) =>
                    rodar(decidir, { loteId, linhaId: l.id, decisao }, () =>
                      router.refresh(),
                    )
                  }
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          className="h-auto min-h-12 max-w-full whitespace-normal"
          disabled={c.entram === 0 || pendente}
          onClick={() => setEtapa("confirmar")}
        >
          Continuar para a confirmação
        </Button>
        {c.erros > 0 ? (
          <Button variant="outline" size="lg" onClick={baixarRelatorio}>
            <DownloadIcon /> Baixar relatório de erros
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="lg"
          disabled={pendente}
          onClick={() =>
            rodar(cancelar, { loteId }, () => router.push(voltarPara))
          }
        >
          Cancelar importação
        </Button>
      </div>
      {c.semDecisao > 0 ? (
        <p className="text-sm text-muted-foreground">
          {c.semDecisao} duplicada(s) sem decisão não entram na importação.
        </p>
      ) : null}
    </div>
  );
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="font-display text-2xl font-bold">{valor}</dd>
    </div>
  );
}

function LinhaDaTabela({
  linha,
  situacao,
  editando,
  cabecalhos,
  rascunho,
  pendente,
  aoEditar,
  aoMudar,
  aoSalvar,
  aoCancelar,
  aoDecidir,
}: {
  linha: LinhaDoLote;
  situacao: React.ReactNode;
  editando: boolean;
  cabecalhos: string[];
  rascunho: Record<string, string>;
  pendente: boolean;
  aoEditar: () => void;
  aoMudar: (cabecalho: string, valor: string) => void;
  aoSalvar: () => void;
  aoCancelar: () => void;
  aoDecidir: (d: "atualizar" | "ignorar") => void;
}) {
  const duplicada = linha.situacao === "duplicado";
  return (
    <>
      <TableRow>
        <TableCell>{linha.numeroLinha}</TableCell>
        <TableCell>{situacao}</TableCell>
        <TableCell className="whitespace-normal">
          {linha.problemas.length > 0 ? linha.problemas.join(" ") : "—"}
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-2">
            {duplicada ? (
              <>
                <Button
                  variant={
                    linha.decisao === "atualizar" ? "default" : "outline"
                  }
                  disabled={pendente}
                  onClick={() => aoDecidir("atualizar")}
                >
                  Atualizar
                </Button>
                <Button
                  variant={linha.decisao === "ignorar" ? "default" : "outline"}
                  disabled={pendente}
                  onClick={() => aoDecidir("ignorar")}
                >
                  Ignorar
                </Button>
              </>
            ) : null}
            <Button
              variant="ghost"
              disabled={pendente}
              onClick={aoEditar}
              aria-label={`Corrigir a linha ${linha.numeroLinha}`}
            >
              <PencilIcon /> Corrigir
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {editando ? (
        <TableRow>
          <TableCell colSpan={4}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cabecalhos.map((cab) => (
                <div key={cab} className="grid gap-1">
                  <Label htmlFor={`${linha.id}-${cab}`}>{cab}</Label>
                  <Input
                    id={`${linha.id}-${cab}`}
                    value={rascunho[cab] ?? ""}
                    onChange={(e) => aoMudar(cab, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button disabled={pendente} onClick={aoSalvar}>
                Salvar correção
              </Button>
              <Button variant="ghost" onClick={aoCancelar}>
                Cancelar
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
