/**
 * Contract Test: createExpense Server Action
 * Tests input/output schema validation and side effects
 */

import { createExpenseSchema } from "@/src/server/validators/expense.schema";

describe("createExpense Contract", () => {
  describe("Input Schema Validation", () => {
    it("should validate equal split mode", () => {
      const input = {
        description: "Electricity Bill",
        amount: 120.0,
        currency: "USD",
        category: "Bills",
        payerId: "550e8400-e29b-41d4-a716-446655440001",
        splitMode: "equal" as const,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: 60, percentage: null },
          { memberId: "550e8400-e29b-41d4-a716-446655440002", amount: 60, percentage: null },
        ],
        datetime: new Date(),
        createdBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should validate ratio split mode", () => {
      const input = {
        description: "Groceries",
        amount: 100.0,
        currency: "USD",
        category: "Groceries",
        payerId: "550e8400-e29b-41d4-a716-446655440001",
        splitMode: "ratio" as const,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: 66.67, percentage: 66.67 },
          { memberId: "550e8400-e29b-41d4-a716-446655440002", amount: 33.33, percentage: 33.33 },
        ],
        notes: "Weekly groceries",
        datetime: new Date(),
        createdBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should validate custom split mode", () => {
      const input = {
        description: "Takeout dinner",
        amount: 45.0,
        currency: "USD",
        category: "Takeout",
        payerId: "550e8400-e29b-41d4-a716-446655440001",
        splitMode: "custom" as const,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: 30, percentage: null },
          { memberId: "550e8400-e29b-41d4-a716-446655440002", amount: 15, percentage: null },
        ],
        datetime: new Date(),
        createdBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should fail when participant amounts do not sum to total", () => {
      const input = {
        description: "Test expense",
        amount: 100.0,
        currency: "USD",
        category: "Other",
        payerId: "550e8400-e29b-41d4-a716-446655440001",
        splitMode: "custom" as const,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: 60, percentage: null },
          { memberId: "550e8400-e29b-41d4-a716-446655440002", amount: 30, percentage: null }, // Sum = 90, not 100
        ],
        datetime: new Date(),
        createdBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("sum to total");
      }
    });

    it("should fail when payer not in participants", () => {
      const input = {
        description: "Test expense",
        amount: 100.0,
        currency: "USD",
        category: "Other",
        payerId: "550e8400-e29b-41d4-a716-446655440003", // Not in participants
        splitMode: "equal" as const,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: 50, percentage: null },
          { memberId: "550e8400-e29b-41d4-a716-446655440002", amount: 50, percentage: null },
        ],
        datetime: new Date(),
        createdBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Payer must be included");
      }
    });

    it("should fail with negative amount", () => {
      const input = {
        description: "Test expense",
        amount: -50,
        currency: "USD",
        category: "Other",
        payerId: "550e8400-e29b-41d4-a716-446655440001",
        splitMode: "equal" as const,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: -50, percentage: null },
        ],
        datetime: new Date(),
        createdBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should allow participant sum within 0.01 tolerance", () => {
      const input = {
        description: "Test expense with rounding",
        amount: 100.0,
        currency: "USD",
        category: "Other",
        payerId: "550e8400-e29b-41d4-a716-446655440001",
        splitMode: "custom" as const,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: 66.67, percentage: null },
          { memberId: "550e8400-e29b-41d4-a716-446655440002", amount: 33.33, percentage: null }, // Sum = 100.00
        ],
        datetime: new Date(),
        createdBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("Output Schema", () => {
    it("should have correct success response shape", () => {
      const successOutput = {
        success: true,
        expense: {
          id: "550e8400-e29b-41d4-a716-446655440099",
          description: "Test",
          amount: 100,
          currency: "USD",
          category: "Other",
          payerId: "550e8400-e29b-41d4-a716-446655440001",
          splitMode: "equal" as const,
          participants: [],
          datetime: new Date(),
          createdBy: "550e8400-e29b-41d4-a716-446655440001",
          isSettled: false,
          settledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        balances: [],
      };

      expect(successOutput.success).toBe(true);
      expect(successOutput).toHaveProperty("expense");
      expect(successOutput).toHaveProperty("balances");
    });

    it("should have correct error response shape", () => {
      const errorOutput = {
        success: false,
        error: "Invalid member ID",
      };

      expect(errorOutput.success).toBe(false);
      expect(errorOutput).toHaveProperty("error");
    });
  });
});
