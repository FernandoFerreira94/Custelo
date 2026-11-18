"use client";

import { ArrowRightLeftIcon, ShieldCheckIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { uuidv7 } from "uuidv7";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupCard,
  RadioGroupCardContent,
  RadioGroupCardDescription,
  RadioGroupCardTitle,
} from "@/components/ui/radio-group";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Falha, Resultado } from "@/lib/resultado";

export type LocalDto = {
  id: string;
  codigo: string;
  usado: number;
  capacidade: number | null;
};

export type PedidoDeMover = {
  eventoId: string;
  paraLocalId: string;
  motivoRapido?: string;
};

const MOTIVOS = ["Prateleira cheia", "Volume grande", "Reorganização"];

const hora = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(d);

/**
 * CUS-005: folha sobre o detalhe (nunca vira rota). Embaixo na portaria, à direita
 * na gestão. Em CONFLITO por versão, pede para o detalhe recarregar.
 */
export function MoverSheet({
  localAtual,
  locais,
  operador,
  lado,
  mover,
  aoMover,
}: {
  localAtual: { id: string; codigo: string } | null;
  locais: LocalDto[];
  operador: string;
  lado: "bottom" | "right";
  mover: (p: PedidoDeMover) => Promise<Resultado<unknown>>;
  /** Depois de mover (ou de um conflito): recarrega o detalhe. */
  aoMover: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [para, setPara] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [falha, setFalha] = useState<Falha | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Mesmo id em toda tentativa desta abertura: reenviar não move duas vezes.
  const [eventoId, setEventoId] = useState(() => uuidv7());

  const escolhido = locais.find((l) => l.id === para);
  const de = localAtual?.codigo;

  function abrir(v: boolean) {
    setAberto(v);
    if (v) {
      setPara("");
      setMotivo("");
      setFalha(null);
      setEventoId(uuidv7());
    }
  }

  async function enviar() {
    if (!escolhido) return;
    setEnviando(true);
    const r = await mover({
      eventoId,
      paraLocalId: escolhido.id,
      ...(motivo ? { motivoRapido: motivo } : {}),
    });
    setEnviando(false);
    if (!r.ok) {
      setFalha(r);
      if (r.codigo === "CONFLITO") aoMover();
      return;
    }
    setAberto(false);
    toast.success(r.mensagem ?? "Encomenda movida.");
    aoMover();
  }

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button variant="outline" shape="pill">
          <ArrowRightLeftIcon aria-hidden />
          Mover
        </Button>
      </SheetTrigger>
      <SheetContent side={lado}>
        <SheetHeader>
          <SheetTitle>{de ? "Mover de lugar" : "Guardar"}</SheetTitle>
          <SheetDescription>
            {de ? `Está na ${de}. ` : "Ainda sem lugar. "}O morador não recebe
            aviso de mudança interna.
          </SheetDescription>
        </SheetHeader>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void enviar();
          }}
        >
          <SheetBody className="grid content-start gap-5">
            {falha ? (
              <Alert variant="danger" role="alert">
                <AlertDescription>{falha.mensagem}</AlertDescription>
              </Alert>
            ) : null}
            {locais.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este ponto não tem prateleiras. O gestor cadastra em Estrutura,
                Áreas e pontos.
              </p>
            ) : (
              <RadioGroup
                value={para}
                onValueChange={setPara}
                aria-label="Novo local"
                className="grid grid-cols-3 gap-2"
              >
                {locais.map((l) => {
                  const aqui = l.id === localAtual?.id;
                  return (
                    <RadioGroupCard key={l.id} value={l.id} disabled={aqui}>
                      <RadioGroupCardContent>
                        <RadioGroupCardTitle className="font-mono text-lg">
                          {l.codigo}
                        </RadioGroupCardTitle>
                        <RadioGroupCardDescription className="text-sm">
                          {aqui
                            ? "Aqui agora"
                            : l.capacidade
                              ? `${l.usado}/${l.capacidade}`
                              : `${l.usado} · sem limite`}
                        </RadioGroupCardDescription>
                      </RadioGroupCardContent>
                    </RadioGroupCard>
                  );
                })}
              </RadioGroup>
            )}
            <div className="grid gap-2">
              <p className="text-sm font-medium">Por quê? (opcional)</p>
              <ToggleGroup
                type="single"
                value={motivo}
                onValueChange={setMotivo}
                aria-label="Motivo"
                className="w-full min-w-0 flex-wrap justify-start gap-2"
                spacing={2}
              >
                {MOTIVOS.map((m) => (
                  <ToggleGroupItem
                    key={m}
                    value={m}
                    className="min-h-11 rounded-full px-4"
                  >
                    {m}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheckIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
              Fica na linha do tempo: “
              {de
                ? `Movida de ${de} para ${escolhido?.codigo ?? "…"}`
                : `Guardada na ${escolhido?.codigo ?? "…"}`}{" "}
              por {operador} às {hora(new Date())}”.
            </p>
          </SheetBody>
          <SheetFooter>
            <Button
              type="submit"
              shape="pill"
              size="lg"
              className="w-full"
              disabled={!escolhido || enviando}
            >
              {enviando ? (
                <>
                  <Spinner aria-hidden />
                  Movendo…
                </>
              ) : (
                <>
                  <ArrowRightLeftIcon aria-hidden />
                  {escolhido
                    ? `${de ? "Mover" : "Guardar"} para ${escolhido.codigo}`
                    : "Escolha o novo local"}
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
