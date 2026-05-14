import { Skeleton } from "@workspace/ui/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-2xl border bg-card p-8 md:p-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-12 w-72 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-full" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border bg-card p-6 backdrop-blur-xl"
          >
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border bg-card backdrop-blur-xl">
            <div className="p-6">
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="mt-2 h-3 w-56 rounded-full" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-[280px] w-full rounded-xl" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="h-full overflow-hidden rounded-2xl border bg-card backdrop-blur-xl">
            <div className="p-6">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="mt-2 h-3 w-40 rounded-full" />
            </div>
            <div className="flex items-center justify-center p-6 pt-0">
              <Skeleton className="h-44 w-44 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border bg-card p-6 backdrop-blur-xl">
            <Skeleton className="h-5 w-32 rounded-full" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-32 rounded-full" />
                      <Skeleton className="h-2 w-20 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border bg-card p-6 backdrop-blur-xl">
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="mt-4 h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
