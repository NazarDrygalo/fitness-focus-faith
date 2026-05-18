import { Skeleton } from "@/components/ui/skeleton";

export function ProgressSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
      <Skeleton className="h-9 w-44 mb-6 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-lg mb-6" />
      <Skeleton className="h-48 w-full rounded-lg mb-6" />
      <Skeleton className="h-[300px] w-full rounded-lg mb-6" />
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );
}
