import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  decidirAcesso,
  type Superficie,
} from "@/application/auth/acesso-superficie";
import { getAuthenticatedSession } from "@/infrastructure/auth/session";

/** Cookie de sessão do Supabase (`sb-<ref>-auth-token`, possivelmente em partes). */
async function haviaSessao(): Promise<boolean> {
  const todos = (await cookies()).getAll();
  return todos.some((c) => /^sb-.+-auth-token/.test(c.name));
}

/** Usar no layout de cada route group. Autorização sempre no servidor (invariante 2). */
export async function exigirSuperficie(superficie: Superficie): Promise<void> {
  const sessao = await getAuthenticatedSession();
  const decisao = decidirAcesso(sessao, superficie);
  if (decisao.ok) return;

  // Sessão que existia e expirou explica o motivo; quem nunca entrou vai para o login.
  if (!sessao && decisao.redirectTo === "/entrar" && (await haviaSessao())) {
    redirect("/sessao-expirada");
  }
  redirect(decisao.redirectTo);
}
