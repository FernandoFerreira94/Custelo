import type { PapelCodigo, Permissao } from "@/application/permissoes";

/** Rótulo em linguagem de gente. Tipado por `Permissao`: permissão nova sem rótulo não compila. */
export const ROTULO_PERMISSAO: Record<Permissao, string> = {
  "cadastro.ler": "Ver unidades e pessoas",
  "cadastro.editar": "Editar unidades e pessoas",
  "importacao.executar": "Importar planilha",
  "custodia.ler": "Ver encomendas",
  "custodia.registrar": "Registrar encomenda",
  "custodia.mover": "Mover encomenda de lugar",
  "custodia.corrigir": "Corrigir registro (pede motivo)",
  "custodia.cancelar": "Cancelar registro (pede motivo)",
  "retirada.registrar": "Registrar retirada",
  "retirada.corrigir": "Corrigir retirada (pede motivo)",
  "devolucao.registrar": "Registrar devolução",
  "devolucao.corrigir": "Corrigir devolução (pede motivo)",
  "aviso.ler": "Ver avisos",
  "aviso.configurar": "Configurar como os avisos saem",
  "aviso.enviarForaDaJanela": "Enviar aviso fora do horário",
  "auditoria.ler": "Ver auditoria",
  "equipe.gerir": "Convidar e desativar pessoas",
  "config.editar": "Mudar configurações",
  "relatorio.ler": "Ver relatórios",
  "relatorio.exportar": "Exportar dados",
  "organizacao.gerir": "Gerir a organização",
  "plataforma.operar": "Operar a plataforma",
};

export const ROTULO_PAPEL: Record<PapelCodigo, string> = {
  platform_super_admin: "Plataforma",
  org_admin: "Administrador da organização",
  empreendimento_gestor: "Gestor",
  recepcionista: "Porteiro",
  auditor: "Auditor (só leitura)",
};

/** Papéis que o gestor pode convidar no próprio empreendimento. */
export const PAPEIS_CONVIDAVEIS = [
  "recepcionista",
  "auditor",
  "empreendimento_gestor",
] as const satisfies readonly PapelCodigo[];

export type PapelConvidavel = (typeof PAPEIS_CONVIDAVEIS)[number];

/** Colunas da matriz de USR-002, na ordem de leitura. */
export const PAPEIS_DA_MATRIZ = [
  "recepcionista",
  "auditor",
  "empreendimento_gestor",
  "org_admin",
] as const satisfies readonly PapelCodigo[];

export const GRUPOS_DE_PERMISSAO: readonly {
  titulo: string;
  permissoes: readonly Permissao[];
}[] = [
  {
    titulo: "Recebimento e retirada",
    permissoes: [
      "custodia.registrar",
      "custodia.mover",
      "retirada.registrar",
      "devolucao.registrar",
      "custodia.ler",
    ],
  },
  {
    titulo: "Correções",
    permissoes: [
      "custodia.corrigir",
      "custodia.cancelar",
      "retirada.corrigir",
      "devolucao.corrigir",
    ],
  },
  {
    titulo: "Avisos",
    permissoes: ["aviso.ler", "aviso.configurar", "aviso.enviarForaDaJanela"],
  },
  {
    titulo: "Gestão",
    permissoes: [
      "cadastro.ler",
      "cadastro.editar",
      "importacao.executar",
      "equipe.gerir",
      "config.editar",
      "auditoria.ler",
      "relatorio.ler",
      "relatorio.exportar",
      "organizacao.gerir",
    ],
  },
];
