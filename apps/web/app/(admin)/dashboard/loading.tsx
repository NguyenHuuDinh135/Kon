export default function DashboardLoading() {
  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950 p-8 md:p-12">
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-800/50" />
          <div className="h-12 w-72 animate-pulse rounded-lg bg-zinc-800/50" />
          <div className="h-4 w-96 animate-pulse rounded-full bg-zinc-800/50" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-800/50" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-zinc-800/50" />
              <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-800/50" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-800/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton - Bento Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
            <div className="border-b border-zinc-800/50 p-6">
              <div className="h-5 w-40 animate-pulse rounded-full bg-zinc-800/50" />
              <div className="mt-2 h-3 w-56 animate-pulse rounded-full bg-zinc-800/50" />
            </div>
            <div className="p-6">
              <div className="h-[280px] animate-pulse rounded-xl bg-zinc-800/30" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="h-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
            <div className="p-6">
              <div className="h-5 w-32 animate-pulse rounded-full bg-zinc-800/50" />
              <div className="mt-2 h-3 w-40 animate-pulse rounded-full bg-zinc-800/50" />
            </div>
            <div className="flex items-center justify-center p-6">
              <div className="h-44 w-44 animate-pulse rounded-full bg-zinc-800/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="h-5 w-32 animate-pulse rounded-full bg-zinc-800/50" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-800/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded-full bg-zinc-800/50" />
                    <div className="h-2 w-20 animate-pulse rounded-full bg-zinc-800/50" />
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded-full bg-zinc-800/50" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="h-5 w-36 animate-pulse rounded-full bg-zinc-800/50" />
            <div className="mt-4 h-40 animate-pulse rounded-xl bg-zinc-800/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
