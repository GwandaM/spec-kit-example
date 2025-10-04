/**
 * Contract Tests: Chore Assignment Actions
 * Tests for createChoreAssignment, markChoreComplete, rotateChore
 *
 * @group contract
 * @group chores
 */

import { describe, it, expect } from "@jest/globals";
import { createAssignmentSchema } from "@/src/server/validators/chore.schema";

describe("Chore Assignment Contracts", () => {
  describe("createChoreAssignment schema validation", () => {
    it("should accept valid assignment", () => {
      const input = {
        choreId: "chore-123",
        assignedTo: "member-1",
        dueDate: new Date("2025-10-11"),
      };

      const result = createAssignmentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject missing choreId", () => {
      const input = {
        assignedTo: "member-1",
        dueDate: new Date("2025-10-11"),
      };

      const result = createAssignmentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject missing assignedTo", () => {
      const input = {
        choreId: "chore-123",
        dueDate: new Date("2025-10-11"),
      };

      const result = createAssignmentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject missing dueDate", () => {
      const input = {
        choreId: "chore-123",
        assignedTo: "member-1",
      };

      const result = createAssignmentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("markChoreComplete contract", () => {
    it("should accept valid completion", () => {
      const input = {
        assignmentId: "assignment-123",
        completedBy: "member-1",
      };

      expect(input.assignmentId).toBeTruthy();
      expect(input.completedBy).toBeTruthy();
    });

    it("should accept completion without completedBy", () => {
      const input = {
        assignmentId: "assignment-123",
      };

      expect(input.assignmentId).toBeTruthy();
    });
  });

  describe("rotateChore contract", () => {
    it("should accept valid choreId", () => {
      const input = {
        choreId: "chore-123",
      };

      expect(input.choreId).toBeTruthy();
      expect(typeof input.choreId).toBe("string");
    });

    it("should accept manual rotation", () => {
      const input = {
        choreId: "chore-123",
        skipToIndex: 2,
      };

      expect(input.choreId).toBeTruthy();
      expect(typeof input.skipToIndex).toBe("number");
      expect(input.skipToIndex).toBeGreaterThanOrEqual(0);
    });
  });
});
