/**
 * Lista de funcionários que já entraram neste aparelho (IP.3). Vive só no aparelho
 * (IndexedDB): o servidor nunca devolve lista de usuários. Senha sempre obrigatória.
 */

export const DIAS_SEM_USO_PARA_EXPIRAR = 30;
const UM_DIA_MS = 24 * 60 * 60 * 1000;

export type FuncionarioDoAparelho = {
  usuarioId: string;
  nome: string;
  emailMascarado: string;
  ultimoUsoEm: number; // epoch ms
};

/** Lista vigente: some quem ficou 30 dias sem entrar. Mais recente primeiro. */
export function vigentes(
  lista: readonly FuncionarioDoAparelho[],
  agora: number,
): FuncionarioDoAparelho[] {
  const limite = agora - DIAS_SEM_USO_PARA_EXPIRAR * UM_DIA_MS;
  return lista
    .filter((f) => f.ultimoUsoEm > limite)
    .sort((a, b) => b.ultimoUsoEm - a.ultimoUsoEm);
}

/** Depois de um login bem-sucedido: entra ou atualiza o uso. */
export function lembrar(
  lista: readonly FuncionarioDoAparelho[],
  funcionario: FuncionarioDoAparelho,
): FuncionarioDoAparelho[] {
  return [
    funcionario,
    ...lista.filter((f) => f.usuarioId !== funcionario.usuarioId),
  ];
}

/** "Remover deste aparelho". */
export function remover(
  lista: readonly FuncionarioDoAparelho[],
  usuarioId: string,
): FuncionarioDoAparelho[] {
  return lista.filter((f) => f.usuarioId !== usuarioId);
}
