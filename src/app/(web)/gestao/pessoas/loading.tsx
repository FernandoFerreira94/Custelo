import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function CarregandoPessoas() {
  return (
    <div className="grid content-start gap-6">
      <span role="status" className="sr-only">
        Carregando as pessoas…
      </span>
      <Skeleton className="h-10 w-48 rounded-full" />
      <Skeleton className="h-10 w-full max-w-md rounded-full" />
      <SkeletonText lines={8} />
    </div>
  );
}
