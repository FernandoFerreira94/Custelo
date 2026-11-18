import { Skeleton } from "@/components/ui/skeleton";

export default function CarregandoEncomenda() {
  return (
    <div className="grid content-start gap-6">
      <span role="status" className="sr-only">
        Carregando a encomenda…
      </span>
      <Skeleton className="h-10 w-40 rounded-full" />
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <Skeleton className="h-44 rounded-3xl" />
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
