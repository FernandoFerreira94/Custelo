"use client"; // o desfazer é uma ação com estado de carregamento e erro

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Result } from "@/components/ui/result";
import type { Resultado } from "@/lib/resultado";

/** IMP-015: lote importado, com "Desfazer" enquanto a janela de 24 h estiver aberta. */
export function ConcluirLote({
  loteId,
  importados,
  podeDesfazer,
  desfazerAte,
  verCadastros,
  desfazer,
}: {
  loteId: string;
  importados: number;
  podeDesfazer: boolean;
  /** Texto pronto, já na hora local do servidor (ex.: "14:30 de 07/11"). */
  desfazerAte: string;
  verCadastros: string;
  desfazer: (entrada: unknown) => Promise<Resultado<unknown>>;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  return (
    <div className="grid gap-4">
      <Result
        status="success"
        headingLevel={2}
        title={`${importados} ${importados === 1 ? "cadastro importado" : "cadastros importados"}`}
        description="Os cadastros já estão disponíveis. Nenhuma mensagem foi enviada."
        extra={
          <>
            <Button asChild size="lg">
              <a href={verCadastros}>Ver cadastros</a>
            </Button>
            {podeDesfazer ? (
              <Button
                variant="outline"
                size="lg"
                disabled={pendente}
                onClick={() => {
                  setErro(null);
                  iniciar(async () => {
                    const r = await desfazer({ loteId });
                    if (!r.ok) return setErro(r.mensagem);
                    router.refresh();
                  });
                }}
              >
                {pendente ? "Desfazendo…" : `Desfazer (até ${desfazerAte})`}
              </Button>
            ) : null}
          </>
        }
      />
      {erro ? (
        <Alert variant="danger" role="alert">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
