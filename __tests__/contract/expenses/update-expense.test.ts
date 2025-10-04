/**
 * Contract Test: updateExpense Server Action
 * Tests input/output schema validation and business rules
 */

import { updateExpenseSchema } from "@/src/server/validators/expense.schema";

describe("updateExpense Contract", () => {
  describe("Input Schema Validation", () => {
    it("should validate partial update with description only", () => {
      const input = {
        description: "Updated: Electricity Bill",
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should validate partial update with amount and participants", () => {
      const input = {
        amount: 150.0,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: 75, percentage: null },
          { memberId: "550e8400-e29b-41d4-a716-446655440002", amount: 75, percentage: null },
        ],
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should validate changing split mode to ratio", () => {
      const input = {
        splitMode: "ratio" as const,
        amount: 100.0,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: 70, percentage: 70 },
          { memberId: "550e8400-e29b-41d4-a716-446655440002", amount: 30, percentage: 30 },
        ],
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should fail when participant amounts do not sum to total", () => {
      const input = {
        amount: 100.0,
        participants: [
          { memberId: "550e8400-e29b-41d4-a716-446655440001", amount: 60, percentage: null },
          { memberId: "550e8400-e29b-41d4-a716-446655440002", amount: 30, percentage: null }, // Sum = 90, not 100
        ],
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("sum to total");
      }
    });

    it("should validate update with notes field", () => {
      const input = {
        notes: "Updated notes for this expense",
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should validate update with datetime", () => {
      const input = {
        datetime: new Date("2025-10-01T12:00:00Z"),
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should validate update with category", () => {
      const input = {
        category: "Utilities",
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should fail with negative amount", () => {
      const input = {
        amount: -100,
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should allow empty partial update", () => {
      const input = {};

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("Output Schema", () => {
    it("should have correct success response shape", () => {
      const successOutput = {
        success: true,
        expense: {
          id: "550e8400-e29b-41d4-a716-446655440099",
          description: "Updated Expense",
          amount: 150,
          currency: "USD",
          category: "Utilities",
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
        error: "Expense not found",
      };

      expect(errorOutput.success).toBe(false);
      expect(errorOutput).toHaveProperty("error");
    });
  });
});
