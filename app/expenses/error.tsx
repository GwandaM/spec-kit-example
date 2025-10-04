"use client";

export default function ExpensesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-destructive">Error loading expenses</h2>
      <p className="text-muted-foreground mt-2">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded">
        Try again
      </button>
    </div>
  );
}
