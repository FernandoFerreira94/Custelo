import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";

export default function Carregando() {
  return (
    <div className="grid content-start gap-6 bg-background p-6">
      <span role="status" className="sr-only">
        Carregando…
      </span>
      <Skeleton className="h-10 w-48 rounded-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard ratio="16/9" />
        <SkeletonCard ratio="16/9" delay={80} className="hidden md:grid" />
        <SkeletonCard ratio="16/9" delay={160} className="hidden md:grid" />
      </div>
      <SkeletonText lines={4} />
    </div>
  );
}
