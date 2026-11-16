/**
 * Contrato entre prestadora e condomínio (D20). Regras puras; o banco (migration 0013)
 * repete as mesmas travas, porque é ele quem decide de verdade.
 */

export const STATUS_CONTRATO = [
  "proposto",
  "ativo",
  "suspenso",
  "encerrado",
] as const;
export type StatusContrato = (typeof STATUS_CONTRATO)[number];

/** Contrato nunca dá papel de gestão: só quem opera ou consulta a portaria. */
export const PAPEIS_DE_CONTRATO = ["recepcionista", "auditor"] as const;
export type PapelDeContrato = (typeof PAPEIS_DE_CONTRATO)[number];

export function ehPapelDeContrato(papel: string): papel is PapelDeContrato {
  return (PAPEIS_DE_CONTRATO as readonly string[]).includes(papel);
}

/** Lista não vazia, sem repetição, só com papéis de contrato. */
export function papeisPermitidosValidos(papeis: readonly string[]): boolean {
  return (
    papeis.length > 0 &&
    new Set(papeis).size === papeis.length &&
    papeis.every(ehPapelDeContrato)
  );
}

// Encerrado não reabre: um serviço novo é um contrato novo, com aceite novo.
const TRANSICOES: Record<StatusContrato, readonly StatusContrato[]> = {
  proposto: ["ativo", "encerrado"],
  ativo: ["suspenso", "encerrado"],
  suspenso: ["ativo", "encerrado"],
  encerrado: [],
};

export function podeTransicionar(
  de: StatusContrato,
  para: StatusContrato,
): boolean {
  return TRANSICOES[de].includes(para);
}

/** Estado visível ao usuário: cor nunca sozinha, sempre rótulo e explicação. */
export const ESTADO_CONTRATO: Record<
  StatusContrato,
  { rotulo: string; explicacao: string }
> = {
  proposto: {
    rotulo: "Aguardando aceite",
    explicacao: "O condomínio ainda precisa aceitar este contrato.",
  },
  ativo: {
    rotulo: "Ativo",
    explicacao: "Os funcionários atribuídos podem trabalhar neste condomínio.",
  },
  suspenso: {
    rotulo: "Suspenso",
    explicacao: "Ninguém da prestadora entra até o contrato ser reativado.",
  },
  encerrado: {
    rotulo: "Encerrado",
    explicacao:
      "O contrato terminou. Para voltar a atender, a prestadora propõe outro.",
  },
};

/** Texto do efeito, mostrado antes de confirmar o encerramento. */
export function efeitoDoEncerramento(prestadoraNome: string): string {
  return `Os funcionários da ${prestadoraNome} saem deste condomínio agora. O histórico fica com o condomínio.`;
}
