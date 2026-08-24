import { PacoteZapMark } from "@/components/brand/pacotezap-mark";

/** Placeholder DASH-001 — gestao WEB para gestor/admin/auditor. */
export default function GestaoPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <PacoteZapMark showIcon={false} textClassName="text-2xl" />
      <h1 className="text-lg font-semibold">Gestão</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Painel de gestão (WEB). Dashboard será implementado nas fases seguintes.
      </p>
    </main>
  );
}
