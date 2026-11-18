import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";

import type { BucketDeStorage } from "./supabase-evidence-storage";

/** Bucket `etiquetas` pelo cliente da sessão: a policy do Storage confere o tenant pelo token. */
export async function bucketDeEtiquetas(): Promise<BucketDeStorage> {
  const bucket = (await createSupabaseServerClient()).storage.from("etiquetas");
  const erro = (e: unknown) => {
    if (!e) return null;
    const x = e as { statusCode?: unknown; status?: unknown; message?: string };
    return {
      statusCode: String(x.statusCode ?? x.status ?? ""),
      message: x.message ?? "erro",
    };
  };
  return {
    async upload(caminho, corpo, opcoes) {
      const { error } = await bucket.upload(caminho, corpo, opcoes);
      return { error: erro(error) };
    },
    async download(caminho) {
      const { data, error } = await bucket.download(caminho);
      return { data, error: erro(error) };
    },
    async createSignedUrl(caminho, segundos) {
      const { data, error } = await bucket.createSignedUrl(caminho, segundos);
      return { data, error };
    },
  };
}
