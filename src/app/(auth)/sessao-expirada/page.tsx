import Link from "next/link";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";
import { caminhoInterno } from "@/lib/caminho-interno";

export default async function SessaoExpirada({
  searchParams,
}: {
  searchParams: Promise<{ voltar?: string }>;
}) {
  const { voltar } = await searchParams;
  const destino = caminhoInterno(voltar);
  const href =
    destino === "/"
      ? "/entrar"
      : `/entrar?voltar=${encodeURIComponent(destino)}`;

  return (
    <TelaDeEstado
      status="warning"
      titulo="Sua sessão terminou"
      descricao="Por segurança, saímos depois de um tempo parado. Entre de novo para continuar de onde parou."
      acoes={
        <Button asChild shape="pill" size="lg">
          <Link href={href}>Entrar de novo</Link>
        </Button>
      }
    />
  );
}
