import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/formatters";
import { getBalances } from "@/src/server/actions/expenses";
import { listMembers } from "@/src/server/actions/members";

interface BalanceDashboardProps {
  locale?: string;
  currency?: string;
}

export async function BalanceDashboard({ locale = "en-US", currency }: BalanceDashboardProps) {
  const [balances, members] = await Promise.all([getBalances(), listMembers()]);

  const memberLookup = members.reduce<Record<string, string>>((acc, member) => {
    acc[member.id] = member.name;
    return acc;
  }, {});

  if (!balances.length) {
    return (
      <Card className="border p-6 text-center text-sm text-muted-foreground">
        All settled — no outstanding balances.
      </Card>
    );
  }

  const inferredCurrency = currency ?? balances[0]?.currency ?? "USD";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {balances.map((balance) => {
        const debtor = memberLookup[balance.fromMemberId] ?? "Unknown";
        const creditor = memberLookup[balance.toMemberId] ?? "Unknown";
        const formattedAmount = formatCurrency({
          amount: balance.amount,
          currency: inferredCurrency,
          locale,
        });

        return (
          <Card
            key={`${balance.fromMemberId}-${balance.toMemberId}`}
            className="flex flex-col gap-3 border p-4"
          >
            <div className="text-sm text-muted-foreground">{debtor}</div>
            <div className="text-2xl font-semibold text-foreground">{formattedAmount}</div>
            <div className="text-sm text-muted-foreground">owes {creditor}</div>
            <div className="mt-auto flex justify-end">
              <Button variant="default" className="px-3" size="sm">
                Settle
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
