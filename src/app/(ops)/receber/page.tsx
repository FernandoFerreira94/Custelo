import { PacoteZapMark } from "@/components/brand/pacotezap-mark";

/** Placeholder REC-001 — inicio OPS para recepcionista. */
export default function ReceberPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <PacoteZapMark showIcon={false} textClassName="text-2xl" />
      <h1 className="text-lg font-semibold">Recebimento</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Superfície operacional (OPS). Fluxo de captura será implementado na fase
        I5.
      </p>
    </main>
  );
}
