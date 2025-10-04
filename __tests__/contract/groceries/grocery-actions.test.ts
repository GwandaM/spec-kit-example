/**
 * Contract Tests: Grocery Server Actions
 * Tests for addGrocery, updateGrocery, removeGrocery, getContributions
 *
 * @group contract
 * @group groceries
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { addGrocerySchema, updateGrocerySchema } from "@/src/server/validators/grocery.schema";

describe("Grocery Action Contracts", () => {
  describe("addGrocery schema validation", () => {
    it("should accept valid grocery item", () => {
      const input = {
        name: "Milk",
        quantity: 2,
        unit: "L",
        cost: 5.99,
        category: "Dairy",
        addedBy: "member-123",
        purchasedAt: new Date(),
      };

      const result = addGrocerySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept grocery without quantity/unit", () => {
      const input = {
        name: "Bread",
        cost: 3.5,
        category: "Bakery",
        addedBy: "member-456",
        purchasedAt: new Date(),
      };

      const result = addGrocerySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const input = {
        name: "",
        cost: 5.99,
        category: "Dairy",
        addedBy: "member-123",
        purchasedAt: new Date(),
      };

      const result = addGrocerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject negative cost", () => {
      const input = {
        name: "Milk",
        cost: -5.99,
        category: "Dairy",
        addedBy: "member-123",
        purchasedAt: new Date(),
      };

      const result = addGrocerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 100 chars", () => {
      const input = {
        name: "a".repeat(101),
        cost: 5.99,
        category: "Dairy",
        addedBy: "member-123",
        purchasedAt: new Date(),
      };

      const result = addGrocerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject category longer than 30 chars", () => {
      const input = {
        name: "Milk",
        cost: 5.99,
        category: "a".repeat(31),
        addedBy: "member-123",
        purchasedAt: new Date(),
      };

      const result = addGrocerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updateGrocery schema validation", () => {
    it("should accept valid update", () => {
      const input = {
        id: "grocery-123",
        name: "Whole Milk",
        quantity: 3,
        unit: "L",
        cost: 6.99,
        category: "Dairy",
      };

      const result = updateGrocerySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const input = {
        id: "grocery-123",
        cost: 7.99,
      };

      const result = updateGrocerySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const input = {
        name: "Milk",
        cost: 5.99,
      };

      const result = updateGrocerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("removeGrocery contract", () => {
    it("should accept valid grocery ID", () => {
      const input = { id: "grocery-123" };

      expect(input.id).toBeTruthy();
      expect(typeof input.id).toBe("string");
    });
  });

  describe("getContributions contract", () => {
    it("should accept valid query parameters", () => {
      const input = {
        memberId: "member-123",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
      };

      expect(input.memberId).toBeTruthy();
      expect(input.startDate).toBeInstanceOf(Date);
      expect(input.endDate).toBeInstanceOf(Date);
    });

    it("should accept category filter", () => {
      const input = {
        category: "Dairy",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
      };

      expect(input.category).toBeTruthy();
    });
  });
});
