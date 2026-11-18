import type { CodigoFalha } from "@/lib/resultado";

/** Falha devolvida pelas rotas `/api/ops/*`, com o código para a tela decidir. */
export class FalhaDaApi extends Error {
  constructor(
    readonly codigo: CodigoFalha | "REDE",
    mensagem: string,
    readonly campos?: Record<string, string>,
  ) {
    super(mensagem);
  }
}

const SEM_REDE =
  "Sem conexão com o PacoteZap agora. Confira a internet e tente de novo.";

async function lerResposta<T>(r: Response): Promise<T> {
  const corpo = (await r.json().catch(() => null)) as {
    ok: boolean;
    data?: T;
    codigo?: CodigoFalha;
    mensagem?: string;
    campos?: Record<string, string>;
  } | null;
  if (!corpo) throw new FalhaDaApi("INDISPONIVEL", SEM_REDE);
  if (!corpo.ok)
    throw new FalhaDaApi(
      corpo.codigo ?? "INDISPONIVEL",
      corpo.mensagem ?? SEM_REDE,
      corpo.campos,
    );
  return corpo.data as T;
}

export async function buscarOps<T>(caminho: string): Promise<T> {
  let r: Response;
  try {
    r = await fetch(caminho, { cache: "no-store" });
  } catch {
    throw new FalhaDaApi("REDE", SEM_REDE);
  }
  return lerResposta<T>(r);
}

export async function enviarOps<T>(
  caminho: string,
  corpo: unknown,
): Promise<{ data: T; mensagem?: string }> {
  let r: Response;
  try {
    r = await fetch(caminho, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
  } catch {
    throw new FalhaDaApi("REDE", SEM_REDE);
  }
  const json = (await r
    .clone()
    .json()
    .catch(() => null)) as {
    mensagem?: string;
  } | null;
  return { data: await lerResposta<T>(r), mensagem: json?.mensagem };
}
