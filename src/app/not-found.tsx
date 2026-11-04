import Link from "next/link";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";

export default function PaginaNaoEncontrada() {
  return (
    <TelaDeEstado
      titulo="Página não encontrada"
      descricao="O endereço não existe ou foi movido. Confira o link ou volte para o início."
      acoes={
        <Button
          asChild
          className="h-12 min-h-[var(--size-touch-primary)] w-full"
        >
          <Link href="/">Ir para o início</Link>
        </Button>
      }
    />
  );
}
