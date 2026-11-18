import Link from "next/link";

import type { LinhaEncomenda } from "@/application/custodia/consultas";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { diaEHora } from "@/lib/tempo";

import { EstadoBadge } from "./estado-badge";

const href = (id: string) => `/gestao/encomendas/${id}`;

/** Tabela no desktop, cartões no celular (a tabela não cabe em 390 px). */
export function ListaDeEncomendas({ itens }: { itens: LinhaEncomenda[] }) {
  return (
    <>
      <ItemGroup className="gap-2 md:hidden" aria-label="Encomendas">
        {itens.map((e) => (
          <Item key={e.id} variant="outline" asChild>
            <Link href={href(e.id)}>
              <ItemContent>
                <ItemTitle className="font-mono">
                  {e.unidadeCodigo ?? "Sem unidade"}
                  <span className="text-sm text-muted-foreground">
                    PZ-{e.codigoCurto}
                  </span>
                </ItemTitle>
                <ItemDescription>
                  {e.destinatario ?? "Sem destino identificado"}
                </ItemDescription>
                <ItemDescription className="text-sm">
                  {[e.local, diaEHora(e.ocorridoEm), e.recebidoPor]
                    .filter(Boolean)
                    .join(" · ")}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <EstadoBadge estado={e.badge} />
              </ItemActions>
            </Link>
          </Item>
        ))}
      </ItemGroup>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidade</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Recebida em</TableHead>
              <TableHead>Por quem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono">
                  <Link
                    href={href(e.id)}
                    className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-solid"
                  >
                    {e.unidadeCodigo ?? "Sem unidade"}
                    <span className="sr-only">
                      , encomenda PZ-{e.codigoCurto}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>{e.destinatario ?? "—"}</TableCell>
                <TableCell>
                  <EstadoBadge estado={e.badge} />
                </TableCell>
                <TableCell>{e.local ?? "—"}</TableCell>
                <TableCell className="tabular-nums">
                  {diaEHora(e.ocorridoEm)}
                </TableCell>
                <TableCell>{e.recebidoPor ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
