import { describe, expect, it } from "vitest";

import {
  type BucketDeStorage,
  criarEvidenceStorage,
} from "@/infrastructure/storage/supabase-evidence-storage";
import { criarEvidenceStorageFake } from "@/tests/fakes/evidence-storage";

/** Bucket simulado como o Supabase responde: 409 quando o objeto já existe. */
function bucketSimulado(falha?: { statusCode: string; message: string }) {
  const objetos = new Map<string, Uint8Array>();
  const bucket: BucketDeStorage = {
    async upload(caminho, corpo) {
      if (falha) return { error: falha };
      if (objetos.has(caminho))
        return {
          error: { statusCode: "409", message: "The resource already exists" },
        };
      objetos.set(caminho, corpo);
      return { error: null };
    },
    async download(caminho) {
      const o = objetos.get(caminho);
      return o
        ? { data: new Blob([new Uint8Array(o)]), error: null }
        : { data: null, error: { message: "not found" } };
    },
    async createSignedUrl(caminho, segundos) {
      return objetos.has(caminho)
        ? {
            data: { signedUrl: `https://x/${caminho}?t=${segundos}` },
            error: null,
          }
        : { data: null, error: { message: "not found" } };
    },
  };
  return { bucket, objetos };
}

const foto = (n: number) => new Uint8Array([n, 1, 2, 3]);
const CAMINHO = "org/emp/enc.webp";

describe.each([
  [
    "adaptador do Supabase",
    () => criarEvidenceStorage(bucketSimulado().bucket),
  ],
  ["fake", () => criarEvidenceStorageFake().storage],
])("EvidenceStorage (%s)", (_nome, criar) => {
  it("gravar duas vezes a mesma foto é idempotente (jaExistia)", async () => {
    const s = criar();
    const a = await s.gravar(CAMINHO, foto(1), "image/webp");
    const b = await s.gravar(CAMINHO, foto(1), "image/webp");
    expect(a).toMatchObject({ ok: true, jaExistia: false });
    expect(b).toMatchObject({ ok: true, jaExistia: true });
    expect(a.ok && b.ok && a.sha256 === b.sha256).toBe(true);
    expect(a.ok && a.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("outra foto no mesmo caminho é recusada (nunca sobrescreve)", async () => {
    const s = criar();
    await s.gravar(CAMINHO, foto(1), "image/webp");
    expect(await s.gravar(CAMINHO, foto(2), "image/webp")).toEqual({
      ok: false,
      motivo: "recusado",
    });
  });

  it("URL temporária só para o que existe", async () => {
    const s = criar();
    expect(await s.urlTemporaria(CAMINHO, 60)).toBeNull();
    await s.gravar(CAMINHO, foto(1), "image/webp");
    expect(await s.urlTemporaria(CAMINHO, 60)).toContain(CAMINHO);
  });
});

describe("adaptador do Supabase, falhas", () => {
  it("policy recusa (403) vira recusado; o resto vira indisponível", async () => {
    const negado = criarEvidenceStorage(
      bucketSimulado({
        statusCode: "403",
        message: "new row violates row-level security policy",
      }).bucket,
    );
    expect(await negado.gravar(CAMINHO, foto(1), "image/webp")).toEqual({
      ok: false,
      motivo: "recusado",
    });
    const fora = criarEvidenceStorage(
      bucketSimulado({ statusCode: "500", message: "internal" }).bucket,
    );
    expect(await fora.gravar(CAMINHO, foto(1), "image/webp")).toEqual({
      ok: false,
      motivo: "indisponivel",
    });
  });
});
