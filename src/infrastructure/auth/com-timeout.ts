/**
 * Limita a espera por uma chamada ao Supabase Auth. Com o Supabase fora do ar,
 * o auth-js refaz a chamada com backoff por ~50 s e trava toda requisicao que
 * passa pelo middleware ou pelo guard de superficie.
 */
export const AUTH_TIMEOUT_MS = 3000;

export class AuthTimeoutError extends Error {
  constructor() {
    super(`Supabase Auth sem resposta em ${AUTH_TIMEOUT_MS} ms.`);
    this.name = "AuthTimeoutError";
  }
}

export async function comTimeoutDeAuth<T>(chamada: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new AuthTimeoutError()), AUTH_TIMEOUT_MS);
  });
  try {
    return await Promise.race([chamada, limite]);
  } finally {
    clearTimeout(timer);
  }
}
