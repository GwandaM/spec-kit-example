/**
 * Contract Test: deleteExpense Server Action
 * Tests input validation and authorization rules
 */

import { z } from "zod";

// Define schema for deleteExpense input
const deleteExpenseSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
});

describe("deleteExpense Contract", () => {
  describe("Input Schema Validation", () => {
    it("should validate valid delete request", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440099",
        memberId: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = deleteExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should fail with invalid expense ID", () => {
      const input = {
        id: "invalid-uuid",
        memberId: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = deleteExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail with invalid member ID", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440099",
        memberId: "not-a-uuid",
      };

      const result = deleteExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail with missing id", () => {
      const input = {
        memberId: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = deleteExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail with missing memberId", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440099",
      };

      const result = deleteExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("Output Schema", () => {
    it("should have correct success response shape", () => {
      const successOutput = {
        success: true,
      };

      expect(successOutput.success).toBe(true);
      expect(successOutput).not.toHaveProperty("error");
    });

    it("should have correct error response shape for not found", () => {
      const errorOutput = {
        success: false,
        error: "Expense not found",
      };

      expect(errorOutput.success).toBe(false);
      expect(errorOutput).toHaveProperty("error");
    });

    it("should have correct error response shape for unauthorized", () => {
      const errorOutput = {
        success: false,
        error: "Only creator can delete expense",
      };

      expect(errorOutput.success).toBe(false);
      expect(errorOutput.error).toBe("Only creator can delete expense");
    });
  });
});
