export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-36" />
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-2 w-20" />
      </div>
      <Skeleton className="h-4 w-16 shrink-0" />
    </div>
  );
}