"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { Ponto } from "@/application/estrutura/ports";
import { Switch } from "@/components/ui/switch";
import type { Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

/** Liga e desliga o ponto sem apagar nada. Se a ação falhar, o botão volta ao que era. */
export function PontoAtivo({
  ponto,
  alternar,
}: {
  ponto: Ponto;
  alternar: Acao;
}) {
  const router = useRouter();
  const [ativo, setAtivo] = useState(ponto.ativo);
  const [pendente, iniciar] = useTransition();

  function mudar(proximo: boolean) {
    const anterior = ativo;
    setAtivo(proximo);
    iniciar(async () => {
      const r = await alternar({ id: ponto.id, ativo: proximo });
      if (!r.ok) {
        setAtivo(anterior);
        toast.error(r.mensagem);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Switch
      checked={ativo}
      disabled={pendente}
      onCheckedChange={mudar}
      aria-label={`${ponto.nome} ativo`}
    />
  );
}
