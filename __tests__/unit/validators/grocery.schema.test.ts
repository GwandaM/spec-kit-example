/**
 * Unit tests for grocery Zod schemas
 * T015: Contract tests for GroceryItem schemas
 */

import { describe, it, expect } from "@jest/globals";
import {
  groceryItemSchema,
  addGrocerySchema,
  updateGrocerySchema,
  duplicateDetectionSchema,
  mergeDuplicatesSchema,
} from "@/src/server/validators/grocery.schema";

describe("GroceryItem Schema", () => {
  const validGroceryItem = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Milk",
    quantity: 2,
    unit: "liters",
    cost: 5.99,
    category: "Dairy",
    addedBy: "123e4567-e89b-12d3-a456-426614174000",
    purchasedAt: new Date(),
    createdAt: new Date(),
    isDuplicate: false,
  };

  it("should validate a valid grocery item", () => {
    const result = groceryItemSchema.safeParse(validGroceryItem);
    expect(result.success).toBe(true);
  });

  it("should reject grocery item with empty name", () => {
    const result = groceryItemSchema.safeParse({ ...validGroceryItem, name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject grocery item with name > 100 chars", () => {
    const result = groceryItemSchema.safeParse({
      ...validGroceryItem,
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("should accept null quantity", () => {
    const result = groceryItemSchema.safeParse({ ...validGroceryItem, quantity: null });
    expect(result.success).toBe(true);
  });

  it("should reject negative quantity", () => {
    const result = groceryItemSchema.safeParse({ ...validGroceryItem, quantity: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject zero quantity", () => {
    const result = groceryItemSchema.safeParse({ ...validGroceryItem, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it("should accept null unit", () => {
    const result = groceryItemSchema.safeParse({ ...validGroceryItem, unit: null });
    expect(result.success).toBe(true);
  });

  it("should reject unit > 20 chars", () => {
    const result = groceryItemSchema.safeParse({
      ...validGroceryItem,
      unit: "a".repeat(21),
    });
    expect(result.success).toBe(false);
  });

  it("should accept zero cost", () => {
    const result = groceryItemSchema.safeParse({ ...validGroceryItem, cost: 0 });
    expect(result.success).toBe(true);
  });

  it("should reject negative cost", () => {
    const result = groceryItemSchema.safeParse({ ...validGroceryItem, cost: -0.01 });
    expect(result.success).toBe(false);
  });

  it("should validate cost with 2 decimal places", () => {
    const result = groceryItemSchema.safeParse({ ...validGroceryItem, cost: 5.99 });
    expect(result.success).toBe(true);
  });

  it("should reject category > 30 chars", () => {
    const result = groceryItemSchema.safeParse({
      ...validGroceryItem,
      category: "a".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid UUID for addedBy", () => {
    const result = groceryItemSchema.safeParse({
      ...validGroceryItem,
      addedBy: "invalid-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("AddGrocery Schema", () => {
  const validAddGrocery = {
    name: "Eggs",
    quantity: 12,
    unit: "pieces",
    cost: 3.5,
    category: "Dairy",
    addedBy: "123e4567-e89b-12d3-a456-426614174000",
    purchasedAt: new Date(),
  };

  it("should validate valid add grocery input", () => {
    const result = addGrocerySchema.safeParse(validAddGrocery);
    expect(result.success).toBe(true);
  });

  it("should validate without id, createdAt, isDuplicate", () => {
    const result = addGrocerySchema.safeParse(validAddGrocery);
    expect(result.success).toBe(true);
  });

  it("should omit id field from validation", () => {
    const result = addGrocerySchema.safeParse({
      ...validAddGrocery,
      id: "123e4567-e89b-12d3-a456-426614174000",
    });
    // Zod .omit() silently ignores extra fields, so this will pass
    expect(result.success).toBe(true);
  });
});

describe("UpdateGrocery Schema", () => {
  it("should validate partial updates", () => {
    const result = updateGrocerySchema.safeParse({
      name: "Updated Milk",
    });
    expect(result.success).toBe(true);
  });

  it("should validate updating quantity only", () => {
    const result = updateGrocerySchema.safeParse({
      quantity: 3,
    });
    expect(result.success).toBe(true);
  });

  it("should validate updating cost only", () => {
    const result = updateGrocerySchema.safeParse({
      cost: 6.99,
    });
    expect(result.success).toBe(true);
  });

  it("should validate updating multiple fields", () => {
    const result = updateGrocerySchema.safeParse({
      name: "Organic Milk",
      cost: 7.99,
      category: "Organic",
    });
    expect(result.success).toBe(true);
  });

  it("should reject negative cost in update", () => {
    const result = updateGrocerySchema.safeParse({
      cost: -5.0,
    });
    expect(result.success).toBe(false);
  });
});

describe("DuplicateDetection Schema", () => {
  it("should validate duplicate detection input", () => {
    const result = duplicateDetectionSchema.safeParse({
      name: "Milk",
      purchasedAt: new Date(),
      similarityThreshold: 0.8,
    });
    expect(result.success).toBe(true);
  });

  it("should use default similarity threshold", () => {
    const result = duplicateDetectionSchema.safeParse({
      name: "Milk",
      purchasedAt: new Date(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.similarityThreshold).toBe(0.8);
    }
  });

  it("should reject threshold > 1", () => {
    const result = duplicateDetectionSchema.safeParse({
      name: "Milk",
      purchasedAt: new Date(),
      similarityThreshold: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("should reject threshold < 0", () => {
    const result = duplicateDetectionSchema.safeParse({
      name: "Milk",
      purchasedAt: new Date(),
      similarityThreshold: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty name", () => {
    const result = duplicateDetectionSchema.safeParse({
      name: "",
      purchasedAt: new Date(),
    });
    expect(result.success).toBe(false);
  });
});

describe("MergeDuplicates Schema", () => {
  it("should validate merge duplicates input", () => {
    const result = mergeDuplicatesSchema.safeParse({
      keepId: "123e4567-e89b-12d3-a456-426614174000",
      mergeIds: ["223e4567-e89b-12d3-a456-426614174000", "323e4567-e89b-12d3-a456-426614174000"],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty mergeIds array", () => {
    const result = mergeDuplicatesSchema.safeParse({
      keepId: "123e4567-e89b-12d3-a456-426614174000",
      mergeIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid UUID in keepId", () => {
    const result = mergeDuplicatesSchema.safeParse({
      keepId: "invalid-uuid",
      mergeIds: ["223e4567-e89b-12d3-a456-426614174000"],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid UUID in mergeIds", () => {
    const result = mergeDuplicatesSchema.safeParse({
      keepId: "123e4567-e89b-12d3-a456-426614174000",
      mergeIds: ["invalid-uuid"],
    });
    expect(result.success).toBe(false);
  });
});
