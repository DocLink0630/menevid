import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function Stagger({ index, className, ...props }: React.ComponentProps<"div"> & { index: number }) {
  return (
    <div
      className={cn("animate-fade-in-up", className)}
      style={{ animationDelay: `${index * 60}ms` }}
      {...props}
    />
  );
}

export function PageHeaderSkeleton() {
  return (
    <Stagger index={0} className="space-y-2">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-72 max-w-full" />
    </Stagger>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Stagger key={i} index={i + 1}>
          <div className="rounded-xl border bg-card p-4 shadow-sm ring-1 ring-foreground/5">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <Skeleton className="h-9 w-16" />
          </div>
        </Stagger>
      ))}
    </div>
  );
}

export function SummaryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Stagger key={i} index={i + 1}>
          <div className="rounded-xl border border-l-4 border-l-primary/30 bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <Skeleton className="h-10 w-14" />
          </div>
        </Stagger>
      ))}
    </div>
  );
}

export function ToolbarSkeleton() {
  return (
    <Stagger index={1} className="flex flex-wrap items-center gap-3">
      <Skeleton className="h-9 w-full max-w-sm" />
      <Skeleton className="h-9 w-[180px]" />
      <Skeleton className="h-9 w-[180px]" />
    </Stagger>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Stagger index={2} className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-foreground/5">
      <div className="flex gap-4 border-b bg-muted/40 px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton
                key={j}
                className="h-4 flex-1"
                style={{ animationDelay: `${(i + j) * 40}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </Stagger>
  );
}

export function CardBlockSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Stagger index={2}>
      <div className="rounded-xl border bg-card p-6 shadow-sm ring-1 ring-foreground/5">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </Stagger>
  );
}

export function ReminderListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Stagger key={i} index={i + 2}>
          <div className="flex gap-3 rounded-lg border p-4">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full max-w-md" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </Stagger>
      ))}
    </div>
  );
}

export function TabsSkeleton() {
  return (
    <Stagger index={1} className="flex gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-28 rounded-lg" />
      ))}
    </Stagger>
  );
}

export function LoadingSpinner({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative size-10">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <div className="absolute inset-1.5 animate-ping rounded-full bg-primary/20" />
      </div>
      <p className="animate-pulse text-sm font-medium">{label}</p>
    </div>
  );
}
