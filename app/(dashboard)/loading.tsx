import { CardSkeleton, ListSkeleton } from "@/components/shared/skeleton-loader";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      <section>
        <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4" />
        <CardSkeleton count={3} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
        </div>
        <ListSkeleton rows={10} />
      </section>
    </div>
  );
}
