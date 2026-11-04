import { PackageCheckIcon } from "lucide-react";

import { ContextoAtivo } from "@/components/shell/contexto-ativo";
import { EmptyState } from "@/components/ui/empty";

/** DASH-001 — gestão WEB para gestor/admin/auditor. Sem número falso até haver dado. */
export default function GestaoPage() {
  return (
    <main className="grid gap-6">
      <h1 className="sr-only">Gestão</h1>
      <ContextoAtivo />
      <EmptyState
        icon={<PackageCheckIcon aria-hidden />}
        title="Tudo pronto para começar"
        description="O painel do dia chega quando as encomendas começarem a ser registradas."
        headingLevel="h2"
      />
    </main>
  );
}
