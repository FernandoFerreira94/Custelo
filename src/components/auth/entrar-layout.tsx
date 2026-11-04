import { ShieldCheckIcon } from "lucide-react";

import { BotaoAjuda } from "@/components/auth/botao-ajuda";
import { CicloEstacoes } from "@/components/auth/ciclo-estacoes";
import { PzMarca } from "@/components/brand/marca";

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
        <CicloEstacoes />
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
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-4 pt-20 pb-8 lg:min-h-0 lg:px-10">
        {/* pt-20 acima reserva a faixa do botão: sem isso o card o cobre em telas baixas. */}
        <div className="absolute top-4 right-4">
          <BotaoAjuda />
        </div>
        {children}
        <div className="w-full max-w-[460px]">
          <Rodape />
        </div>
      </div>
    </div>
  );
}
