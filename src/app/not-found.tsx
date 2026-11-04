import Link from "next/link";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";

export default function PaginaNaoEncontrada() {
  return (
    <TelaDeEstado
      status="404"
      titulo="Página não encontrada"
      descricao="O endereço mudou ou não existe. Nada foi perdido."
      acoes={
        <Button asChild shape="pill" size="lg">
          <Link href="/">Ir para o início</Link>
        </Button>
      }
    />
  );
}
