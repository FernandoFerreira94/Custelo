import { PackageIcon, ScanLineIcon } from "lucide-react";
import Link from "next/link";

import {
  ContextoAtivo,
  estadoVazioPaginaClass,
} from "@/components/shell/contexto-ativo";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";

/** REC-001 — início OPS para a recepção. Sem número falso até haver dado. */
export default function ReceberPage() {
  return (
    <main className="grid gap-6 p-6">
      <h1 className="sr-only">Recebimento</h1>
      <ContextoAtivo />
      <EmptyState
        icon={<ScanLineIcon aria-hidden />}
        title="Turno pronto"
        description="Veja na fila o que está guardado na portaria agora."
        action={
          <Button asChild shape="pill" size="lg">
            <Link href="/fila">
              <PackageIcon aria-hidden />
              Abrir a fila
            </Link>
          </Button>
        }
        headingLevel="h2"
        className={estadoVazioPaginaClass}
      />
    </main>
  );
}
