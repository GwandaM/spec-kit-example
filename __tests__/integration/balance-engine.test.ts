import { initializeStorage } from "@/lib/storage/init";
import { localStorageAdapter } from "@/lib/storage/local-storage.adapter";
import { STORAGE_KEYS } from "@/lib/storage/adapter";
import type { Member } from "@/lib/types/entities";
import { createExpense, getBalances } from "@/src/server/actions/expenses";

const aliceId = "00000000-0000-0000-0000-000000000021";
const bobId = "00000000-0000-0000-0000-000000000022";
const carlaId = "00000000-0000-0000-0000-000000000023";

const members: Member[] = [
  {
    id: aliceId,
    name: "Alice",
    color: "#f87171",
    shareRatio: 0.4,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    isActive: true,
  },
  {
    id: bobId,
    name: "Bob",
    color: "#60a5fa",
    shareRatio: 0.3,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    isActive: true,
  },
  {
    id: carlaId,
    name: "Carla",
    color: "#34d399",
    shareRatio: 0.3,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    isActive: true,
  },
];

describe("Balance engine integration", () => {
  beforeEach(async () => {
    globalThis.__LOCAL_STORAGE_RESET__?.();
    await initializeStorage({ adapter: localStorageAdapter });
    await localStorageAdapter.set(STORAGE_KEYS.MEMBERS, members);
  });

  it("simplifies debts across multiple expenses with decimals", async () => {
    const baseDate = new Date("2024-04-01T12:00:00.000Z");

    const expenses = [
      {
        description: "Weekly groceries",
        amount: 90,
        participants: [
          { memberId: aliceId, amount: 30, percentage: null },
          { memberId: bobId, amount: 30, percentage: null },
          { memberId: carlaId, amount: 30, percentage: null },
        ],
        payerId: aliceId,
      },
      {
        description: "Ride share",
        amount: 30,
        participants: [
          { memberId: aliceId, amount: 10, percentage: null },
          { memberId: bobId, amount: 10, percentage: null },
          { memberId: carlaId, amount: 10, percentage: null },
        ],
        payerId: bobId,
      },
      {
        description: "Streaming subscription",
        amount: 45,
        participants: [
          { memberId: aliceId, amount: 25, percentage: null },
          { memberId: bobId, amount: 10, percentage: null },
          { memberId: carlaId, amount: 10, percentage: null },
        ],
        payerId: carlaId,
      },
      {
        description: "Cleaning supplies",
        amount: 20,
        participants: [
          { memberId: aliceId, amount: 5, percentage: null },
          { memberId: bobId, amount: 7.5, percentage: null },
          { memberId: carlaId, amount: 7.5, percentage: null },
        ],
        payerId: aliceId,
      },
      {
        description: "Movie night",
        amount: 35,
        participants: [
          { memberId: aliceId, amount: 10, percentage: null },
          { memberId: bobId, amount: 5, percentage: null },
          { memberId: carlaId, amount: 20, percentage: null },
        ],
        payerId: bobId,
      },
      {
        description: "Gym passes",
        amount: 30,
        participants: [
          { memberId: aliceId, amount: 12.5, percentage: null },
          { memberId: bobId, amount: 7.5, percentage: null },
          { memberId: carlaId, amount: 10, percentage: null },
        ],
        payerId: carlaId,
      },
    ];

    for (let index = 0; index < expenses.length; index += 1) {
      const expense = expenses[index];
      const result = await createExpense({
        description: expense.description,
        amount: expense.amount,
        currency: "USD",
        category: "Shared",
        payerId: expense.payerId,
        splitMode: "custom",
        participants: expense.participants,
        notes: undefined,
        datetime: new Date(baseDate.getTime() + index * 86_400_000),
        createdBy: expense.payerId,
      });
      if (!result.success) {
        throw new Error(result.error ?? "expense creation failed");
      }
      expect(result.success).toBe(true);
    }

    const balances = await getBalances();
    expect(balances).toHaveLength(2);
    expect(balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fromMemberId: bobId, toMemberId: aliceId, amount: 5 }),
        expect.objectContaining({ fromMemberId: carlaId, toMemberId: aliceId, amount: 12.5 }),
      ])
    );
  });
});
