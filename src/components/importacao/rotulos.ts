import type { Cadastro } from "@/domain/importacao/colunas";

/** Texto da tela e nome do arquivo de modelo (`/modelos/modelo-<arquivo>.xlsx`) de cada cadastro. */
export const CADASTRO_NA_TELA: Partial<
  Record<Cadastro, { slug: string; rotulo: string; modelo: string }>
> = {
  unidades: { slug: "unidades", rotulo: "Unidades", modelo: "unidades" },
  moradores: { slug: "moradores", rotulo: "Moradores", modelo: "moradores" },
  lojistas: { slug: "lojistas", rotulo: "Lojistas", modelo: "lojistas" },
  autorizados: {
    slug: "autorizados",
    rotulo: "Autorizados",
    modelo: "autorizados",
  },
  areas_comuns: {
    slug: "areas-comuns",
    rotulo: "Áreas comuns",
    modelo: "areas-comuns",
  },
};

export function cadastroDoSlug(slug: string): Cadastro | null {
  const achado = Object.entries(CADASTRO_NA_TELA).find(
    ([, v]) => v?.slug === slug,
  );
  return (achado?.[0] as Cadastro | undefined) ?? null;
}

export const SITUACAO_NA_TELA = {
  ok: { rotulo: "Pronta", variante: "success" },
  aviso: { rotulo: "Aviso", variante: "warning" },
  erro: { rotulo: "Erro", variante: "danger" },
  duplicado: { rotulo: "Duplicada", variante: "soft" },
  ignorada: { rotulo: "Ignorada", variante: "secondary" },
} as const;
