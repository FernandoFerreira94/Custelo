import type { UnidadeResumo } from "@/application/estrutura/ports";
import { DesativarUnidade } from "@/components/estrutura/desativar-unidade";
import { UnidadeSheet } from "@/components/estrutura/unidade-sheet";
import { Badge } from "@/components/ui/badge";
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

function Apelidos({ apelidos }: { apelidos: string[] }) {
  return apelidos.length > 0 ? (
    <span className="flex flex-wrap gap-1">
      {apelidos.map((a) => (
        <Badge key={a} variant="secondary">
          {a}
        </Badge>
      ))}
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

/**
 * UNI-002. Sem as ações, a tabela é só leitura (auditor). Abaixo de `md` vira
 * cartões: a tabela de 4 colunas cortava o tipo e as ações (relatório UX 12/11, P0).
 */
export function ListaDeUnidades({
  unidades,
  editar,
  desativar,
}: {
  unidades: UnidadeResumo[];
  editar?: Acao;
  desativar?: Acao;
}) {
  const acoes = (u: UnidadeResumo) => (
    <span className="inline-flex gap-1">
      {editar ? <UnidadeSheet unidade={u} salvar={editar} /> : null}
      {desativar && u.ativo ? (
        <DesativarUnidade id={u.id} codigo={u.codigo} desativar={desativar} />
      ) : null}
    </span>
  );
  return (
    <>
      <ItemGroup className="gap-2 md:hidden" aria-label="Unidades">
        {unidades.map((u) => (
          <Item key={u.id} variant="outline" className="flex-wrap">
            <ItemContent className="min-w-40">
              <ItemTitle className="font-mono">{u.codigo}</ItemTitle>
              <ItemDescription>{ROTULO_DO_TIPO[u.tipo]}</ItemDescription>
              {u.apelidos.length > 0 ? (
                <Apelidos apelidos={u.apelidos} />
              ) : null}
            </ItemContent>
            {editar || desativar ? <ItemActions>{acoes(u)}</ItemActions> : null}
          </Item>
        ))}
      </ItemGroup>
      <Table containerClassName="hidden md:block">
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
              <TableCell className="font-mono font-medium">
                {u.codigo}
              </TableCell>
              <TableCell>{ROTULO_DO_TIPO[u.tipo]}</TableCell>
              <TableCell>
                <Apelidos apelidos={u.apelidos} />
              </TableCell>
              {editar || desativar ? (
                <TableCell className="text-right">{acoes(u)}</TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
