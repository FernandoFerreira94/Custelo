"use client";

import { CircleHelpIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Ajuda do campo: a frase longa sai de baixo do input e vira o "?" no canto
 * direito do rótulo. O Provider mora aqui para o campo funcionar em qualquer
 * tela, sem depender de um provider na raiz.
 */
export function DicaCampo({ texto }: { texto: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={texto}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <CircleHelpIcon aria-hidden className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="end" variant="light">
          {texto}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Rótulo com a dica à direita (padrão dos campos do login e do convite). */
export function RotuloComDica({
  children,
  dica,
}: {
  children: React.ReactNode;
  dica?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {children}
      {dica ? <DicaCampo texto={dica} /> : null}
    </div>
  );
}
