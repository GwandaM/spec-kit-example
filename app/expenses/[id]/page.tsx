import { ExpenseForm } from "@/components/expenses/expense-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getExpense(id: string) {
  // TODO: Implement expense fetching via Server Action
  // For now, return null to simulate not found
  return null;
}

export default async function ExpenseDetailPage({ params }: { params: { id: string } }) {
  const expense = await getExpense(params.id);

  if (!expense) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Expense</h1>
          <p className="text-muted-foreground mt-2">Update expense details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/expenses">Back</Link>
        </Button>
      </div>

      <ExpenseForm expense={expense} />
    </div>
  );
}
