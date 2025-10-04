import type { Expense, Member, Balance } from "@/lib/types/entities";

export interface NetBalance {
  memberId: string;
  net: number;
}

export interface Settlement {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  currency: string;
}

const CENT_FACTOR = 100;
const ROUNDING_EPSILON = 1e-6;

const normalizeToCents = (value: number): number => {
  const scaled = Math.round(value * CENT_FACTOR);
  return Math.abs(scaled) < ROUNDING_EPSILON ? 0 : scaled;
};

const toCurrencyAmount = (cents: number): number => {
  return Number((cents / CENT_FACTOR).toFixed(2));
};

export function calculateSettlements(netBalances: NetBalance[], currency: string): Settlement[] {
  if (!netBalances.length) {
    return [];
  }

  const creditors = netBalances
    .map((entry) => ({ memberId: entry.memberId, cents: normalizeToCents(entry.net) }))
    .filter((entry) => entry.cents > 0)
    .sort((a, b) => b.cents - a.cents);

  const debtors = netBalances
    .map((entry) => ({ memberId: entry.memberId, cents: normalizeToCents(entry.net) }))
    .filter((entry) => entry.cents < 0)
    .map((entry) => ({ memberId: entry.memberId, cents: Math.abs(entry.cents) }))
    .sort((a, b) => b.cents - a.cents);

  const settlements: Settlement[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.cents, debtor.cents);

    if (amount <= 0) {
      if (creditor.cents <= 0) {
        creditorIndex += 1;
      }
      if (debtor.cents <= 0) {
        debtorIndex += 1;
      }
      continue;
    }

    settlements.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      amount: toCurrencyAmount(amount),
      currency,
    });

    creditor.cents -= amount;
    debtor.cents -= amount;

    if (creditor.cents <= 0) {
      creditorIndex += 1;
    }

    if (debtor.cents <= 0) {
      debtorIndex += 1;
    }
  }

  return settlements;
}

/**
 * Calculate balances from expenses
 * Computes who owes whom by analyzing all unsettled expenses
 */
export function calculateBalances(expenses: Expense[], members: Member[]): Balance[] {
  // Only consider unsettled expenses
  const unsettledExpenses = expenses.filter((e) => !e.isSettled);

  if (unsettledExpenses.length === 0) {
    return [];
  }

  // Calculate net balance for each member
  const netBalanceMap = new Map<string, number>();

  // Initialize all active members with 0 balance
  members.forEach((member) => {
    if (member.isActive) {
      netBalanceMap.set(member.id, 0);
    }
  });

  // Process each expense
  unsettledExpenses.forEach((expense) => {
    // Payer gets credited (positive)
    const currentPayerBalance = netBalanceMap.get(expense.payerId) || 0;
    netBalanceMap.set(expense.payerId, currentPayerBalance + expense.amount);

    // Participants get debited (negative)
    expense.participants.forEach((participant) => {
      const currentBalance = netBalanceMap.get(participant.memberId) || 0;
      netBalanceMap.set(participant.memberId, currentBalance - participant.amount);
    });
  });

  // Convert to NetBalance array
  const netBalances: NetBalance[] = Array.from(netBalanceMap.entries()).map(([memberId, net]) => ({
    memberId,
    net,
  }));

  // Use first expense's currency (assumption: all expenses same currency)
  const currency = unsettledExpenses[0]?.currency || "USD";

  // Calculate settlements (debt simplification)
  const settlements = calculateSettlements(netBalances, currency);

  // Convert settlements to Balance entities
  const balances: Balance[] = settlements.map((settlement) => ({
    fromMemberId: settlement.fromMemberId,
    toMemberId: settlement.toMemberId,
    amount: settlement.amount,
    currency: settlement.currency,
  }));

  return balances;
}
