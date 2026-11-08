import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function CarregandoEstrutura() {
  return (
    <div className="grid content-start gap-6">
      <span role="status" className="sr-only">
        Carregando a estrutura…
      </span>
      <Skeleton className="h-10 w-48 rounded-full" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <SkeletonText lines={8} />
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    </div>
  );
}
