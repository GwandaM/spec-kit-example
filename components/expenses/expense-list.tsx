import { Suspense } from "react";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { Expense } from "@/lib/types/entities";
import { listMembers } from "@/src/server/actions/members";
import { listExpenses, type ExpenseFilterOptions } from "@/src/server/actions/expenses";
import { ListSkeleton } from "@/components/shared/skeleton-loader";

interface ExpenseListProps {
  filters?: ExpenseFilterOptions;
  locale?: string;
  currency?: string;
}

const getMemberNameMap = async (): Promise<Record<string, string>> => {
  const members = await listMembers({ includeInactive: true });
  return members.reduce<Record<string, string>>((acc, member) => {
    acc[member.id] = member.name;
    return acc;
  }, {});
};

const ExpenseRow = ({
  expense,
  memberLookup,
  locale,
  currency,
}: {
  expense: Expense;
  memberLookup: Record<string, string>;
  locale: string;
  currency: string;
}) => {
  const payerName = memberLookup[expense.payerId] ?? "Unknown member";
  const participantNames = expense.participants
    .map((participant) => memberLookup[participant.memberId] ?? "Unknown member")
    .join(", ");

  const formattedAmount = formatCurrency({ amount: expense.amount, currency, locale });
  const formattedDate = formatDate({
    value: expense.datetime,
    locale,
    options: { dateStyle: "medium" },
  });

  return (
    <Card className="flex flex-col gap-3 border p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {expense.category}
          </span>
          <span aria-hidden>•</span>
          <span>{formattedDate}</span>
        </div>
        <h3 className="text-base font-semibold text-foreground">{expense.description}</h3>
        <p className="text-sm text-muted-foreground">
          Paid by <span className="font-medium text-foreground">{payerName}</span>
          {participantNames ? ` · Split with ${participantNames}` : null}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        <span className="text-lg font-semibold text-foreground">{formattedAmount}</span>
        {expense.notes ? (
          <p className="max-w-sm text-sm text-muted-foreground md:text-right">{expense.notes}</p>
        ) : null}
      </div>
    </Card>
  );
};

async function ExpenseListContent({
  filters,
  locale = "en-US",
  currency = "USD",
}: ExpenseListProps) {
  const [expenses, memberLookup] = await Promise.all([listExpenses(filters), getMemberNameMap()]);

  if (!expenses.length) {
    return (
      <Card className="border p-6 text-center text-sm text-muted-foreground">
        No expenses found for the selected filters.
      </Card>
    );
  }

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );

  return (
    <div className="space-y-3">
      {sorted.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          memberLookup={memberLookup}
          locale={locale}
          currency={currency}
        />
      ))}
    </div>
  );
}

export function ExpenseList(props: ExpenseListProps): JSX.Element {
  return (
    <Suspense fallback={<ListSkeleton rows={6} showAvatar />}>
      {/* @ts-expect-error Async Server Component */}
      <ExpenseListContent {...props} />
    </Suspense>
  );
}
