/**
 * Unit tests for gym Zod schemas
 * T019: Contract tests for GymSession and FitnessGoal schemas
 */

import { describe, it, expect } from "@jest/globals";
import {
  gymSessionSchema,
  logGymSessionSchema,
  updateGymSessionSchema,
  fitnessGoalSchema,
  createFitnessGoalSchema,
  updateFitnessGoalSchema,
  getGoalProgressSchema,
} from "@/src/server/validators/gym.schema";

describe("GymSession Schema", () => {
  const validSession = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    memberId: "223e4567-e89b-12d3-a456-426614174000",
    date: new Date("2025-01-01"),
    type: "cardio" as const,
    duration: 45,
    notes: "Morning run",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should validate a valid gym session", () => {
    const result = gymSessionSchema.safeParse(validSession);
    expect(result.success).toBe(true);
  });

  it("should reject session with invalid type", () => {
    const result = gymSessionSchema.safeParse({ ...validSession, type: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid session types", () => {
    const types = ["cardio", "strength", "other"];
    types.forEach((type) => {
      const result = gymSessionSchema.safeParse({ ...validSession, type });
      expect(result.success).toBe(true);
    });
  });

  it("should reject duration < 1", () => {
    const result = gymSessionSchema.safeParse({ ...validSession, duration: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject duration > 600", () => {
    const result = gymSessionSchema.safeParse({ ...validSession, duration: 601 });
    expect(result.success).toBe(false);
  });

  it("should reject float duration", () => {
    const result = gymSessionSchema.safeParse({ ...validSession, duration: 45.5 });
    expect(result.success).toBe(false);
  });

  it("should accept null notes", () => {
    const result = gymSessionSchema.safeParse({ ...validSession, notes: null });
    expect(result.success).toBe(true);
  });

  it("should reject notes > 500 chars", () => {
    const result = gymSessionSchema.safeParse({ ...validSession, notes: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("should reject invalid memberId UUID", () => {
    const result = gymSessionSchema.safeParse({ ...validSession, memberId: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("LogGymSession Schema", () => {
  const validLogSession = {
    memberId: "123e4567-e89b-12d3-a456-426614174000",
    date: new Date("2025-01-01"),
    type: "strength" as const,
    duration: 60,
    notes: "Leg day",
  };

  it("should validate valid log session input", () => {
    const result = logGymSessionSchema.safeParse(validLogSession);
    expect(result.success).toBe(true);
  });

  it("should reject session date in the future", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const result = logGymSessionSchema.safeParse({
      ...validLogSession,
      date: futureDate,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("date");
    }
  });

  it("should accept session date as today", () => {
    const result = logGymSessionSchema.safeParse({
      ...validLogSession,
      date: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it("should accept session date in the past", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);

    const result = logGymSessionSchema.safeParse({
      ...validLogSession,
      date: pastDate,
    });
    expect(result.success).toBe(true);
  });
});

describe("UpdateGymSession Schema", () => {
  it("should validate partial updates", () => {
    const result = updateGymSessionSchema.safeParse({
      duration: 90,
    });
    expect(result.success).toBe(true);
  });

  it("should validate updating type only", () => {
    const result = updateGymSessionSchema.safeParse({
      type: "other",
    });
    expect(result.success).toBe(true);
  });

  it("should validate updating notes only", () => {
    const result = updateGymSessionSchema.safeParse({
      notes: "Updated notes",
    });
    expect(result.success).toBe(true);
  });

  it("should reject future date in update", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const result = updateGymSessionSchema.safeParse({
      date: futureDate,
    });
    expect(result.success).toBe(false);
  });

  it("should accept past date in update", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const result = updateGymSessionSchema.safeParse({
      date: pastDate,
    });
    expect(result.success).toBe(true);
  });

  it("should reject duration > 600 in update", () => {
    const result = updateGymSessionSchema.safeParse({
      duration: 700,
    });
    expect(result.success).toBe(false);
  });
});

describe("FitnessGoal Schema", () => {
  const validGoal = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    description: "Complete 20 sessions this month",
    targetMetric: "sessionCount" as const,
    targetValue: 20,
    period: "month" as const,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-31"),
    createdAt: new Date(),
    isActive: true,
  };

  it("should validate a valid fitness goal", () => {
    const result = fitnessGoalSchema.safeParse(validGoal);
    expect(result.success).toBe(true);
  });

  it("should reject goal with empty description", () => {
    const result = fitnessGoalSchema.safeParse({ ...validGoal, description: "" });
    expect(result.success).toBe(false);
  });

  it("should reject goal with description > 200 chars", () => {
    const result = fitnessGoalSchema.safeParse({
      ...validGoal,
      description: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid targetMetric", () => {
    const result = fitnessGoalSchema.safeParse({ ...validGoal, targetMetric: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid targetMetrics", () => {
    const metrics = ["sessionCount", "totalDuration"];
    metrics.forEach((targetMetric) => {
      const result = fitnessGoalSchema.safeParse({ ...validGoal, targetMetric });
      expect(result.success).toBe(true);
    });
  });

  it("should reject negative targetValue", () => {
    const result = fitnessGoalSchema.safeParse({ ...validGoal, targetValue: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject zero targetValue", () => {
    const result = fitnessGoalSchema.safeParse({ ...validGoal, targetValue: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject invalid period", () => {
    const result = fitnessGoalSchema.safeParse({ ...validGoal, period: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid periods", () => {
    const periods = ["week", "month", "custom"];
    periods.forEach((period) => {
      const result = fitnessGoalSchema.safeParse({ ...validGoal, period });
      expect(result.success).toBe(true);
    });
  });
});

describe("CreateFitnessGoal Schema", () => {
  const validCreateGoal = {
    description: "Run 100km this month",
    targetMetric: "totalDuration" as const,
    targetValue: 600,
    period: "month" as const,
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-02-28"),
    isActive: true,
  };

  it("should validate valid create goal input", () => {
    const result = createFitnessGoalSchema.safeParse(validCreateGoal);
    expect(result.success).toBe(true);
  });

  it("should reject when endDate <= startDate", () => {
    const result = createFitnessGoalSchema.safeParse({
      ...validCreateGoal,
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-02-01"),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("endDate");
    }
  });

  it("should reject when endDate < startDate", () => {
    const result = createFitnessGoalSchema.safeParse({
      ...validCreateGoal,
      startDate: new Date("2025-02-28"),
      endDate: new Date("2025-02-01"),
    });
    expect(result.success).toBe(false);
  });

  it("should validate when endDate > startDate", () => {
    const result = createFitnessGoalSchema.safeParse({
      ...validCreateGoal,
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-02-28"),
    });
    expect(result.success).toBe(true);
  });
});

describe("UpdateFitnessGoal Schema", () => {
  it("should validate partial updates", () => {
    const result = updateFitnessGoalSchema.safeParse({
      description: "Updated goal",
    });
    expect(result.success).toBe(true);
  });

  it("should validate updating targetValue only", () => {
    const result = updateFitnessGoalSchema.safeParse({
      targetValue: 25,
    });
    expect(result.success).toBe(true);
  });

  it("should validate updating dates together", () => {
    const result = updateFitnessGoalSchema.safeParse({
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-31"),
    });
    expect(result.success).toBe(true);
  });

  it("should reject when updated endDate <= startDate", () => {
    const result = updateFitnessGoalSchema.safeParse({
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-01"),
    });
    expect(result.success).toBe(false);
  });

  it("should validate when only one date is updated", () => {
    const result = updateFitnessGoalSchema.safeParse({
      endDate: new Date("2025-03-31"),
    });
    expect(result.success).toBe(true);
  });
});

describe("GetGoalProgress Schema", () => {
  it("should validate get goal progress input", () => {
    const result = getGoalProgressSchema.safeParse({
      goalId: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const result = getGoalProgressSchema.safeParse({
      goalId: "invalid-uuid",
    });
    expect(result.success).toBe(false);
  });
});
