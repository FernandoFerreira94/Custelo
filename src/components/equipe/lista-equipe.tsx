import { ClockIcon, MailIcon } from "lucide-react";

import { mascararEmail } from "@/application/auditoria/ports";
import { ROTULO_PAPEL } from "@/application/equipe/rotulos";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MembroEquipe } from "@/infrastructure/auth/equipe-repo";

function iniciais(nome: string): string {
  const [a = "", b = ""] = nome.trim().split(/\s+/);
  return `${a[0] ?? ""}${b[0] ?? ""}`.toUpperCase() || "?";
}

function Situacao({ status }: { status: MembroEquipe["status"] }) {
  if (status === "convite_pendente") {
    return (
      <Badge variant="warning">
        <MailIcon aria-hidden />
        Convite pendente
      </Badge>
    );
  }
  if (status === "desativado") {
    return (
      <Badge variant="danger">
        <ClockIcon aria-hidden />
        Sem acesso
      </Badge>
    );
  }
  return <span className="text-muted-foreground">Ativo</span>;
}

/** USR-001. O e-mail aparece mascarado na lista (o inteiro fica para o detalhe). */
export function ListaEquipe({ membros }: { membros: MembroEquipe[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pessoa</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Situação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {membros.map((m) => (
          <TableRow key={m.usuarioId}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback>{iniciais(m.nome)}</AvatarFallback>
                </Avatar>
                <div className="grid">
                  <span className="font-medium">{m.nome}</span>
                  <span className="text-xs text-muted-foreground">
                    {mascararEmail(m.email)}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell>{ROTULO_PAPEL[m.papel]}</TableCell>
            <TableCell>
              <Situacao status={m.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
