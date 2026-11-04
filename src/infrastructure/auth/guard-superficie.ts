import { redirect } from "next/navigation";

import {
  decidirAcesso,
  type Superficie,
} from "@/application/auth/acesso-superficie";
import { getAuthenticatedSession } from "@/infrastructure/auth/session";

/** Usar no layout de cada route group. Autorização sempre no servidor (invariante 2). */
export async function exigirSuperficie(superficie: Superficie): Promise<void> {
  const decisao = decidirAcesso(await getAuthenticatedSession(), superficie);
  if (!decisao.ok) redirect(decisao.redirectTo);
}
