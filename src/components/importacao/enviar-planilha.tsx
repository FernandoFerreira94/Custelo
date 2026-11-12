"use client"; // arquivo escolhido e envio com estado de carregamento

import { DownloadIcon, FileSpreadsheetIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Cadastro } from "@/domain/importacao/colunas";
import type { Resultado } from "@/lib/resultado";

type Envio = (formData: FormData) => Promise<Resultado<{ loteId: string }>>;

/** IMP-011: etapa 1. Formato e tamanho são conferidos de novo no servidor. */
export function EnviarPlanilha({
  cadastro,
  slug,
  modelo,
  enviar,
}: {
  cadastro: Cadastro;
  slug: string;
  modelo: string;
  enviar: Envio;
}) {
  const router = useRouter();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviarArquivo() {
    if (!arquivo) {
      setErro("Escolha o arquivo da planilha.");
      return;
    }
    setErro(null);
    const dados = new FormData();
    dados.set("cadastro", cadastro);
    dados.set("arquivo", arquivo);
    iniciar(async () => {
      const r = await enviar(dados);
      if (!r.ok) return setErro(r.mensagem);
      router.push(`/gestao/importar/${slug}?lote=${r.data.loteId}`);
    });
  }

  return (
    <div className="grid max-w-xl gap-4">
      <Field>
        <FieldLabel htmlFor="arquivo-planilha">Arquivo da planilha</FieldLabel>
        <input
          id="arquivo-planilha"
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          disabled={pendente}
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          className="block min-h-11 w-full rounded-md border border-dashed bg-card p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-secondary-foreground"
        />
        <FieldDescription>
          Formatos .csv ou .xlsx, até 5 MB. No .xlsx, só a aba “Preencha aqui” é
          lida.
        </FieldDescription>
      </Field>

      {erro ? (
        <Alert variant="danger" role="alert">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={enviarArquivo} disabled={pendente} size="lg">
          {pendente ? <Spinner /> : <FileSpreadsheetIcon />}
          {pendente ? "Lendo a planilha…" : "Conferir planilha"}
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href={`/modelos/modelo-${modelo}.xlsx`} download>
            <DownloadIcon /> Baixar modelo
          </a>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Nada é gravado nesta etapa. Você confere as linhas antes de importar.
      </p>
    </div>
  );
}
