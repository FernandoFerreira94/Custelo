import { LayersIcon } from "lucide-react";

import { ContextoAtivo } from "@/components/shell/contexto-ativo";
import { EmptyState } from "@/components/ui/empty";

/** SAAS — plataforma Webcodeff. Sem número falso até haver dado. */
export default function PlataformaPage() {
  return (
    <main className="grid gap-6">
      <h1 className="sr-only">Plataforma</h1>
      <ContextoAtivo />
      <EmptyState
        icon={<LayersIcon aria-hidden />}
        title="Plataforma pronta"
        description="Organizações e planos aparecem aqui na fase de administração."
        headingLevel="h2"
      />
    </main>
  );
}
