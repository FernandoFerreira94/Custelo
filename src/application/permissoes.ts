export const PAPEIS = [
  "platform_super_admin",
  "org_admin",
  "empreendimento_gestor",
  "recepcionista",
  "auditor",
] as const;
export type PapelCodigo = (typeof PAPEIS)[number];

export function ehPapel(valor: string | undefined): valor is PapelCodigo {
  return (PAPEIS as readonly string[]).includes(valor ?? "");
}

const GESTAO = ["org_admin", "empreendimento_gestor"] as const;
const OPERA = ["org_admin", "empreendimento_gestor", "recepcionista"] as const;
const LE = [
  "org_admin",
  "empreendimento_gestor",
  "recepcionista",
  "auditor",
] as const;

export const PERMISSOES = {
  "cadastro.ler": LE,
  "cadastro.editar": GESTAO,
  "importacao.executar": GESTAO,
  "custodia.ler": LE,
  "custodia.registrar": OPERA,
  "custodia.mover": OPERA,
  "custodia.corrigir": GESTAO,
  "custodia.cancelar": GESTAO,
  "retirada.registrar": OPERA,
  "retirada.corrigir": GESTAO,
  "devolucao.registrar": OPERA,
  "devolucao.corrigir": GESTAO,
  "aviso.ler": LE,
  "aviso.configurar": GESTAO,
  "aviso.enviarForaDaJanela": GESTAO,
  "auditoria.ler": ["org_admin", "empreendimento_gestor", "auditor"],
  "equipe.gerir": GESTAO,
  "config.editar": GESTAO,
  "relatorio.ler": ["org_admin", "empreendimento_gestor", "auditor"],
  "relatorio.exportar": GESTAO,
  "organizacao.gerir": ["org_admin"],
  "plataforma.operar": ["platform_super_admin"],
} as const satisfies Record<string, readonly PapelCodigo[]>;

export type Permissao = keyof typeof PERMISSOES;

export function pode(papel: PapelCodigo, permissao: Permissao): boolean {
  return (PERMISSOES[permissao] as readonly PapelCodigo[]).includes(papel);
}
