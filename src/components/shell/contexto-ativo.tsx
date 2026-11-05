import { Building2Icon } from "lucide-react";

import { getAuthenticatedSession } from "@/infrastructure/auth/session";

const ROTULOS_PAPEL: Record<string, string> = {
  recepcionista: "Recepcionista",
  empreendimento_gestor: "Gestor do empreendimento",
  org_admin: "Administrador da organização",
  auditor: "Auditor",
  platform_super_admin: "Administrador da plataforma",
};

/** Papel em pt-BR; null quando o código é desconhecido (nunca inventar rótulo). */
export function rotuloPapel(codigo: string | undefined): string | null {
  return (codigo && ROTULOS_PAPEL[codigo]) || null;
}

export function ContextoAtivoView({
  empreendimento,
  papel,
}: {
  empreendimento?: string;
  papel?: string;
}) {
  const partes = [empreendimento, papel].filter(Boolean);
  if (partes.length === 0) return null;
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Building2Icon aria-hidden className="size-4 shrink-0" />
      {partes.join(" · ")}
    </p>
  );
}

/**
 * Contexto ativo no topo das páginas iniciais. As claims ainda não trazem o nome
 * do empreendimento: mostra só o papel até o nome chegar.
 */
export async function ContextoAtivo() {
  const sessao = await getAuthenticatedSession();
  return (
    <ContextoAtivoView
      papel={rotuloPapel(sessao?.claims.papel_codigo) ?? undefined}
    />
  );
}

/** Estado vazio das páginas iniciais: respiro do topo e ícone da brasa legível sobre a Névoa. */
export const estadoVazioPaginaClass =
  "py-16 md:py-24 [&_[data-slot=empty-icon]]:bg-card [&_[data-slot=empty-icon]]:ring-1 [&_[data-slot=empty-icon]]:ring-brand/40";
