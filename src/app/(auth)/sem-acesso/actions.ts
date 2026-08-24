"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
