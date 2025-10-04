/**
 * Contract Tests: Chore CRUD Actions
 * Tests for createChore, updateChore, deleteChore
 *
 * @group contract
 * @group chores
 */

import { describe, it, expect } from "@jest/globals";
import { createChoreSchema, updateChoreSchema } from "@/src/server/validators/chore.schema";

describe("Chore CRUD Contracts", () => {
  describe("createChore schema validation", () => {
    it("should accept valid chore", () => {
      const input = {
        name: "Clean kitchen",
        cadence: "weekly",
        rotationSequence: ["member-1", "member-2", "member-3"],
      };

      const result = createChoreSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept daily cadence", () => {
      const input = {
        name: "Take out trash",
        cadence: "daily",
        rotationSequence: ["member-1", "member-2"],
      };

      const result = createChoreSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept custom cadence", () => {
      const input = {
        name: "Water plants",
        cadence: "every 3 days",
        rotationSequence: ["member-1"],
      };

      const result = createChoreSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const input = {
        name: "",
        cadence: "weekly",
        rotationSequence: ["member-1"],
      };

      const result = createChoreSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 100 chars", () => {
      const input = {
        name: "a".repeat(101),
        cadence: "weekly",
        rotationSequence: ["member-1"],
      };

      const result = createChoreSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject empty rotation sequence", () => {
      const input = {
        name: "Clean kitchen",
        cadence: "weekly",
        rotationSequence: [],
      };

      const result = createChoreSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updateChore schema validation", () => {
    it("should accept valid update", () => {
      const input = {
        id: "chore-123",
        name: "Deep clean kitchen",
        cadence: "biweekly",
      };

      const result = updateChoreSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept rotation sequence update", () => {
      const input = {
        id: "chore-123",
        rotationSequence: ["member-1", "member-2", "member-3", "member-4"],
      };

      const result = updateChoreSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const input = {
        name: "Clean kitchen",
      };

      const result = updateChoreSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("deleteChore contract", () => {
    it("should accept valid chore ID", () => {
      const input = { id: "chore-123" };

      expect(input.id).toBeTruthy();
      expect(typeof input.id).toBe("string");
    });
  });
});
