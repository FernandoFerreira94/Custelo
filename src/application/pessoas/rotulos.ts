import type { TipoDeVinculo } from "@/domain/pessoas/vinculo";

export const ROTULO_DO_VINCULO: Record<TipoDeVinculo, string> = {
  titular: "Titular",
  morador: "Morador",
  inquilino: "Inquilino",
  dependente: "Dependente",
  autorizado: "Autorizado a retirar",
};

/** Papéis que se escolhe ao cadastrar um morador ou vincular a uma unidade. */
export const PAPEIS_DE_MORADOR = [
  "titular",
  "morador",
  "inquilino",
  "dependente",
] as const satisfies readonly TipoDeVinculo[];
