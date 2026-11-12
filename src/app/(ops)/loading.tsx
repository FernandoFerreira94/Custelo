import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto da fila: 5 itens, para a portaria ver que a fila já vem. */
export default function CarregandoFila() {
  return (
    <div className="grid content-start gap-3 bg-background p-4">
      <span role="status" className="sr-only">
        Carregando…
      </span>
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton
          key={i}
          className="h-16 w-full rounded-2xl"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}
