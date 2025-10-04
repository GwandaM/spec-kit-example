import { ExpenseForm } from "@/components/expenses/expense-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewExpensePage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create Expense</h1>
          <p className="text-muted-foreground mt-2">Add a new shared expense</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/expenses">Cancel</Link>
        </Button>
      </div>

      <ExpenseForm />
    </div>
  );
}
