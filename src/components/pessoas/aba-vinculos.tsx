"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { Autorizado, PessoaBruta } from "@/application/pessoas/ports";
import { ROTULO_DO_VINCULO } from "@/application/pessoas/rotulos";
import { AutorizarSheet } from "@/components/pessoas/autorizar-sheet";
import { MotivoDialog } from "@/components/pessoas/motivo-dialog";
import type { UnidadeParaEscolher } from "@/components/pessoas/morador-sheet";
import { NovoVinculoSheet } from "@/components/pessoas/novo-vinculo-sheet";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/** Chave que liga o aviso do vínculo; só liga com contato autorizado, e se falhar volta ao que era. */
function ChaveDeAviso({
  vinculoId,
  ligado,
  temConsentimento,
  definir,
}: {
  vinculoId: string;
  ligado: boolean;
  temConsentimento: boolean;
  definir: Acao;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(ligado);
  const [pendente, iniciar] = useTransition();
  const desabilitada = !temConsentimento && !valor;

  function mudar(proximo: boolean) {
    const anterior = valor;
    setValor(proximo);
    iniciar(async () => {
      const r = await definir({ vinculoId, recebeAviso: proximo });
      if (!r.ok) {
        setValor(anterior);
        toast.error(r.mensagem);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={`aviso-${vinculoId}`}
        checked={valor}
        disabled={pendente || desabilitada}
        onCheckedChange={mudar}
      />
      <Label htmlFor={`aviso-${vinculoId}`} className="text-sm">
        Recebe aviso
      </Label>
      {desabilitada ? (
        <span className="text-xs text-muted-foreground">
          Registre a autorização antes
        </span>
      ) : null}
    </div>
  );
}

/** Aba "Vínculos" (PES-002): unidades, aviso, encerrar e autorizados a retirar. */
export function AbaVinculos({
  pessoa,
  autorizados,
  unidadesDisponiveis,
  unidadesDoMorador,
  podeEditar,
  acoes,
}: {
  pessoa: PessoaBruta;
  autorizados: Autorizado[];
  unidadesDisponiveis: UnidadeParaEscolher[];
  unidadesDoMorador: UnidadeParaEscolher[];
  podeEditar: boolean;
  acoes: {
    definirAviso: Acao;
    encerrar: Acao;
    revogar: Acao;
    vincular: Acao;
    autorizar: Acao;
  };
}) {
  const temConsentimento = pessoa.contatos.some(
    (c) => c.consentimentoEm !== null && c.status !== "falha",
  );

  return (
    <div className="grid gap-6">
      <section aria-labelledby="vinculos-titulo" className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="vinculos-titulo" className="font-semibold">
            Vínculos
          </h3>
          {podeEditar ? (
            <NovoVinculoSheet
              pessoaId={pessoa.id}
              unidades={unidadesDisponiveis}
              vincular={acoes.vincular}
            />
          ) : null}
        </div>
        {pessoa.vinculos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Esta pessoa não está ligada a nenhuma unidade.
          </p>
        ) : (
          <ul className="grid gap-2">
            {pessoa.vinculos.map((v) => {
              const ativo = v.status === "ativo";
              return (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3"
                >
                  <div className="grid">
                    <span>
                      <span className="font-mono">{v.unidadeCodigo}</span> ·{" "}
                      {ROTULO_DO_VINCULO[v.tipo]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {ativo
                        ? v.tipo === "autorizado" && v.vigenciaFim
                          ? `Vale até ${data.format(v.vigenciaFim)}`
                          : "Vínculo ativo"
                        : `Encerrado${v.vigenciaFim ? ` em ${data.format(v.vigenciaFim)}` : ""}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!ativo ? (
                      <Badge variant="secondary">Encerrado</Badge>
                    ) : null}
                    {ativo && v.tipo !== "autorizado" && podeEditar ? (
                      <ChaveDeAviso
                        vinculoId={v.id}
                        ligado={v.recebeAviso}
                        temConsentimento={temConsentimento}
                        definir={acoes.definirAviso}
                      />
                    ) : null}
                    {ativo && v.tipo !== "autorizado" && !podeEditar ? (
                      <Badge variant={v.recebeAviso ? "success" : "secondary"}>
                        {v.recebeAviso ? "Recebe aviso" : "Sem aviso"}
                      </Badge>
                    ) : null}
                    {ativo && podeEditar ? (
                      <MotivoDialog
                        id={v.id}
                        rotuloDoGatilho="Encerrar vínculo"
                        titulo={`Encerrar o vínculo com ${v.unidadeCodigo}?`}
                        efeito="Encerrar não apaga o histórico. A pessoa para de receber avisos desta unidade."
                        rotuloDoBotao="Encerrar vínculo"
                        executar={acoes.encerrar}
                      />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="autorizados-titulo" className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="autorizados-titulo" className="font-semibold">
            Autorizados a retirar por {pessoa.nome}
          </h3>
          {podeEditar && unidadesDoMorador.length > 0 ? (
            <AutorizarSheet
              moradorId={pessoa.id}
              moradorNome={pessoa.nome}
              unidades={unidadesDoMorador}
              autorizar={acoes.autorizar}
            />
          ) : null}
        </div>
        {autorizados.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ninguém autorizado a retirar em nome desta pessoa.
          </p>
        ) : (
          <ul className="grid gap-2">
            {autorizados.map((a) => (
              <li
                key={a.vinculoId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3"
              >
                <div className="grid">
                  <span>{a.nome}</span>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-mono">{a.unidadeCodigo}</span>
                    {a.relacao ? ` · ${a.relacao}` : ""}
                    {a.validoAte
                      ? ` · vale até ${data.format(a.validoAte)}`
                      : ""}
                  </span>
                </div>
                {podeEditar ? (
                  <MotivoDialog
                    id={a.vinculoId}
                    rotuloDoGatilho="Revogar"
                    titulo={`Revogar a autorização de ${a.nome}?`}
                    efeito="A pessoa deixa de poder retirar encomendas. O registro continua guardado."
                    rotuloDoBotao="Revogar autorização"
                    executar={acoes.revogar}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
