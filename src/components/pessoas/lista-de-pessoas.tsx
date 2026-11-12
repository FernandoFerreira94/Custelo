import Link from "next/link";

import type { PessoaResumo } from "@/application/pessoas/ports";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** PES-001: o nome leva ao detalhe da pessoa. */
export function ListaDePessoas({ pessoas }: { pessoas: PessoaResumo[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pessoa</TableHead>
          <TableHead>Unidades</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pessoas.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <Link
                href={`/gestao/pessoas/${p.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {p.nome}
              </Link>
            </TableCell>
            <TableCell>
              {p.unidades.length > 0 ? (
                <span className="flex flex-wrap gap-1">
                  {p.unidades.map((u) => (
                    <Badge key={u} variant="secondary" className="font-mono">
                      {u}
                    </Badge>
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">Sem vínculo ativo</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
