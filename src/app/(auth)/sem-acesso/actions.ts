"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";
import { codigoDeFalha, mensagemDeFalha } from "@/lib/mensagens";
import { falha, type Falha } from "@/lib/resultado";

/**
 * Sai e vai para /entrar. Se o signOut falhar (rede, Supabase), devolve a falha
 * e NÃO redireciona: a pessoa precisa saber que continua conectada.
 */
export async function signOutAction(): Promise<Falha | undefined> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) return falha(codigoDeFalha(error), mensagemDeFalha(error));
  } catch (erro) {
    return falha(codigoDeFalha(erro), mensagemDeFalha(erro));
  }
  redirect("/entrar");
}
