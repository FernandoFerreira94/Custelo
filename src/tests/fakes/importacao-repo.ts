import type {
  ContextoDoBanco,
  ImportacaoRepo,
  LinhaDoLote,
  Lote,
} from "@/application/importacao/ports";

/** Repositório em memória: guarda o que os casos de uso fizeram para os testes olharem. */
export function criarImportacaoRepoFake(banco: Partial<ContextoDoBanco> = {}) {
  const estado = {
    lotes: [] as Lote[],
    linhas: [] as (LinhaDoLote & { loteId: string })[],
    gravacoes: 0,
    desfeitos: 0,
    cadastrosTocados: 0,
  };
  let seq = 0;
  const id = (p: string) => `${p}-${++seq}`;

  const repo: ImportacaoRepo = {
    async contextoDeValidacao() {
      return {
        codigosDeUnidade: banco.codigosDeUnidade ?? new Set<string>(),
        pessoasPorUnidade: banco.pessoasPorUnidade ?? new Map(),
        moradoresPorUnidade: banco.moradoresPorUnidade ?? new Map(),
      };
    },
    async criarLote(ctx, e) {
      const lote: Lote = {
        id: id("lote"),
        cadastro: e.cadastro,
        arquivoNome: e.arquivoNome,
        linhasTotal: e.linhas.length,
        status: "conferindo",
        criadoPor: ctx.usuarioId,
        confirmadoEm: null,
      };
      estado.lotes.push(lote);
      for (const l of e.linhas) {
        estado.linhas.push({
          id: id("linha"),
          loteId: lote.id,
          decisao: null,
          registroId: null,
          ...l,
        });
      }
      return { id: lote.id };
    },
    async buscarLote(_ctx, loteId) {
      return estado.lotes.find((l) => l.id === loteId) ?? null;
    },
    async lotesEmConferencia() {
      return estado.lotes
        .filter((l) => l.status === "conferindo")
        .map((l) => ({
          id: l.id,
          cadastro: l.cadastro,
          arquivoNome: l.arquivoNome,
          linhasTotal: l.linhasTotal,
          criadoEm: new Date(0),
        }));
    },
    async cancelarLote(_ctx, loteId) {
      const l = estado.lotes.find((x) => x.id === loteId);
      if (l) l.status = "cancelada";
    },
    async listarLinhas(_ctx, loteId) {
      return estado.linhas
        .filter((l) => l.loteId === loteId)
        .map(({ loteId: _l, ...linha }) => linha);
    },
    async atualizarLinha(_ctx, linhaId, e) {
      const l = estado.linhas.find((x) => x.id === linhaId);
      if (!l) return;
      if (e.dados) l.dados = e.dados;
      l.situacao = e.situacao;
      l.problemas = e.problemas;
      if (e.decisao !== undefined) l.decisao = e.decisao;
    },
    async gravarLote(_ctx, { lote, linhas, agora }) {
      estado.gravacoes += 1;
      estado.cadastrosTocados += linhas.length;
      const alvo = estado.lotes.find((l) => l.id === lote.id)!;
      alvo.status = "confirmada";
      alvo.confirmadoEm = agora;
      return {
        criados: linhas.filter((l) => l.decisao !== "atualizar").length,
        atualizados: linhas.filter((l) => l.decisao === "atualizar").length,
        ignorados: 0,
      };
    },
    async desfazerLote(_ctx, { lote, linhas }) {
      estado.desfeitos += linhas.length;
      estado.lotes.find((l) => l.id === lote.id)!.status = "desfeita";
      return { desfeitos: linhas.length };
    },
  };

  return { repo, estado };
}
