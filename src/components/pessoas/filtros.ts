// Sem "use client": a página (servidor) e o componente (cliente) leem os mesmos valores.
// Se isto morasse no componente de cliente, o servidor receberia uma referência, não o array.

export type FiltroDePessoa =
  | "titulares"
  | "moradores"
  | "inquilinos"
  | "autorizados"
  | "semContato"
  | null;

export const FILTROS_DE_PESSOA = [
  "titulares",
  "moradores",
  "inquilinos",
  "autorizados",
  "semContato",
] as const;

export function urlDasPessoas(filtro: FiltroDePessoa, busca: string): string {
  const params = new URLSearchParams();
  if (filtro) params.set("filtro", filtro);
  if (busca.trim()) params.set("q", busca.trim());
  const texto = params.toString();
  return texto ? `/gestao/pessoas?${texto}` : "/gestao/pessoas";
}
