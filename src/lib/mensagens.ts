import { type CodigoFalha, type Falha, falha } from "@/lib/resultado";

/**
 * Catálogo único de mensagens ao usuário (padrão de 04/11/2026).
 * Toda mensagem diz o que aconteceu e o que fazer. Nunca "erro" sozinho.
 */
export const MSG = {
  semConexao: "Sem conexão. Verifique a internet e tente de novo.",
  instavel: "O PacoteZap está instável agora. Tente de novo em alguns minutos.",
  muitasTentativas: "Muitas tentativas. Aguarde 1 minuto e tente de novo.",
  sessaoExpirada: "Sua sessão terminou. Entre de novo para continuar.",
  semPermissao: "Seu perfil não pode fazer isso. Fale com o gestor.",
  semContexto: "Escolha o empreendimento para continuar.",
  dadosInvalidos: "Confira os campos destacados.",
  inesperado:
    "Algo deu errado. Tente de novo; se continuar, fale com o suporte.",
} as const;

type ErroComStatus = { status?: unknown; name?: unknown; code?: unknown };

function estaOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Converte qualquer falha (exceção, erro do Supabase, fetch) em texto para a pessoa. */
export function mensagemDeFalha(erro: unknown): string {
  if (estaOffline()) return MSG.semConexao;

  const e = (erro ?? {}) as ErroComStatus;
  const status = typeof e.status === "number" ? e.status : undefined;
  const nome = typeof e.name === "string" ? e.name : "";

  if (status === 429 || e.code === "over_request_rate_limit") {
    return MSG.muitasTentativas;
  }
  if (status === 401) return MSG.sessaoExpirada;
  if (status === 403) return MSG.semPermissao;
  if (
    nome === "AuthRetryableFetchError" ||
    // name em vez de instanceof: o TypeError pode vir de outro realm (fetch do runtime).
    (nome === "TypeError" &&
      /fetch|network/i.test(String((erro as Error).message)))
  ) {
    return MSG.semConexao;
  }
  if (status !== undefined && status >= 500) return MSG.instavel;
  return MSG.inesperado;
}

/** Código estável da falha, para a tela decidir o que fazer sem ler texto. */
export function codigoDeFalha(erro: unknown): CodigoFalha {
  const e = (erro ?? {}) as ErroComStatus;
  if (e.status === 401) return "SEM_SESSAO";
  if (e.status === 403) return "SEM_PERMISSAO";
  return "INDISPONIVEL";
}

/**
 * Executa uma ação de formulário e nunca deixa estourar sem mensagem.
 * Falha vira `Falha`, com código e o texto certo.
 */
export async function comMensagemDeFalha<T extends { ok: boolean }>(
  acao: () => Promise<T>,
): Promise<T | Falha> {
  try {
    return await acao();
  } catch (erro) {
    return falha(codigoDeFalha(erro), mensagemDeFalha(erro));
  }
}

const ROTULO_ESTADO: Record<string, string> = {
  RECEBIDA: "recebida",
  IDENTIFICADA: "recebida",
  NAO_IDENTIFICADA: "sem destino identificado",
  AGUARDANDO_NOTIFICACAO: "aguardando aviso",
  NOTIFICADA: "pronta para retirada",
  FALHA_NOTIFICACAO: "com falha no aviso",
  RETIRADA: "entregue",
  DEVOLVIDA: "devolvida",
  CANCELADA: "cancelada",
};

export const MSG_CUSTODIA = {
  transicaoProibida: (estado: string | null) =>
    estado
      ? `Esta encomenda está ${ROTULO_ESTADO[estado] ?? "em outro estado"}. Esta ação não vale mais para ela. Atualize a tela.`
      : "Esta encomenda ainda não foi registrada. Registre o recebimento primeiro.",
  naoEncontrada:
    "Não achamos esta encomenda neste empreendimento. Confira o código ou volte para a fila.",
  foraDeOrdem:
    "Outra pessoa mexeu nesta encomenda agora. Atualizamos a tela: confira e tente de novo.",
  idRepetido:
    "Este registro já foi usado em outra encomenda. Atualize a tela e registre de novo.",
  guardada: (local: string) => `Guardada na ${local}.`,
  movida: (de: string, para: string) =>
    `Movida de ${de} para ${para}. Está na linha do tempo.`,
  mesmoLocal: (local: string) =>
    `Ela já está na ${local}. Escolha outro lugar.`,
  localCheio: (local: string, uso: number, capacidade: number) =>
    `A ${local} passou da capacidade (${uso} de ${capacidade}). Guardamos assim mesmo; considere outra prateleira.`,
  localInativo: "Esta prateleira foi desativada. Escolha outra.",
  prateleiraComEncomenda: (n: number) =>
    `Esta prateleira tem ${n} ${n === 1 ? "encomenda" : "encomendas"}. Mova antes de remover.`,
  unidadeComEncomenda: (codigo: string, n: number) =>
    `${codigo} tem ${n} ${n === 1 ? "encomenda" : "encomendas"} na portaria. Entregue, devolva ou corrija antes de desativar.`,
} as const;

/** Correções de custódia. O restante do objeto chega na I9. */
export const MSG_CORRECAO = {
  motivoObrigatorio:
    "Escreva o motivo com pelo menos 10 caracteres. Ele fica na auditoria.",
} as const;

/** Recebimento (I5). Texto que o porteiro lê no meio do lote: curto e com o próximo passo. */
export const MSG_RECEBIMENTO = {
  salvo: (codigo: string) => `Salva para a ${codigo}.`,
  salvoSemPessoa: (nome: string, codigo: string) =>
    `${nome} fica na ${codigo}. A administração recebe a sugestão de cadastro.`,
  naoIdentificada: "Guardada como não identificada. Ninguém foi avisado.",
  leituraIndisponivel:
    "Não deu para ler a etiqueta agora. Escolha a unidade na lista.",
  leituraPausada:
    "Leitura automática pausada hoje (limite do plano). Siga escolhendo a unidade.",
  unidadeInativa: "Esta unidade não está ativa. Escolha outra.",
  fotoNaoSubiu: "A foto não subiu agora. Ela fica no aparelho e sobe sozinha.",
  fotoFormato: "Envie a foto em JPG ou WebP.",
  fotoGrande:
    "A foto ficou grande demais. Tire de novo, mais perto da etiqueta.",
  loteConcluido: (n: number) =>
    `${n} ${n === 1 ? "encomenda registrada" : "encomendas registradas"}.`,
  exMorador: (nome: string, data: string) =>
    `${nome} saiu da unidade em ${data}. Confira antes de salvar.`,
  nomeNaoBate: (codigo: string) =>
    `O nome da etiqueta não está na ${codigo}. Escolha a pessoa ou avise a unidade toda.`,
  identificada: (codigo: string) => `Destino identificado: ${codigo}.`,
} as const;
