import { PacoteZapMark } from "@/components/brand/pacotezap-mark";

/**
 * Placeholder AUTH-005 — selecionar contexto.
 * Sera substituida pela lista org/empreendimento na fase I2.
 */
export default function ContextoPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <PacoteZapMark showIcon={false} textClassName="text-2xl" />
      <h1 className="text-lg font-semibold">Login realizado</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Selecao de contexto (org/empreendimento) sera implementada em AUTH-005.
      </p>
    </main>
  );
}
