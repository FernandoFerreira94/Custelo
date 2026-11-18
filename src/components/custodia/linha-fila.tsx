import { PackageIcon } from "lucide-react";
import Link from "next/link";

import type { Badge } from "@/domain/custodia/situacao";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { haQuanto } from "@/lib/tempo";

import { EstadoBadge } from "./estado-badge";

/** Linha da fila (CUS-001 ops), já serializada pela API. */
export type LinhaFilaDto = {
  chave: string;
  unidadeCodigo: string | null;
  destinatario: string | null;
  encomendas: number;
  volumes: number;
  localMaisAntiga: string | null;
  idMaisAntiga: string;
  ocorridoEmMaisAntiga: string;
  badge: Badge;
};

const volumes = (n: number) => `${n} ${n === 1 ? "volume" : "volumes"}`;

/** Uma unidade com encomenda na portaria. O toque abre a mais antiga dela. */
export function LinhaFila({
  linha,
  agora,
}: {
  linha: LinhaFilaDto;
  agora: Date;
}) {
  const quem = linha.destinatario ?? "Sem destino identificado";
  const meta = [
    linha.localMaisAntiga ?? "Sem lugar",
    haQuanto(new Date(linha.ocorridoEmMaisAntiga), agora),
    linha.encomendas > 1 ? `${linha.encomendas} encomendas` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Item variant="outline" asChild>
      <Link href={`/encomendas/${linha.idMaisAntiga}`}>
        <ItemMedia variant="icon">
          <PackageIcon aria-hidden />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="font-mono text-base">
            {linha.unidadeCodigo ?? "Sem unidade"}
          </ItemTitle>
          <ItemDescription>
            {quem} · {volumes(linha.volumes)}
          </ItemDescription>
          <ItemDescription className="text-sm">{meta}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <EstadoBadge estado={linha.badge} />
        </ItemActions>
      </Link>
    </Item>
  );
}
