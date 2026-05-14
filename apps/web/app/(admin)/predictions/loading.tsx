import { Skeleton } from "@workspace/ui/components/skeleton";

export default function PredictionsLoading() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border bg-card p-8 md:p-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-12 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-full" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            
            <div className="mt-8 space-y-3">
              <Skeleton className="h-5 w-44 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-4/5 rounded-full" />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-10 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full max-w-[60px] rounded-full" />
            </div>

            <div className="mt-8">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
