import Link from "next/link";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";
import { MSG } from "@/lib/mensagens";
import { suporteUrl } from "@/lib/suporte";

/** 403 dentro da superfície: a pessoa está logada, o perfil só não alcança esta tela. */
export function SemPermissao({ voltarPara }: { voltarPara: string }) {
  return (
    <TelaDeEstado
      status="403"
      titulo="Seu perfil não pode abrir esta tela"
      descricao={MSG.semPermissao}
      acoes={
        <>
          <Button asChild shape="pill" size="lg">
            <Link href={voltarPara}>Voltar</Link>
          </Button>
          <Button asChild variant="ghost" shape="pill">
            <a href={suporteUrl}>Falar com o gestor</a>
          </Button>
        </>
      }
    />
  );
}
