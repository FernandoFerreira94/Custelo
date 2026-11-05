import { ScanLineIcon } from "lucide-react";

import {
  ContextoAtivo,
  estadoVazioPaginaClass,
} from "@/components/shell/contexto-ativo";
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
        description="O registro de encomendas chega na próxima fase. Esta tela já funciona no celular."
        headingLevel="h2"
        className={estadoVazioPaginaClass}
      />
    </main>
  );
}
