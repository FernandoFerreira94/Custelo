import { sha256Hex } from "@/lib/sha256";
import type { EvidenceStorage } from "@/ports/evidence-storage";

/** Storage em memória com a mesma regra do adaptador: idempotente pelo hash, nunca sobrescreve. */
export function criarEvidenceStorageFake(opcoes: { fora?: boolean } = {}) {
  const objetos = new Map<string, { sha: string; mime: string }>();
  const storage: EvidenceStorage = {
    async gravar(caminho, bytes, mime) {
      if (opcoes.fora) return { ok: false, motivo: "indisponivel" };
      const sha256 = await sha256Hex(bytes);
      const existe = objetos.get(caminho);
      if (existe)
        return existe.sha === sha256
          ? { ok: true, caminho, sha256, jaExistia: true }
          : { ok: false, motivo: "recusado" };
      objetos.set(caminho, { sha: sha256, mime });
      return { ok: true, caminho, sha256, jaExistia: false };
    },
    async urlTemporaria(caminho, segundos) {
      return objetos.has(caminho) ? `memoria://${caminho}?s=${segundos}` : null;
    },
  };
  return { storage, objetos };
}
