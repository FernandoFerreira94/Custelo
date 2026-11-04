import { PzMarca } from "@/components/brand/marca";

/** Placeholder SAAS — plataforma Webcodeff. */
export default function PlataformaPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <PzMarca texto="text-2xl" />
      <h1 className="text-lg font-semibold">Plataforma</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Superfície SaaS para administração da plataforma. Telas SAAS-* virão nas
        fases correspondentes.
      </p>
    </main>
  );
}
