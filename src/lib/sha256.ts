/** SHA-256 em hex com a Web Crypto (Node 22 e navegador), sem dependência. */
export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const copia = new Uint8Array(bytes);
  const hash = await crypto.subtle.digest("SHA-256", copia);
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
