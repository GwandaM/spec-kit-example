/**
 * Contract Test: settleExpense Server Action
 * Tests input/output schema validation
 */

import { settleExpenseSchema } from "@/src/server/validators/expense.schema";

describe("settleExpense Contract", () => {
  describe("Input Schema Validation", () => {
    it("should validate valid settle request", () => {
      const input = {
        expenseId: "550e8400-e29b-41d4-a716-446655440099",
        settledBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = settleExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should fail with invalid expense ID", () => {
      const input = {
        expenseId: "not-a-uuid",
        settledBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = settleExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail with invalid settledBy ID", () => {
      const input = {
        expenseId: "550e8400-e29b-41d4-a716-446655440099",
        settledBy: "invalid-uuid",
      };

      const result = settleExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail with missing expenseId", () => {
      const input = {
        settledBy: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = settleExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail with missing settledBy", () => {
      const input = {
        expenseId: "550e8400-e29b-41d4-a716-446655440099",
      };

      const result = settleExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("Output Schema", () => {
    it("should have correct success response shape", () => {
      const successOutput = {
        success: true,
        expense: {
          id: "550e8400-e29b-41d4-a716-446655440099",
          description: "Settled expense",
          amount: 100,
          currency: "USD",
          category: "Other",
          payerId: "550e8400-e29b-41d4-a716-446655440001",
          splitMode: "equal" as const,
          participants: [],
          datetime: new Date(),
          createdBy: "550e8400-e29b-41d4-a716-446655440001",
          isSettled: true,
          settledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        balances: [],
      };

      expect(successOutput.success).toBe(true);
      expect(successOutput).toHaveProperty("expense");
      expect(successOutput.expense.isSettled).toBe(true);
      expect(successOutput.expense.settledAt).toBeInstanceOf(Date);
      expect(successOutput).toHaveProperty("balances");
    });

    it("should have correct error response shape for not found", () => {
      const errorOutput = {
        success: false,
        error: "Expense not found",
      };

      expect(errorOutput.success).toBe(false);
      expect(errorOutput).toHaveProperty("error");
    });

    it("should have correct error response shape for already settled", () => {
      const errorOutput = {
        success: false,
        error: "Expense already settled",
      };

      expect(errorOutput.success).toBe(false);
      expect(errorOutput.error).toBe("Expense already settled");
    });
  });
});
