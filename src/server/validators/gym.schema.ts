/**
 * Gym Zod Schemas
 * Covers: GymSession, FitnessGoal
 */

import { z } from "zod";

/**
 * GymSession Schema
 * Validation rules from data-model.md
 */
export const gymSessionSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
  date: z.date(),
  type: z.enum(["cardio", "strength", "other"]),
  duration: z.number().int().min(1).max(600), // 1-600 minutes (10 hours)
  notes: z.string().max(500).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Log GymSession Schema
 */
export const logGymSessionSchema = gymSessionSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine(
    (data) => {
      return data.date <= new Date();
    },
    {
      message: "Session date cannot be in the future",
      path: ["date"],
    }
  );

/**
 * Update GymSession Schema
 */
export const updateGymSessionSchema = gymSessionSchema
  .omit({
    id: true,
    memberId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .refine(
    (data) => {
      if (data.date) {
        return data.date <= new Date();
      }
      return true;
    },
    {
      message: "Session date cannot be in the future",
      path: ["date"],
    }
  );

/**
 * FitnessGoal Schema
 * Validation rules from data-model.md
 */
export const fitnessGoalSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1).max(200),
  targetMetric: z.enum(["sessionCount", "totalDuration"]),
  targetValue: z.number().positive(),
  period: z.enum(["week", "month", "custom"]),
  startDate: z.date(),
  endDate: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

/**
 * Create FitnessGoal Schema
 */
export const createFitnessGoalSchema = fitnessGoalSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .refine(
    (data) => {
      return data.endDate > data.startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

/**
 * Update FitnessGoal Schema
 */
export const updateFitnessGoalSchema = fitnessGoalSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

/**
 * Get Goal Progress Schema
 */
export const getGoalProgressSchema = z.object({
  goalId: z.string().uuid(),
});

export const logSessionSchema = logGymSessionSchema;
export const updateSessionSchema = updateGymSessionSchema;
export const createGoalSchema = createFitnessGoalSchema;
export const updateGoalSchema = updateFitnessGoalSchema;

/**
 * Type inference helpers
 */
export type GymSession = z.infer<typeof gymSessionSchema>;
export type LogGymSessionInput = z.infer<typeof logGymSessionSchema>;
export type UpdateGymSessionInput = z.infer<typeof updateGymSessionSchema>;

export type FitnessGoal = z.infer<typeof fitnessGoalSchema>;
export type CreateFitnessGoalInput = z.infer<typeof createFitnessGoalSchema>;
export type UpdateFitnessGoalInput = z.infer<typeof updateFitnessGoalSchema>;
export type GetGoalProgressInput = z.infer<typeof getGoalProgressSchema>;
