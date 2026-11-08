const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford: sem I, L, O, U
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ajuda humana da etiqueta ("PZ-7F3A"). Derivado do id, então funciona offline. Não é único. */
export function codigoCurto(id: string): string {
  let n = Number.parseInt(id.replace(/-/g, "").slice(-5), 16); // 20 bits
  let s = "";
  for (let i = 0; i < 4; i++) {
    s = ALFABETO[n % 32] + s;
    n = Math.floor(n / 32);
  }
  return s;
}

/** QR é locator opaco (invariante 8): só o id, nada que identifique pessoa ou unidade. */
export const conteudoQr = (id: string) => `pz:e:${id}`;

export function lerQr(texto: string): string | null {
  const m = /^pz:e:(.+)$/.exec(texto.trim());
  return m && UUID.test(m[1]) ? m[1].toLowerCase() : null;
}
