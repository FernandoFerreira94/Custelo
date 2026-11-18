import Link from "next/link";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";

/** Inexistente ou de outro empreendimento: a mesma resposta, sem revelar nada. */
export function EncomendaNaoEncontrada({ fila }: { fila: string }) {
  return (
    <TelaDeEstado
      status="404"
      titulo="Encomenda não encontrada"
      descricao="Não achamos esta encomenda neste empreendimento. Confira o código ou volte para a fila."
      acoes={
        <Button asChild shape="pill" size="lg">
          <Link href={fila}>Voltar para a fila</Link>
        </Button>
      }
    />
  );
}
