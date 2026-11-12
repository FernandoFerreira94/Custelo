import type { UnidadeResumo } from "@/application/estrutura/ports";
import { DesativarUnidade } from "@/components/estrutura/desativar-unidade";
import { UnidadeSheet } from "@/components/estrutura/unidade-sheet";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

const ROTULO_DO_TIPO: Record<UnidadeResumo["tipo"], string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  sala: "Sala",
  loja: "Loja",
  area_comum: "Área comum",
  outro: "Outro",
};

/** UNI-002. Sem as ações, a tabela é só leitura (auditor). */
export function ListaDeUnidades({
  unidades,
  editar,
  desativar,
}: {
  unidades: UnidadeResumo[];
  editar?: Acao;
  desativar?: Acao;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Como aparece na etiqueta</TableHead>
          {editar || desativar ? (
            <TableHead>
              <span className="sr-only">Ações</span>
            </TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {unidades.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="font-mono font-medium">{u.codigo}</TableCell>
            <TableCell>{ROTULO_DO_TIPO[u.tipo]}</TableCell>
            <TableCell>
              {u.apelidos.length > 0 ? (
                <span className="flex flex-wrap gap-1">
                  {u.apelidos.map((a) => (
                    <Badge key={a} variant="secondary">
                      {a}
                    </Badge>
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            {editar || desativar ? (
              <TableCell className="text-right">
                <span className="inline-flex gap-1">
                  {editar ? <UnidadeSheet unidade={u} salvar={editar} /> : null}
                  {desativar && u.ativo ? (
                    <DesativarUnidade
                      id={u.id}
                      codigo={u.codigo}
                      desativar={desativar}
                    />
                  ) : null}
                </span>
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
