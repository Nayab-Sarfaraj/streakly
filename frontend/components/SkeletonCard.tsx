export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-white/10 mb-3" />
      <div className="h-3 w-24 rounded bg-white/10" />
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonBar() {
  return (
    <div className="h-8 rounded-lg bg-white/[0.05] animate-pulse w-full" />
  );
}
