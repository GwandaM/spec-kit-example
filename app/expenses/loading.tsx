export default function ExpensesLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
