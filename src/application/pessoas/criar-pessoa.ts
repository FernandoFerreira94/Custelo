import { registrarAuditoria } from "@/application/auditoria/registrar";
import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type { ContatoNovo, DepsDePessoas } from "@/application/pessoas/ports";
import { nomeNormalizado } from "@/application/pessoas/nome";
import { normalizarEmail, normalizarWhatsapp } from "@/domain/pessoas/contato";
import { validarCpf } from "@/domain/pessoas/cpf";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export type EntradaDePessoa = {
  nome: string;
  unidadeId: string;
  tipo: "titular" | "morador" | "inquilino" | "dependente";
  whatsapp?: string;
  email?: string;
  cpf?: string;
  /** "O morador autorizou": o consentimento só nasce daqui (ou do opt-in), nunca da planilha. */
  moradorAutorizou?: boolean;
};

/** Cadastro do formulário "Novo morador": pessoa, vínculo e contatos numa transação. */
export async function criarPessoa(
  deps: DepsDePessoas,
  ctx: Contexto,
  e: EntradaDePessoa,
): Promise<Resultado<{ pessoaId: string; vinculoId: string }>> {
  const negado = negarSemPermissao(ctx, "cadastro.editar");
  if (negado) return negado;

  const nome = e.nome.trim().replace(/\s+/g, " ");
  const campos: Record<string, string> = {};
  if (!nome) campos.nome = "Informe o nome.";

  const consentimento = e.moradorAutorizou
    ? { em: deps.agora(), origem: "gestor" as const, por: ctx.usuarioId }
    : undefined;
  const contatos: ContatoNovo[] = [];
  if (e.whatsapp?.trim()) {
    const r = normalizarWhatsapp(e.whatsapp);
    if (r.ok)
      contatos.push({ canal: "whatsapp", valor: r.data, consentimento });
    else campos.whatsapp = r.mensagem;
  }
  if (e.email?.trim()) {
    const r = normalizarEmail(e.email);
    if (r.ok) contatos.push({ canal: "email", valor: r.data, consentimento });
    else campos.email = r.mensagem;
  }
  let cpf: string | null = null;
  if (e.cpf?.trim()) {
    const r = validarCpf(e.cpf);
    if (r.ok) cpf = r.data;
    else campos.cpf = r.mensagem;
  }
  if (Object.keys(campos).length > 0) {
    return falha("ENTRADA_INVALIDA", "Confira os campos destacados.", campos);
  }

  // Nunca junta sozinho: se já existe, quem decide é a pessoa que cadastra.
  const igual = await deps.repo.pessoaAtivaNaUnidadePorNome(
    ctx,
    e.unidadeId,
    nomeNormalizado(nome),
  );
  if (igual) {
    return falha(
      "DUPLICADO",
      `${nome} já está cadastrada nesta unidade. Abra o cadastro dela em vez de criar outro.`,
    );
  }

  const criada = await deps.repo.criarPessoaCompleta(ctx, {
    nome,
    cpf,
    vinculo: { unidadeId: e.unidadeId, tipo: e.tipo, recebeAviso: true },
    contatos,
  });
  // Sem telefone, e-mail ou CPF: só o que a trilha precisa para reconstruir o fato.
  await registrarAuditoria(deps.auditoria, ctx, {
    acao: "PESSOA_CRIADA",
    alvoTipo: "pessoa",
    alvoId: criada.pessoaId,
    depois: {
      unidade_id: e.unidadeId,
      tipo: e.tipo,
      canais: contatos.map((c) => c.canal),
      com_consentimento: Boolean(consentimento),
    },
    origem: "web",
  });

  const semAutorizacao = contatos.length > 0 && !consentimento;
  const primeiroNome = nome.split(" ")[0];
  return sucesso(
    criada,
    semAutorizacao
      ? `Sem autorização registrada: ${primeiroNome} não recebe aviso por ${contatos[0]?.canal === "email" ? "e-mail" : "WhatsApp"} até autorizar.`
      : `${nome} cadastrada.`,
  );
}
