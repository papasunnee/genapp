import Skeleton from "@/components/ui/Skeleton";

export default function CardStatsSkeleton() {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-xl border border-slate-200 shadow-sm mb-6 xl:mb-0">
      <div className="flex-auto p-5">
        <div className="flex flex-wrap">
          <div className="relative w-full pr-4 max-w-full flex-grow flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-14" />
          </div>
          <div className="relative w-auto flex-initial">
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-3 w-32 mt-5" />
      </div>
    </div>
  );
}
