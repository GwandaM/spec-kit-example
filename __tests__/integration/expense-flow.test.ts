import { initializeStorage } from "@/lib/storage/init";
import { localStorageAdapter } from "@/lib/storage/local-storage.adapter";
import { STORAGE_KEYS } from "@/lib/storage/adapter";
import type { Member } from "@/lib/types/entities";
import {
  createExpense,
  listExpenses,
  settleExpense,
  updateExpense,
  getBalances,
} from "@/src/server/actions/expenses";

const aliceId = "00000000-0000-0000-0000-000000000001";
const bobId = "00000000-0000-0000-0000-000000000002";
const carlaId = "00000000-0000-0000-0000-000000000003";

const baseMembers: Member[] = [
  {
    id: aliceId,
    name: "Alice",
    color: "#f87171",
    shareRatio: 1 / 3,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    isActive: true,
  },
  {
    id: bobId,
    name: "Bob",
    color: "#60a5fa",
    shareRatio: 1 / 3,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    isActive: true,
  },
  {
    id: carlaId,
    name: "Carla",
    color: "#34d399",
    shareRatio: 1 / 3,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    isActive: true,
  },
];

describe("Expense flow integration", () => {
  beforeEach(async () => {
    globalThis.__LOCAL_STORAGE_RESET__?.();
    await initializeStorage({
      adapter: localStorageAdapter,
      clock: () => new Date("2024-01-01T00:00:00.000Z"),
    });
    await localStorageAdapter.set(STORAGE_KEYS.MEMBERS, baseMembers);
  });

  it("creates, updates, and settles an expense while maintaining balances", async () => {
    const created = await createExpense({
      description: "Monthly utilities",
      amount: 90,
      currency: "USD",
      category: "Bills",
      payerId: aliceId,
      splitMode: "equal",
      participants: [
        { memberId: aliceId, amount: 30, percentage: null },
        { memberId: bobId, amount: 30, percentage: null },
        { memberId: carlaId, amount: 30, percentage: null },
      ],
      notes: "Includes water + electricity",
      datetime: new Date("2024-02-01T12:00:00.000Z"),
      createdBy: aliceId,
    });

    if (!created.success) {
      throw new Error(created.error ?? "expense creation failed");
    }
    expect(created.success).toBe(true);

    expect(created.balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fromMemberId: bobId, toMemberId: aliceId, amount: 30 }),
        expect.objectContaining({ fromMemberId: carlaId, toMemberId: aliceId, amount: 30 }),
      ])
    );

    const updated = await updateExpense(created.expense.id, {
      amount: 75,
      participants: [
        { memberId: aliceId, amount: 25, percentage: null },
        { memberId: bobId, amount: 25, percentage: null },
        { memberId: carlaId, amount: 25, percentage: null },
      ],
      notes: "Adjusted after landlord credit",
    });

    if (!updated.success) {
      throw new Error(updated.error ?? "expense update failed");
    }
    expect(updated.success).toBe(true);
    expect(updated.expense.amount).toBe(75);
    expect(updated.expense.notes).toBe("Adjusted after landlord credit");

    const settled = await settleExpense({ expenseId: created.expense.id, settledBy: aliceId });
    if (!settled.success) {
      throw new Error(settled.error ?? "expense settlement failed");
    }
    expect(settled.success).toBe(true);
    expect(settled.balances).toHaveLength(0);

    const remaining = await listExpenses();
    expect(remaining).toHaveLength(0);

    const finalBalances = await getBalances();
    expect(finalBalances).toHaveLength(0);

    const storedExpenses = await localStorageAdapter.get<any[]>(STORAGE_KEYS.EXPENSES);
    expect(storedExpenses).toHaveLength(1);
    expect(storedExpenses?.[0]?.amount).toBe(75);
    expect(storedExpenses?.[0]?.isSettled).toBe(true);
  });
});
