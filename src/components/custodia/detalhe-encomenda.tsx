import {
  ArrowRightLeftIcon,
  BanIcon,
  CameraIcon,
  CircleHelpIcon,
  MapPinIcon,
  MessageCircleIcon,
  PackageCheckIcon,
  PencilIcon,
  PrinterIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Badge as Situacao } from "@/domain/custodia/situacao";
import type { Estado, TipoEvento } from "@/domain/custodia/estados";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import {
  Timeline,
  TimelineDescription,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline";
import { diaEHora, haQuanto } from "@/lib/tempo";

import { EstadoBadge } from "./estado-badge";

/** O detalhe como as duas superfícies recebem (datas em ISO: vale para JSON e RSC). */
export type DetalheDto = {
  id: string;
  codigoCurto: string;
  estado: Estado;
  badge: Situacao;
  ocorridoEm: string;
  volumes: number;
  transportadora: string | null;
  unidade: { id: string; codigo: string } | null;
  destinatario: string | null;
  local: { id: string; codigo: string } | null;
  ponto: { id: string; nome: string } | null;
  outrasAtivas: { id: string; codigoCurto: string; badge: Situacao }[];
};

export type ItemLinhaDto = {
  id: string;
  tipo: TipoEvento;
  titulo: string;
  descricao: string;
  ocorridoEm: string;
  corrigido: boolean;
};

const ICONE: Partial<Record<TipoEvento, ReactNode>> = {
  RECEBIMENTO_REGISTRADO: <CameraIcon aria-hidden />,
  MARCADA_NAO_IDENTIFICADA: <CircleHelpIcon aria-hidden />,
  IDENTIFICACAO_CONFIRMADA: <MapPinIcon aria-hidden />,
  LOCALIZACAO_ALTERADA: <ArrowRightLeftIcon aria-hidden />,
  ETIQUETA_IMPRESSA: <PrinterIcon aria-hidden />,
  NOTIFICACAO_ENVIADA: <MessageCircleIcon aria-hidden />,
  ASSOCIACAO_CORRIGIDA: <PencilIcon aria-hidden />,
  REGISTRO_CANCELADO: <BanIcon aria-hidden />,
  RETIRADA_REGISTRADA: <PackageCheckIcon aria-hidden />,
};

const FIM: Partial<Record<Estado, string>> = {
  RETIRADA: "Entregue",
  DEVOLVIDA: "Devolvida",
  CANCELADA: "Cancelada",
};

const volumes = (n: number) => `${n} ${n === 1 ? "volume" : "volumes"}`;
const hora = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));

/**
 * CUS-002 + CUS-003, igual nas duas superfícies: card, linha do tempo e as outras
 * encomendas da unidade. `acoes` vem de quem pode agir (Mover); terminal é só leitura.
 */
export function DetalheEncomenda({
  d,
  linha,
  acoes,
  hrefDe,
  agora,
}: {
  d: DetalheDto;
  linha: ItemLinhaDto[];
  acoes?: ReactNode;
  /** Link de outra encomenda na superfície atual. */
  hrefDe: (id: string) => string;
  agora: Date;
}) {
  const fim = FIM[d.estado];
  const meta = [
    d.transportadora,
    volumes(d.volumes),
    haQuanto(new Date(d.ocorridoEm), agora),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
      <div className="grid gap-4">
        <Card className="gap-3 rounded-3xl py-4">
          <CardHeader className="px-4">
            <div className="flex flex-wrap items-center gap-2">
              <EstadoBadge estado={d.badge} />
              {d.local ? (
                <Badge variant="outline">
                  <MapPinIcon aria-hidden />
                  {d.local.codigo}
                </Badge>
              ) : null}
              <span className="font-mono text-sm text-muted-foreground">
                PZ-{d.codigoCurto}
              </span>
            </div>
            <CardTitle className="text-lg">
              {d.destinatario ?? "Sem destino identificado"}
            </CardTitle>
            <CardDescription>{meta}</CardDescription>
          </CardHeader>
          {fim ? (
            <CardContent className="px-4">
              <Alert variant="default">
                <AlertDescription>
                  {fim} em{" "}
                  {diaEHora(new Date(linha[0]?.ocorridoEm ?? d.ocorridoEm))}.
                  Encomenda {fim.toLowerCase()} não volta para a fila.
                </AlertDescription>
              </Alert>
            </CardContent>
          ) : acoes ? (
            <CardContent className="grid grid-cols-2 gap-2 px-4">
              {acoes}
            </CardContent>
          ) : null}
        </Card>

        {d.outrasAtivas.length > 0 ? (
          <section aria-labelledby="t-outras" className="grid gap-2">
            <h2 id="t-outras" className="text-sm font-semibold">
              Outras desta unidade
            </h2>
            <ItemGroup className="gap-2">
              {d.outrasAtivas.map((o) => (
                <Item key={o.id} variant="outline" size="sm" asChild>
                  <Link href={hrefDe(o.id)}>
                    <ItemContent>
                      <ItemTitle className="font-mono">
                        PZ-{o.codigoCurto}
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <EstadoBadge estado={o.badge} />
                    </ItemActions>
                  </Link>
                </Item>
              ))}
            </ItemGroup>
          </section>
        ) : null}
      </div>

      <section aria-labelledby="t-linha" className="grid gap-3">
        <h2 id="t-linha" className="text-sm font-semibold">
          Linha do tempo
        </h2>
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <Timeline>
              {linha.map((item, i) => (
                <TimelineItem
                  key={item.id}
                  status={i === 0 ? "current" : "done"}
                  icon={ICONE[item.tipo]}
                >
                  <TimelineTitle className="flex flex-wrap items-center gap-2">
                    {item.titulo}
                    {item.corrigido ? (
                      <Badge variant="warning">
                        <PencilIcon aria-hidden />
                        Corrigido
                      </Badge>
                    ) : null}
                  </TimelineTitle>
                  <TimelineDescription>{item.descricao}</TimelineDescription>
                  <TimelineTime dateTime={item.ocorridoEm}>
                    {hora(item.ocorridoEm)}
                  </TimelineTime>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheckIcon aria-hidden className="size-4" />
          Cada passo fica guardado. Correção cria um passo novo.
        </p>
      </section>
    </div>
  );
}
