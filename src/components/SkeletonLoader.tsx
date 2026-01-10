export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-muted rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonCircle() {
  return (
    <div className="flex justify-center">
      <div className="h-64 w-64 rounded-full bg-muted/20 animate-pulse"></div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border p-4 animate-pulse"
        >
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="space-y-4">
      <div className="h-32 rounded-2xl bg-muted/20 animate-pulse"></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-muted/20 animate-pulse"
          ></div>
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-muted/20 animate-pulse"></div>
    </div>
  );
}
