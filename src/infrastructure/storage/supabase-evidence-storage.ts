import { sha256Hex } from "@/lib/sha256";
import type { EvidenceStorage } from "@/ports/evidence-storage";

/** O pedaço do cliente do Supabase Storage que o adaptador usa (injetável nos testes). */
export type BucketDeStorage = {
  upload(
    caminho: string,
    corpo: Uint8Array,
    opcoes: { contentType: string; upsert: false },
  ): Promise<{ error: { statusCode?: string; message: string } | null }>;
  download(
    caminho: string,
  ): Promise<{ data: Blob | null; error: { message: string } | null }>;
  createSignedUrl(
    caminho: string,
    segundos: number,
  ): Promise<{ data: { signedUrl: string } | null; error: unknown }>;
};

const jaExiste = (e: { statusCode?: string; message: string }) =>
  e.statusCode === "409" || /already exists|duplicate/i.test(e.message);

/**
 * Evidência no bucket privado `etiquetas` com o cliente da SESSÃO (policy de
 * Storage pelo token, sem service_role). Nunca usa upsert: reenviar a mesma
 * foto é idempotente pelo hash; outra foto no mesmo caminho é recusada.
 */
export function criarEvidenceStorage(bucket: BucketDeStorage): EvidenceStorage {
  return {
    async gravar(caminho, bytes, mime) {
      const sha256 = await sha256Hex(bytes);
      const { error } = await bucket.upload(caminho, bytes, {
        contentType: mime,
        upsert: false,
      });
      if (!error) return { ok: true, caminho, sha256, jaExistia: false };
      if (!jaExiste(error)) {
        return {
          ok: false,
          motivo: error.statusCode === "403" ? "recusado" : "indisponivel",
        };
      }
      const existente = await bucket.download(caminho);
      if (!existente.data) return { ok: false, motivo: "indisponivel" };
      const shaExistente = await sha256Hex(
        new Uint8Array(await existente.data.arrayBuffer()),
      );
      return shaExistente === sha256
        ? { ok: true, caminho, sha256, jaExistia: true }
        : { ok: false, motivo: "recusado" };
    },

    async urlTemporaria(caminho, segundos) {
      const { data, error } = await bucket.createSignedUrl(caminho, segundos);
      return error || !data ? null : data.signedUrl;
    },
  };
}
