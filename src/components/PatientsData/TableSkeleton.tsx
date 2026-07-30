import Skeleton from "@/components/ui/Skeleton";

export default function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center px-6 py-4 space-x-6">
          <div className="hidden md:flex h-10 w-10 rounded-full flex-shrink-0">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          {Array.from({ length: columns - 1 }).map((__, c) => (
            <Skeleton key={c} className="h-3 w-16 hidden sm:block" />
          ))}
        </div>
      ))}
    </div>
  );
}
