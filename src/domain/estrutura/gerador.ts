import { falha, type Resultado, sucesso } from "@/lib/resultado";

const LIMITE = 5000;
const letras = (n: number) =>
  Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));

export function gerarUnidades(e: {
  blocos: number | string[];
  andares: number;
  porAndar: number;
  numeracao: "andar" | "seq";
}): Resultado<{
  blocos: {
    nome: string;
    andares: {
      andar: number;
      unidades: { numero: string; codigo: string }[];
    }[];
  }[];
  total: number;
}> {
  const nomes = Array.isArray(e.blocos)
    ? e.blocos
    : e.blocos === 0
      ? [""]
      : letras(e.blocos);
  if (
    e.andares < 1 ||
    e.porAndar < 1 ||
    nomes.length < 1 ||
    (nomes.length > 26 && !Array.isArray(e.blocos))
  ) {
    return falha(
      "ENTRADA_INVALIDA",
      "Informe blocos, andares e unidades por andar maiores que zero.",
    );
  }
  if (e.numeracao === "andar" && e.porAndar > 99) {
    return falha(
      "ENTRADA_INVALIDA",
      "Com numeração por andar, cabem até 99 unidades por andar. Use a sequencial.",
    );
  }
  const total = nomes.length * e.andares * e.porAndar;
  if (total > LIMITE) {
    return falha(
      "ENTRADA_INVALIDA",
      `São ${total} unidades. O limite por vez é ${LIMITE}; gere em partes.`,
    );
  }
  const blocos = nomes.map((nome) => {
    let seq = 0;
    return {
      nome,
      andares: Array.from({ length: e.andares }, (_, i) => {
        const andar = i + 1;
        return {
          andar,
          unidades: Array.from({ length: e.porAndar }, (_, j) => {
            seq += 1;
            const numero =
              e.numeracao === "andar"
                ? `${andar}${String(j + 1).padStart(2, "0")}`
                : String(seq);
            return { numero, codigo: nome ? `${nome}-${numero}` : numero };
          }),
        };
      }),
    };
  });
  return sucesso({ blocos, total });
}
