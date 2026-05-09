export default function PredictionsLoading() {
  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950 p-8 md:p-12">
        <div className="space-y-4">
          <div className="h-4 w-28 animate-pulse rounded-full bg-zinc-800/50" />
          <div className="h-12 w-64 animate-pulse rounded-lg bg-zinc-800/50" />
          <div className="h-4 w-80 animate-pulse rounded-full bg-zinc-800/50" />
        </div>
      </div>

      {/* Model Cards Skeleton - 2x2 Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            {/* Icon and Badge */}
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 animate-pulse rounded-xl bg-zinc-800/50" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-800/50" />
            </div>

            {/* Title and Description */}
            <div className="mt-5 space-y-3">
              <div className="h-5 w-44 animate-pulse rounded-lg bg-zinc-800/50" />
              <div className="h-3 w-28 animate-pulse rounded-full bg-zinc-800/50" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full animate-pulse rounded-full bg-zinc-800/50" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-zinc-800/50" />
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 animate-pulse rounded-full bg-zinc-800/50" />
                <div className="h-3 w-10 animate-pulse rounded-full bg-zinc-800/50" />
              </div>
              <div className="h-2 w-full animate-pulse rounded-full bg-zinc-800/30" />
            </div>

            {/* CTA */}
            <div className="mt-6">
              <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-800/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
