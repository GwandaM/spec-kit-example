import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { listGroceries } from "@/src/server/actions/groceries";
import { listMembers } from "@/src/server/actions/members";

interface GroceryListProps {
  locale?: string;
  currency?: string;
  category?: string;
}

export async function GroceryList({
  locale = "en-US",
  currency = "USD",
  category,
}: GroceryListProps) {
  const [groceries, members] = await Promise.all([
    listGroceries(),
    listMembers({ includeInactive: true }),
  ]);

  const memberLookup = members.reduce<Record<string, string>>((acc, member) => {
    acc[member.id] = member.name;
    return acc;
  }, {});

  const filtered = category ? groceries.filter((item) => item.category === category) : groceries;

  if (!filtered.length) {
    return (
      <Card className="border p-6 text-center text-sm text-muted-foreground">
        No groceries logged yet.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((item) => {
        const purchaser = memberLookup[item.addedBy] ?? "Unknown member";
        const formattedCost = formatCurrency({ amount: item.cost, currency, locale });
        const formattedDate = formatDate({ value: item.purchasedAt, locale });

        return (
          <Card
            key={item.id}
            className="flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {item.category}
                </span>
                <span aria-hidden>•</span>
                <span>{formattedDate}</span>
              </div>
              <h3 className="text-base font-semibold text-foreground">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                Added by <span className="font-medium text-foreground">{purchaser}</span>
                {item.quantity ? ` · ${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : null}
              </p>
              {item.isDuplicate ? (
                <p className="text-xs font-medium text-amber-600">
                  Potential duplicate — please review
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="text-lg font-semibold text-foreground">{formattedCost}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
