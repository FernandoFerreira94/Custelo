import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import {
  type CadastroMatching,
  type Sugestao,
  sugerirDestino,
} from "@/domain/recebimento/matching";
import { MSG_RECEBIMENTO } from "@/lib/mensagens";
import { falha, type Resultado, sucesso } from "@/lib/resultado";
import type { Clock } from "@/ports/clock";
import type { EvidenceStorage } from "@/ports/evidence-storage";
import type { LabelExtractor } from "@/ports/label-extractor";

import { lerComOrcamento } from "./ler-etiqueta";
import type {
  FotoGuardada,
  LeituraRepo,
  NovaLeitura,
  SugestaoDto,
} from "./ports";

export const TAMANHO_MAXIMO = 1_572_864; // 1,5 MB

/** Bytes mágicos: o Content-Type sozinho não vale. */
export function tipoDaImagem(
  b: Uint8Array,
): { mime: "image/jpeg" | "image/webp"; ext: "jpg" | "webp" } | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    return { mime: "image/jpeg", ext: "jpg" };
  const ascii = (i: number, n: number) =>
    String.fromCharCode(...b.subarray(i, i + n));
  if (b.length > 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP")
    return { mime: "image/webp", ext: "webp" };
  return null;
}

export type RespostaSugestao = {
  fotoSalva: boolean;
  foto: FotoGuardada | null;
  leituraId: string | null;
  sugestao: SugestaoDto;
  lido: { unidade: string | null; nome: string | null };
  motivo: string | null;
};

const NENHUMA: SugestaoDto = {
  confianca: "nenhuma",
  unidade: null,
  pessoa: null,
  candidatas: [],
  alertas: [],
  exMorador: null,
};

function paraDto(s: Sugestao, c: CadastroMatching): SugestaoDto {
  const unidade = (id: string | null) => {
    const u = id ? c.unidades.find((x) => x.id === id) : undefined;
    return u ? { id: u.id, codigo: u.codigo } : null;
  };
  const pessoa = s.pessoaId
    ? c.pessoas.find((p) => p.id === s.pessoaId)
    : undefined;
  const ex = s.exMorador
    ? c.pessoas.find((p) => p.id === s.exMorador!.pessoaId)
    : undefined;
  return {
    confianca: s.confianca,
    unidade: unidade(s.unidadeId),
    pessoa: pessoa ? { id: pessoa.id, nome: pessoa.nome } : null,
    candidatas: s.candidatas
      .map((x) => unidade(x.unidadeId))
      .filter((x): x is { id: string; codigo: string } => x !== null)
      .slice(0, 5),
    alertas: s.alertas,
    exMorador: ex
      ? {
          nome: ex.nome,
          encerradoEm: s.exMorador?.encerradoEm?.toISOString() ?? null,
        }
      : null,
  };
}

/**
 * Sobe a foto e, se a leitura estiver ligada, sugere o destino. Nunca bloqueia
 * o recebimento: foto que não sobe volta `fotoSalva: false` e leitura que falha
 * volta "nenhuma" com o motivo; a tela segue no manual (invariante 5).
 */
export async function sugerir(
  ctx: Contexto,
  entrada: { encomendaId: string; imagem: Uint8Array },
  deps: {
    storage: EvidenceStorage;
    repo: LeituraRepo;
    leitor: LabelExtractor | null;
    clock: Clock;
  },
): Promise<Resultado<RespostaSugestao>> {
  const negado = negarSemPermissao(ctx, "custodia.registrar");
  if (negado) return negado;
  if (entrada.imagem.length > TAMANHO_MAXIMO)
    return falha("ENTRADA_INVALIDA", MSG_RECEBIMENTO.fotoGrande);
  const tipo = tipoDaImagem(entrada.imagem);
  if (!tipo) return falha("ENTRADA_INVALIDA", MSG_RECEBIMENTO.fotoFormato);

  const caminho = `${ctx.orgId}/${ctx.empreendimentoId}/${entrada.encomendaId}.${tipo.ext}`;
  const gravada = await deps.storage.gravar(caminho, entrada.imagem, tipo.mime);
  const foto: FotoGuardada | null = gravada.ok
    ? {
        caminho: gravada.caminho,
        sha256: gravada.sha256,
        bytes: entrada.imagem.length,
        mime: tipo.mime,
      }
    : null;
  const base: RespostaSugestao = {
    fotoSalva: gravada.ok,
    foto,
    leituraId: null,
    sugestao: NENHUMA,
    lido: { unidade: null, nome: null },
    motivo: null,
  };

  if (!deps.leitor) return sucesso(base);
  const config = await deps.repo.configLeitura(ctx);
  if (!config.leituraAutomatica) return sucesso(base);
  if (config.leiturasHoje >= config.leiturasPorDia)
    return sucesso({ ...base, motivo: MSG_RECEBIMENTO.leituraPausada });

  const lida = await lerComOrcamento(
    deps.leitor,
    entrada.imagem,
    tipo.mime,
    deps.clock,
  );
  const cadastro = lida.ok ? await deps.repo.cadastroMatching(ctx) : null;
  const sugestao =
    lida.ok && cadastro
      ? sugerirDestino(
          {
            linhas: lida.leitura.linhas,
            unidadeTexto: lida.leitura.unidadeTexto,
            nomeTexto: lida.leitura.nomeTexto,
          },
          cadastro,
        )
      : null;

  const registro: NovaLeitura = lida.ok
    ? {
        provedor: lida.provedor,
        modelo: lida.modelo,
        versaoPrompt: lida.versaoPrompt ?? "-",
        latenciaMs: lida.latenciaMs,
        resultado: "ok",
        confianca: sugestao!.confianca,
        unidadeLida: lida.leitura.unidadeTexto?.slice(0, 80) ?? null,
        nomeLido: lida.leitura.nomeTexto?.slice(0, 120) ?? null,
        unidadeSugeridaId: sugestao!.unidadeId,
        pessoaSugeridaId: sugestao!.pessoaId,
        tokensEntrada: lida.uso?.tokensEntrada ?? null,
        tokensSaida: lida.uso?.tokensSaida ?? null,
        custoMicroUsd: lida.uso?.custoMicroUsd ?? null,
      }
    : {
        provedor: "-",
        modelo: "-",
        versaoPrompt: "-",
        latenciaMs: lida.latenciaMs,
        resultado: lida.motivo,
        confianca: "nenhuma",
        unidadeLida: null,
        nomeLido: null,
        unidadeSugeridaId: null,
        pessoaSugeridaId: null,
        tokensEntrada: null,
        tokensSaida: null,
        custoMicroUsd: null,
      };
  const leituraId = await deps.repo.gravarLeitura(ctx, registro);

  if (!lida.ok || !sugestao || !cadastro)
    return sucesso({
      ...base,
      leituraId,
      motivo: MSG_RECEBIMENTO.leituraIndisponivel,
    });
  return sucesso({
    ...base,
    leituraId,
    sugestao: paraDto(sugestao, cadastro),
    lido: { unidade: registro.unidadeLida, nome: registro.nomeLido },
  });
}
