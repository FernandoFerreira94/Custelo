import { CheckCircle2Icon, PackageIcon, ShieldCheckIcon } from "lucide-react";

import { PzMarca } from "@/components/brand/marca";
import { Badge } from "@/components/ui/badge";

/** Fundo sutil do painel azul: caixas em traço fino e a rota tracejada até a porta. */
function Fundo() {
  const traco =
    "color-mix(in oklab, var(--primary-foreground) 16%, var(--primary))";
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 size-full [mask-image:linear-gradient(200deg,black,transparent_70%)]"
    >
      <defs>
        <pattern
          id="pz-caixas"
          width="56"
          height="56"
          patternUnits="userSpaceOnUse"
        >
          <g
            fill="none"
            stroke={traco}
            strokeWidth="1.2"
            strokeLinejoin="round"
          >
            <path d="M28 12 42 19v16l-14 7-14-7V19z" />
            <path d="M14 19l14 7 14-7M28 26v16" />
            <path d="M21 15.5l14 7" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pz-caixas)" />
      <path
        d="M40 760 C 180 640, 260 700, 380 560 S 560 420, 640 300"
        fill="none"
        stroke={traco}
        strokeWidth="2"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PainelMarca() {
  return (
    <aside className="relative isolate flex min-h-[calc(100dvh-3rem)] w-full flex-col justify-between gap-10 overflow-hidden rounded-[1.6rem] bg-primary p-10 text-primary-foreground">
      <Fundo />
      <PzMarca escuro />
      <div className="grid gap-8">
        <h2 className="max-w-[16ch] font-brand text-4xl leading-tight font-extrabold tracking-tight text-balance">
          A portaria registra. O morador fica sabendo.
        </h2>
        {/* Ilustração com dados de exemplo: fora da árvore de acessibilidade. */}
        <div aria-hidden className="relative h-48 max-w-md">
          <div
            className="absolute inset-x-10 top-0 h-24 rounded-2xl"
            style={{
              background:
                "color-mix(in oklab, var(--primary-foreground) 12%, var(--primary))",
            }}
          />
          <div
            className="absolute inset-x-5 top-5 h-24 rounded-2xl"
            style={{
              background:
                "color-mix(in oklab, var(--primary-foreground) 24%, var(--primary))",
            }}
          />
          <div className="absolute inset-x-0 top-10 grid gap-3 rounded-2xl bg-card p-4 text-card-foreground shadow-[var(--shadow-elevation-3)]">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-accent text-brand">
                <PackageIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono font-semibold">B-304 · C2</p>
                <p className="text-sm text-muted-foreground">
                  Mariana Souza · Mercado Livre
                </p>
              </div>
              <Badge variant="success">
                <CheckCircle2Icon aria-hidden />
                Avisada 11:43
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <span className="inline-flex items-center gap-2 text-sm opacity-90">
        <ShieldCheckIcon aria-hidden className="size-4" />
        Cada ação fica registrada com nome, data e hora.
      </span>
    </aside>
  );
}

function Rodape() {
  return <p className="text-xs text-muted-foreground">© 2026 WebCodeFF</p>;
}

/** Palco da entrada: painel da marca no desktop; só a coluna do card no celular. */
export function EntrarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:p-6">
      <div className="hidden lg:flex">
        <PainelMarca />
      </div>
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-8 lg:min-h-0 lg:px-10">
        {children}
        <div className="w-full max-w-[460px]">
          <Rodape />
        </div>
      </div>
    </div>
  );
}
