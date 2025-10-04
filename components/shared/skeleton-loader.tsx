import type { HTMLAttributes } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps): JSX.Element {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

interface ListSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
}

export function ListSkeleton({ rows = 5, showAvatar = false }: ListSkeletonProps): JSX.Element {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index} className="flex items-center gap-4 p-4">
          {showAvatar ? <Skeleton className="h-10 w-10 rounded-full" /> : null}
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16" />
        </Card>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 3 }: CardSkeletonProps): JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="space-y-4 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}
