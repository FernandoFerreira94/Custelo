import {
  CameraIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  ClockIcon,
  MessageCircleIcon,
  PackageIcon,
  PenLineIcon,
  ScanLineIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

// Animação do painel azul (CSS em globals.css, prefixo pz-): o pacote anda da
// portaria até o morador. O cartão usa cor, ícone e texto iguais aos da fila.

const ETAPAS = [
  { titulo: "Chegou", Icone: CameraIcon },
  { titulo: "Conferida", Icone: ScanLineIcon },
  { titulo: "Avisada", Icone: MessageCircleIcon },
  { titulo: "Retirada", Icone: PenLineIcon },
];

const ESTADOS = [
  {
    selo: "Recebida",
    linha: "Foto da etiqueta salva",
    hora: "11:42",
    variant: "soft",
    luz: "bg-accent text-accent-foreground",
    Icone: PackageIcon,
  },
  {
    selo: "Aguardando aviso",
    linha: "Unidade e morador conferidos",
    hora: "11:42",
    variant: "warning",
    luz: "bg-warning-soft text-warning",
    Icone: ClockIcon,
  },
  {
    selo: "Pronta p/ retirada",
    linha: "Mariana avisada no WhatsApp",
    hora: "11:43",
    variant: "success",
    luz: "bg-success-soft text-success",
    Icone: CheckCircle2Icon,
  },
  {
    selo: "Retirada",
    linha: "Assinou na portaria",
    hora: "18:05",
    variant: "secondary",
    luz: "bg-secondary text-secondary-foreground",
    Icone: CheckCheckIcon,
  },
] as const;

// Fase i fica visível de i*25% a i*25%+25% do ciclo: mesma keyframe, atraso negativo.
const ATRASO = ["0s", "-7.5s", "-5s", "-2.5s"];

const TRACO = {
  background:
    "color-mix(in oklab, var(--primary-foreground) 12%, var(--primary))",
};
const BORDA = {
  borderColor:
    "color-mix(in oklab, var(--primary-foreground) 22%, var(--primary))",
};

/** Ilustração com dados de exemplo: fora da árvore de acessibilidade. */
export function CicloEstacoes() {
  return (
    <div
      aria-hidden
      className="grid w-full max-w-md gap-5"
      style={{ ["--pz-passo" as string]: "100%" }}
    >
      <div className="relative h-[92px] overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[var(--shadow-elevation-3)]">
        {ESTADOS.map((e, i) => (
          <div
            key={e.selo}
            data-fase={i}
            className="pz-fase absolute inset-0 grid content-center gap-2 px-4"
            style={{ animationDelay: ATRASO[i] }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-lg font-semibold whitespace-nowrap">
                B-304 · C2
              </p>
              <Badge variant={e.variant}>
                <e.Icone />
                {e.selo}
              </Badge>
            </div>
            <p className="flex justify-between gap-3 text-sm text-muted-foreground">
              <span className="truncate">{e.linha}</span>
              <span className="font-mono">{e.hora}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="relative h-12">
        <div className="pz-viagem absolute top-0 left-0 flex h-12 w-1/4 items-center justify-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-card text-brand shadow-[var(--shadow-elevation-3)]">
            <PackageIcon className="size-6" />
          </span>
        </div>
      </div>
      <div
        className="relative mx-[12.5%] -mt-2 h-0.5 rounded-full"
        style={TRACO}
      >
        <span className="pz-trilha absolute inset-0 rounded-full bg-primary-foreground" />
      </div>
      <div className="grid grid-cols-4">
        {ETAPAS.map((etapa, i) => (
          <div
            key={etapa.titulo}
            className="grid justify-items-center gap-2 text-center"
          >
            <span
              className="relative grid size-11 place-items-center rounded-full border"
              style={BORDA}
            >
              <etapa.Icone className="size-5" />
              <span
                data-fase={i}
                className={`pz-luz absolute inset-0 grid place-items-center rounded-full ${ESTADOS[i].luz}`}
                style={{ animationDelay: ATRASO[i] }}
              >
                <etapa.Icone className="size-5" />
              </span>
            </span>
            <span className="text-sm font-semibold">{etapa.titulo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
