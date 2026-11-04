import { Spinner } from "@/components/ui/spinner";

export default function Carregando() {
  return (
    <main className="flex min-h-dvh items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
      <Spinner aria-hidden />
      <span role="status">Carregando…</span>
    </main>
  );
}
