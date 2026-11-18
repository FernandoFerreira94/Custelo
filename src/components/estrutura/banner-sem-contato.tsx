import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Banner,
  BannerAction,
  BannerContent,
  BannerDescription,
} from "@/components/ui/banner";

/** Unidades que hoje ninguém consegue avisar: a encomenda chega e o aviso não sai. */
export function BannerSemContato({ total }: { total: number }) {
  if (total <= 0) return null;
  return (
    <Banner variant="warning" className="rounded-2xl">
      <AlertTriangleIcon aria-hidden />
      <BannerContent>
        <BannerDescription>
          {total === 1
            ? "1 unidade sem ninguém com contato."
            : `${total} unidades sem ninguém com contato.`}{" "}
          Encomenda para elas não gera aviso.
        </BannerDescription>
      </BannerContent>
      <BannerAction>
        <Button asChild variant="outline" shape="pill">
          <Link href="/gestao/unidades?semContato=1">Ver unidades</Link>
        </Button>
      </BannerAction>
    </Banner>
  );
}
