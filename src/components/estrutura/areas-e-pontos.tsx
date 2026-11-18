import { AlertTriangleIcon, CheckCircle2Icon, MapPinIcon } from "lucide-react";

import type { LocalGuarda } from "@/application/custodia/ports";
import type { AreaComum, Ponto } from "@/application/estrutura/ports";
import {
  AreaComumSheet,
  type PessoaParaEscolher,
} from "@/components/estrutura/area-comum-sheet";
import { PontoAtivo } from "@/components/estrutura/ponto-ativo";
import { PontoSheet } from "@/components/estrutura/ponto-sheet";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsageMeter } from "@/components/ui/usage-meter";
import type { Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

/** Selo da área comum: avisa quando há responsável E o aviso está ligado. */
export function seloDaArea(
  a: Pick<AreaComum, "avisarResponsavel" | "responsavelNome">,
) {
  const avisa = a.avisarResponsavel && Boolean(a.responsavelNome);
  return avisa ? (
    <Badge variant="success">
      <CheckCircle2Icon aria-hidden />
      Avisa
    </Badge>
  ) : (
    <Badge variant="warning">
      <AlertTriangleIcon aria-hidden />
      Sem aviso
    </Badge>
  );
}

/** UNI-003 e UNI-004 lado a lado. Sem as ações, só leitura. */
export function AreasEPontos({
  areas,
  pontos,
  pessoas,
  salvarArea,
  salvarPonto,
  alternarPonto,
  prateleiras = {},
  salvarPrateleiras,
}: {
  areas: AreaComum[];
  pontos: Ponto[];
  pessoas: PessoaParaEscolher[];
  salvarArea?: { criar: Acao; editar: Acao };
  salvarPonto?: { criar: Acao; editar: Acao };
  alternarPonto?: Acao;
  /** Prateleiras ativas de cada ponto, com a ocupação (chave = id do ponto). */
  prateleiras?: Record<string, LocalGuarda[]>;
  salvarPrateleiras?: Acao;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Áreas comuns</CardTitle>
          <CardDescription>Destino que não é apartamento.</CardDescription>
          {salvarArea ? (
            <CardAction>
              <AreaComumSheet pessoas={pessoas} salvar={salvarArea.criar} />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          {areas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma área comum cadastrada. Encomenda para a administração, a
              academia ou a zeladoria precisa de uma área aqui.
            </p>
          ) : (
            <ul className="grid gap-2">
              {areas.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                >
                  <div className="grid">
                    <span className="font-medium">{a.codigo}</span>
                    <span className="text-sm text-muted-foreground">
                      {a.responsavelNome
                        ? `Responsável: ${a.responsavelNome}`
                        : "Sem responsável"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {seloDaArea(a)}
                    {salvarArea ? (
                      <AreaComumSheet
                        area={a}
                        pessoas={pessoas}
                        salvar={salvarArea.editar}
                      />
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Pontos de recebimento</CardTitle>
          <CardDescription>Onde a encomenda fica guardada.</CardDescription>
          {salvarPonto ? (
            <CardAction>
              <PontoSheet
                salvar={salvarPonto.criar}
                salvarPrateleiras={salvarPrateleiras}
              />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          {pontos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum ponto de recebimento. Cadastre a portaria onde as
              encomendas chegam.
            </p>
          ) : (
            <ul className="grid gap-2">
              {pontos.map((p) => (
                <li key={p.id} className="grid gap-3 rounded-2xl border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="grid">
                      <span className="flex items-center gap-2 font-medium">
                        <MapPinIcon aria-hidden className="size-4 text-brand" />
                        {p.nome}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {p.funcionamento || "Horário não informado"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.ativo ? null : (
                        <Badge variant="secondary">Desativado</Badge>
                      )}
                      {salvarPonto ? (
                        <PontoSheet
                          ponto={p}
                          salvar={salvarPonto.editar}
                          prateleiras={prateleiras[p.id]}
                          salvarPrateleiras={salvarPrateleiras}
                        />
                      ) : null}
                      {alternarPonto ? (
                        <PontoAtivo ponto={p} alternar={alternarPonto} />
                      ) : null}
                    </div>
                  </div>
                  {prateleiras[p.id]?.length ? (
                    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {prateleiras[p.id]!.map((l) => (
                        <UsageMeter
                          key={l.id}
                          label={`Prateleira ${l.codigo}`}
                          value={l.usado}
                          max={l.capacidade}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sem prateleiras cadastradas.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
