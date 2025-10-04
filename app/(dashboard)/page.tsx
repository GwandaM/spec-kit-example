import { BalanceDashboard } from "@/components/expenses/balance-dashboard";
import { ExpenseList } from "@/components/expenses/expense-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Household balances and recent activity</p>
        </div>
        <Button asChild>
          <Link href="/expenses/new">Add Expense</Link>
        </Button>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Current Balances</h2>
        <BalanceDashboard />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Expenses</h2>
          <Button variant="outline" asChild>
            <Link href="/expenses">View All</Link>
          </Button>
        </div>
        <ExpenseList />
      </section>
    </div>
  );
}
