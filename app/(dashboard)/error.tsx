"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 border border-destructive/40 bg-destructive/5 p-6 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">Please try again or refresh the page.</p>
        {error?.message ? (
          <p className="text-xs text-muted-foreground/80">Details: {error.message}</p>
        ) : null}
      </div>
      <Button variant="secondary" onClick={reset}>
        Try again
      </Button>
    </Card>
  );
}
