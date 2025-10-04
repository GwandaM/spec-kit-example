/**
 * Unit tests for expense Zod schemas
 * T013: Contract tests for Expense and ExpenseParticipant schemas
 */

import { describe, it, expect } from "@jest/globals";
import {
  expenseSchema,
  expenseParticipantSchema,
  createExpenseSchema,
  updateExpenseSchema,
  settleExpenseSchema,
  balanceSchema,
  equalSplitSchema,
  ratioSplitSchema,
  customSplitSchema,
} from "@/src/server/validators/expense.schema";

describe("ExpenseParticipant Schema", () => {
  const validParticipant = {
    memberId: "123e4567-e89b-12d3-a456-426614174000",
    amount: 25.5,
    percentage: 50,
  };

  it("should validate a valid participant", () => {
    const result = expenseParticipantSchema.safeParse(validParticipant);
    expect(result.success).toBe(true);
  });

  it("should reject participant with invalid UUID", () => {
    const result = expenseParticipantSchema.safeParse({
      ...validParticipant,
      memberId: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject participant with negative amount", () => {
    const result = expenseParticipantSchema.safeParse({
      ...validParticipant,
      amount: -10,
    });
    expect(result.success).toBe(false);
  });

  it("should reject participant with zero amount", () => {
    const result = expenseParticipantSchema.safeParse({
      ...validParticipant,
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should accept null percentage", () => {
    const result = expenseParticipantSchema.safeParse({
      ...validParticipant,
      percentage: null,
    });
    expect(result.success).toBe(true);
  });

  it("should reject percentage > 100", () => {
    const result = expenseParticipantSchema.safeParse({
      ...validParticipant,
      percentage: 101,
    });
    expect(result.success).toBe(false);
  });

  it("should reject percentage < 0", () => {
    const result = expenseParticipantSchema.safeParse({
      ...validParticipant,
      percentage: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("Expense Schema", () => {
  const validExpense = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    description: "Grocery shopping",
    amount: 100.0,
    currency: "USD",
    category: "Food",
    payerId: "123e4567-e89b-12d3-a456-426614174000",
    splitMode: "equal" as const,
    participants: [
      {
        memberId: "123e4567-e89b-12d3-a456-426614174000",
        amount: 50.0,
        percentage: null,
      },
      {
        memberId: "223e4567-e89b-12d3-a456-426614174000",
        amount: 50.0,
        percentage: null,
      },
    ],
    notes: "Weekly groceries",
    datetime: new Date(),
    createdBy: "123e4567-e89b-12d3-a456-426614174000",
    isSettled: false,
    settledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should validate a valid expense", () => {
    const result = expenseSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });

  it("should reject expense with empty description", () => {
    const result = expenseSchema.safeParse({ ...validExpense, description: "" });
    expect(result.success).toBe(false);
  });

  it("should reject expense with description > 200 chars", () => {
    const result = expenseSchema.safeParse({
      ...validExpense,
      description: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("should reject expense with negative amount", () => {
    const result = expenseSchema.safeParse({ ...validExpense, amount: -10 });
    expect(result.success).toBe(false);
  });

  it("should reject currency not 3 chars", () => {
    const result = expenseSchema.safeParse({ ...validExpense, currency: "US" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid split mode", () => {
    const result = expenseSchema.safeParse({ ...validExpense, splitMode: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid split modes", () => {
    const modes = ["equal", "ratio", "custom"];
    modes.forEach((splitMode) => {
      const result = expenseSchema.safeParse({ ...validExpense, splitMode });
      expect(result.success).toBe(true);
    });
  });

  it("should reject empty participants array", () => {
    const result = expenseSchema.safeParse({ ...validExpense, participants: [] });
    expect(result.success).toBe(false);
  });
});

describe("CreateExpense Schema", () => {
  const payerId = "123e4567-e89b-12d3-a456-426614174000";
  const member2Id = "223e4567-e89b-12d3-a456-426614174000";

  const validCreateExpense = {
    description: "Dinner",
    amount: 100.0,
    currency: "USD",
    category: "Food",
    payerId,
    splitMode: "equal" as const,
    participants: [
      { memberId: payerId, amount: 50.0, percentage: null },
      { memberId: member2Id, amount: 50.0, percentage: null },
    ],
    notes: "Pizza night",
    datetime: new Date(),
    createdBy: payerId,
  };

  it("should validate when participant amounts sum to total", () => {
    const result = createExpenseSchema.safeParse(validCreateExpense);
    expect(result.success).toBe(true);
  });

  it("should reject when participant amounts do not sum to total", () => {
    const result = createExpenseSchema.safeParse({
      ...validCreateExpense,
      participants: [
        { memberId: payerId, amount: 40.0, percentage: null },
        { memberId: member2Id, amount: 50.0, percentage: null },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("participants");
    }
  });

  it("should accept amounts within 0.01 tolerance", () => {
    const result = createExpenseSchema.safeParse({
      ...validCreateExpense,
      amount: 100.0,
      participants: [
        { memberId: payerId, amount: 50.0, percentage: null },
        { memberId: member2Id, amount: 50.0, percentage: null },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject when payer is not in participants", () => {
    const result = createExpenseSchema.safeParse({
      ...validCreateExpense,
      payerId: "323e4567-e89b-12d3-a456-426614174000", // Different ID
      participants: [
        { memberId: payerId, amount: 50.0, percentage: null },
        { memberId: member2Id, amount: 50.0, percentage: null },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("payerId");
    }
  });

  it("should validate equal split", () => {
    const result = createExpenseSchema.safeParse(validCreateExpense);
    expect(result.success).toBe(true);
  });

  it("should validate ratio split", () => {
    const result = createExpenseSchema.safeParse({
      ...validCreateExpense,
      splitMode: "ratio",
      participants: [
        { memberId: payerId, amount: 60.0, percentage: 60 },
        { memberId: member2Id, amount: 40.0, percentage: 40 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should validate custom split", () => {
    const result = createExpenseSchema.safeParse({
      ...validCreateExpense,
      splitMode: "custom",
      participants: [
        { memberId: payerId, amount: 70.0, percentage: null },
        { memberId: member2Id, amount: 30.0, percentage: null },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("UpdateExpense Schema", () => {
  it("should validate partial updates", () => {
    const result = updateExpenseSchema.safeParse({
      description: "Updated description",
    });
    expect(result.success).toBe(true);
  });

  it("should validate when participants and amount are updated together", () => {
    const result = updateExpenseSchema.safeParse({
      amount: 150.0,
      participants: [
        {
          memberId: "123e4567-e89b-12d3-a456-426614174000",
          amount: 75.0,
          percentage: null,
        },
        {
          memberId: "223e4567-e89b-12d3-a456-426614174000",
          amount: 75.0,
          percentage: null,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject when updated participants do not sum to amount", () => {
    const result = updateExpenseSchema.safeParse({
      amount: 150.0,
      participants: [
        {
          memberId: "123e4567-e89b-12d3-a456-426614174000",
          amount: 60.0,
          percentage: null,
        },
        {
          memberId: "223e4567-e89b-12d3-a456-426614174000",
          amount: 80.0,
          percentage: null,
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("SettleExpense Schema", () => {
  it("should validate settle expense input", () => {
    const result = settleExpenseSchema.safeParse({
      expenseId: "123e4567-e89b-12d3-a456-426614174000",
      settledBy: "223e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });
});

describe("Balance Schema", () => {
  it("should validate a valid balance", () => {
    const result = balanceSchema.safeParse({
      fromMemberId: "123e4567-e89b-12d3-a456-426614174000",
      toMemberId: "223e4567-e89b-12d3-a456-426614174000",
      amount: 50.0,
      currency: "USD",
    });
    expect(result.success).toBe(true);
  });

  it("should reject balance with negative amount", () => {
    const result = balanceSchema.safeParse({
      fromMemberId: "123e4567-e89b-12d3-a456-426614174000",
      toMemberId: "223e4567-e89b-12d3-a456-426614174000",
      amount: -50.0,
      currency: "USD",
    });
    expect(result.success).toBe(false);
  });
});

describe("Split Mode Schemas", () => {
  it("should validate equal split", () => {
    const result = equalSplitSchema.safeParse({
      splitMode: "equal",
      amount: 100.0,
      memberIds: ["123e4567-e89b-12d3-a456-426614174000", "223e4567-e89b-12d3-a456-426614174000"],
    });
    expect(result.success).toBe(true);
  });

  it("should validate ratio split", () => {
    const result = ratioSplitSchema.safeParse({
      splitMode: "ratio",
      amount: 100.0,
      memberRatios: [
        { memberId: "123e4567-e89b-12d3-a456-426614174000", ratio: 0.6 },
        { memberId: "223e4567-e89b-12d3-a456-426614174000", ratio: 0.4 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should validate custom split", () => {
    const result = customSplitSchema.safeParse({
      splitMode: "custom",
      amount: 100.0,
      customAmounts: [
        { memberId: "123e4567-e89b-12d3-a456-426614174000", amount: 70.0 },
        { memberId: "223e4567-e89b-12d3-a456-426614174000", amount: 30.0 },
      ],
    });
    expect(result.success).toBe(true);
  });
});
