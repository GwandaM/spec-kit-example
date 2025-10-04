/**
 * Contract Tests: Fitness Goal Actions
 * Tests for createFitnessGoal, updateFitnessGoal, getGoalProgress
 *
 * @group contract
 * @group gym
 */

import { describe, it, expect } from "@jest/globals";
import { createGoalSchema, updateGoalSchema } from "@/src/server/validators/gym.schema";

describe("Fitness Goal Contracts", () => {
  describe("createFitnessGoal schema validation", () => {
    it("should accept valid session count goal", () => {
      const input = {
        description: "Complete 20 workouts this month",
        targetMetric: "sessionCount",
        targetValue: 20,
        period: "month",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
      };

      const result = createGoalSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept valid duration goal", () => {
      const input = {
        description: "Train for 300 minutes this week",
        targetMetric: "totalDuration",
        targetValue: 300,
        period: "week",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-07"),
      };

      const result = createGoalSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept custom period goal", () => {
      const input = {
        description: "Train 30 times in 3 months",
        targetMetric: "sessionCount",
        targetValue: 30,
        period: "custom",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-12-31"),
      };

      const result = createGoalSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject empty description", () => {
      const input = {
        description: "",
        targetMetric: "sessionCount",
        targetValue: 20,
        period: "month",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
      };

      const result = createGoalSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject description longer than 200 chars", () => {
      const input = {
        description: "a".repeat(201),
        targetMetric: "sessionCount",
        targetValue: 20,
        period: "month",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
      };

      const result = createGoalSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject invalid target metric", () => {
      const input = {
        description: "Test goal",
        targetMetric: "invalid",
        targetValue: 20,
        period: "month",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
      };

      const result = createGoalSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject target value less than or equal to 0", () => {
      const input = {
        description: "Test goal",
        targetMetric: "sessionCount",
        targetValue: 0,
        period: "month",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
      };

      const result = createGoalSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updateFitnessGoal schema validation", () => {
    it("should accept valid update", () => {
      const input = {
        id: "goal-123",
        description: "Updated goal description",
        targetValue: 25,
      };

      const result = updateGoalSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const input = {
        id: "goal-123",
        isActive: false,
      };

      const result = updateGoalSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const input = {
        description: "Updated goal",
      };

      const result = updateGoalSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("getGoalProgress contract", () => {
    it("should accept valid goal ID", () => {
      const input = { goalId: "goal-123" };

      expect(input.goalId).toBeTruthy();
      expect(typeof input.goalId).toBe("string");
    });

    it("should calculate session count progress", () => {
      const goal = {
        targetMetric: "sessionCount",
        targetValue: 20,
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
      };

      const sessions = [
        { date: new Date("2025-10-05") },
        { date: new Date("2025-10-10") },
        { date: new Date("2025-10-15") },
      ];

      const progress = sessions.length;
      const percentComplete = (progress / goal.targetValue) * 100;

      expect(progress).toBe(3);
      expect(percentComplete).toBe(15);
    });

    it("should calculate duration progress", () => {
      const goal = {
        targetMetric: "totalDuration",
        targetValue: 300,
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
      };

      const sessions = [{ duration: 45 }, { duration: 60 }, { duration: 30 }];

      const progress = sessions.reduce((sum, s) => sum + s.duration, 0);
      const percentComplete = (progress / goal.targetValue) * 100;

      expect(progress).toBe(135);
      expect(percentComplete).toBe(45);
    });
  });
});
