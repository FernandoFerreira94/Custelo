import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function CarregandoEncomendas() {
  return (
    <div className="grid content-start gap-6">
      <span role="status" className="sr-only">
        Carregando as encomendas…
      </span>
      <Skeleton className="h-10 w-56 rounded-full" />
      <Skeleton className="h-10 w-full max-w-2xl rounded-full" />
      <SkeletonText lines={8} />
    </div>
  );
}
