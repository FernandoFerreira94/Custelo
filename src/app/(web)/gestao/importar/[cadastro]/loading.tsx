import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function CarregandoImportacao() {
  return (
    <div className="grid content-start gap-6">
      <span role="status" className="sr-only">
        Carregando a importação…
      </span>
      <Skeleton className="h-10 w-64 rounded-full" />
      <SkeletonText lines={6} />
    </div>
  );
}
