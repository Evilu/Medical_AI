export function ArticleSkeleton() {
  return (
    <div className="space-y-0 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="py-4 sm:py-6 border-b border-border-subtle">
          <div className="h-5 bg-surface-secondary rounded-lg w-3/4" />
          <div className="mt-2 flex gap-3">
            <div className="h-4 bg-surface-secondary rounded w-24" />
            <div className="h-4 bg-surface-secondary rounded w-32" />
            <div className="h-4 bg-surface-secondary rounded w-16" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-surface-tertiary/50 rounded w-full" />
            <div className="h-4 bg-surface-tertiary/50 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
