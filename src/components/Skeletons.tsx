export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] w-full bg-neutral-800" />
      <div className="mt-1.5 h-3.5 w-3/4 bg-neutral-800" />
      <div className="mt-1 h-2.5 w-1/2 bg-neutral-900" />
    </div>
  );
}

export function ActorCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col items-center">
      <div className="aspect-square w-full rounded-full bg-neutral-800" />
      <div className="mt-2.5 h-3 w-3/4 bg-neutral-800" />
      <div className="mt-1 h-2.5 w-1/2 bg-neutral-900" />
    </div>
  );
}

export function MovieGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ActorGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3 lg:grid-cols-6 xl:grid-cols-8">
      {Array.from({ length: count }).map((_, i) => (
        <ActorCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SectionHeaderSkeleton() {
  return (
    <div className="mb-4 flex animate-pulse items-center justify-between">
      <div className="h-5 w-40 bg-neutral-800" />
      <div className="h-3 w-16 bg-neutral-900" />
    </div>
  );
}
