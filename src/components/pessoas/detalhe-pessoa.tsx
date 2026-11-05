"use client";

import type { Autorizado, PessoaBruta } from "@/application/pessoas/ports";
import { AbaDados } from "@/components/pessoas/aba-dados";
import { AbaVinculos } from "@/components/pessoas/aba-vinculos";
import type { UnidadeParaEscolher } from "@/components/pessoas/morador-sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

export type AcoesDaPessoa = {
  detalhe: (entrada: unknown) => Promise<Resultado<{ cpf: string | null }>>;
  consentir: Acao;
  salvarContato: Acao;
  definirAviso: Acao;
  encerrar: Acao;
  revogar: Acao;
  vincular: Acao;
  autorizar: Acao;
};

/** PES-003: dados, vínculos e (a partir da I4) encomendas da pessoa. */
export function DetalhePessoa({
  pessoa,
  autorizados,
  unidadesDisponiveis,
  podeEditar,
  acoes,
}: {
  pessoa: PessoaBruta;
  autorizados: Autorizado[];
  unidadesDisponiveis: UnidadeParaEscolher[];
  podeEditar: boolean;
  acoes: AcoesDaPessoa;
}) {
  const unidadesDoMorador = pessoa.vinculos
    .filter((v) => v.status === "ativo" && v.tipo !== "autorizado")
    .map((v) => ({ id: v.unidadeId, codigo: v.unidadeCodigo }));

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>{pessoa.nome}</CardTitle>
        <CardDescription>
          Dados, vínculos com unidades e quem retira em nome dela.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dados">
          <TabsList>
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="vinculos">Vínculos</TabsTrigger>
            <TabsTrigger value="encomendas">Encomendas</TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="pt-4">
            <AbaDados
              pessoa={pessoa}
              podeEditar={podeEditar}
              detalhe={acoes.detalhe}
              consentir={acoes.consentir}
              salvarContato={acoes.salvarContato}
            />
          </TabsContent>
          <TabsContent value="vinculos" className="pt-4">
            <AbaVinculos
              pessoa={pessoa}
              autorizados={autorizados}
              unidadesDisponiveis={unidadesDisponiveis}
              unidadesDoMorador={unidadesDoMorador}
              podeEditar={podeEditar}
              acoes={acoes}
            />
          </TabsContent>
          <TabsContent value="encomendas" className="pt-4">
            {/* Honesto: o registro de encomendas só chega na I4. */}
            <p className="text-sm text-muted-foreground">
              As encomendas desta pessoa aparecem aqui quando o recebimento
              entrar no ar. Hoje ainda não há registro para mostrar.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
