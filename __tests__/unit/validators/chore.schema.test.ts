/**
 * Unit tests for chore Zod schemas
 * T017: Contract tests for Chore and ChoreAssignment schemas
 */

import { describe, it, expect } from "@jest/globals";
import {
  choreSchema,
  createChoreSchema,
  updateChoreSchema,
  choreAssignmentSchema,
  createChoreAssignmentSchema,
  completeChoreSchema,
  overrideAssignmentSchema,
} from "@/src/server/validators/chore.schema";

describe("Chore Schema", () => {
  const validChore = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Clean kitchen",
    cadence: "weekly",
    rotationSequence: [
      "123e4567-e89b-12d3-a456-426614174000",
      "223e4567-e89b-12d3-a456-426614174000",
      "323e4567-e89b-12d3-a456-426614174000",
    ],
    currentIndex: 0,
    createdAt: new Date(),
    isActive: true,
  };

  it("should validate a valid chore", () => {
    const result = choreSchema.safeParse(validChore);
    expect(result.success).toBe(true);
  });

  it("should reject chore with empty name", () => {
    const result = choreSchema.safeParse({ ...validChore, name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject chore with name > 100 chars", () => {
    const result = choreSchema.safeParse({ ...validChore, name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("should reject chore with empty cadence", () => {
    const result = choreSchema.safeParse({ ...validChore, cadence: "" });
    expect(result.success).toBe(false);
  });

  it("should reject chore with empty rotation sequence", () => {
    const result = choreSchema.safeParse({ ...validChore, rotationSequence: [] });
    expect(result.success).toBe(false);
  });

  it("should reject chore with negative currentIndex", () => {
    const result = choreSchema.safeParse({ ...validChore, currentIndex: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject chore with float currentIndex", () => {
    const result = choreSchema.safeParse({ ...validChore, currentIndex: 1.5 });
    expect(result.success).toBe(false);
  });
});

describe("CreateChore Schema", () => {
  const validCreateChore = {
    name: "Vacuum living room",
    cadence: "biweekly",
    rotationSequence: [
      "123e4567-e89b-12d3-a456-426614174000",
      "223e4567-e89b-12d3-a456-426614174000",
    ],
  };

  it("should validate valid create chore input", () => {
    const result = createChoreSchema.safeParse(validCreateChore);
    expect(result.success).toBe(true);
  });

  it("should set default currentIndex to 0", () => {
    const result = createChoreSchema.safeParse(validCreateChore);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentIndex).toBe(0);
    }
  });

  it("should set default isActive to true", () => {
    const result = createChoreSchema.safeParse(validCreateChore);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });

  it("should accept custom currentIndex", () => {
    const result = createChoreSchema.safeParse({
      ...validCreateChore,
      currentIndex: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentIndex).toBe(1);
    }
  });

  it("should reject currentIndex >= rotation sequence length", () => {
    const result = createChoreSchema.safeParse({
      ...validCreateChore,
      currentIndex: 2, // rotationSequence has length 2
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("currentIndex");
    }
  });

  it("should reject currentIndex > rotation sequence length", () => {
    const result = createChoreSchema.safeParse({
      ...validCreateChore,
      currentIndex: 5,
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateChore Schema", () => {
  it("should validate partial updates", () => {
    const result = updateChoreSchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Updated chore name",
    });
    expect(result.success).toBe(true);
  });

  it("should validate updating cadence only", () => {
    const result = updateChoreSchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      cadence: "monthly",
    });
    expect(result.success).toBe(true);
  });

  it("should validate updating rotation sequence", () => {
    const result = updateChoreSchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      rotationSequence: [
        "123e4567-e89b-12d3-a456-426614174000",
        "223e4567-e89b-12d3-a456-426614174000",
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should validate when currentIndex < rotationSequence length", () => {
    const result = updateChoreSchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      rotationSequence: [
        "123e4567-e89b-12d3-a456-426614174000",
        "223e4567-e89b-12d3-a456-426614174000",
        "323e4567-e89b-12d3-a456-426614174000",
      ],
      currentIndex: 1,
    });
    expect(result.success).toBe(true);
  });

  it("should reject when currentIndex >= rotationSequence length", () => {
    const result = updateChoreSchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      rotationSequence: ["123e4567-e89b-12d3-a456-426614174000"],
      currentIndex: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("ChoreAssignment Schema", () => {
  const validAssignment = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    choreId: "223e4567-e89b-12d3-a456-426614174000",
    assignedTo: "323e4567-e89b-12d3-a456-426614174000",
    dueDate: new Date("2025-12-31"),
    completedAt: null,
    completedBy: null,
    isDisputed: false,
    createdAt: new Date(),
  };

  it("should validate a valid assignment", () => {
    const result = choreAssignmentSchema.safeParse(validAssignment);
    expect(result.success).toBe(true);
  });

  it("should accept completedAt as date", () => {
    const result = choreAssignmentSchema.safeParse({
      ...validAssignment,
      completedAt: new Date(),
      completedBy: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject assignment with invalid choreId UUID", () => {
    const result = choreAssignmentSchema.safeParse({
      ...validAssignment,
      choreId: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject assignment with invalid assignedTo UUID", () => {
    const result = choreAssignmentSchema.safeParse({
      ...validAssignment,
      assignedTo: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateChoreAssignment Schema", () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const validCreateAssignment = {
    choreId: "123e4567-e89b-12d3-a456-426614174000",
    assignedTo: "223e4567-e89b-12d3-a456-426614174000",
    dueDate: futureDate,
  };

  it("should validate valid create assignment input", () => {
    const result = createChoreAssignmentSchema.safeParse(validCreateAssignment);
    expect(result.success).toBe(true);
  });

  it("should reject due date in the past", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const result = createChoreAssignmentSchema.safeParse({
      ...validCreateAssignment,
      dueDate: pastDate,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("dueDate");
    }
  });

  it("should accept due date as current date or future", () => {
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 1); // Slightly in future to avoid timing issues

    const result = createChoreAssignmentSchema.safeParse({
      ...validCreateAssignment,
      dueDate: futureDate,
    });
    expect(result.success).toBe(true);
  });
});

describe("CompleteChore Schema", () => {
  it("should validate complete chore input", () => {
    const result = completeChoreSchema.safeParse({
      assignmentId: "123e4567-e89b-12d3-a456-426614174000",
      completedBy: "223e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid assignment UUID", () => {
    const result = completeChoreSchema.safeParse({
      assignmentId: "invalid",
      completedBy: "223e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid completedBy UUID", () => {
    const result = completeChoreSchema.safeParse({
      assignmentId: "123e4567-e89b-12d3-a456-426614174000",
      completedBy: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("OverrideAssignment Schema", () => {
  it("should validate override assignment input", () => {
    const result = overrideAssignmentSchema.safeParse({
      choreId: "123e4567-e89b-12d3-a456-426614174000",
      assignedTo: "223e4567-e89b-12d3-a456-426614174000",
      dueDate: new Date("2025-12-31"),
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid choreId UUID", () => {
    const result = overrideAssignmentSchema.safeParse({
      choreId: "invalid",
      assignedTo: "223e4567-e89b-12d3-a456-426614174000",
      dueDate: new Date("2025-12-31"),
    });
    expect(result.success).toBe(false);
  });
});
