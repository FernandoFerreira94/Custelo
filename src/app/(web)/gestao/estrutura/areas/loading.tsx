import { Skeleton } from "@/components/ui/skeleton";

export default function CarregandoAreas() {
  return (
    <div className="grid content-start gap-6">
      <span role="status" className="sr-only">
        Carregando áreas e pontos…
      </span>
      <Skeleton className="h-10 w-72 rounded-full" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );
}
