/**
 * Chore Zod Schemas
 * Covers: Chore, ChoreAssignment
 */

import { z } from "zod";

/**
 * Chore Schema
 * Validation rules from data-model.md
 */
export const choreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  cadence: z.string().min(1), // daily, weekly, biweekly, monthly, or custom
  rotationSequence: z.array(z.string().uuid()).min(1),
  currentIndex: z.number().int().min(0),
  createdAt: z.date(),
  isActive: z.boolean(),
});

/**
 * Create Chore Schema
 */
export const createChoreSchema = choreSchema
  .omit({
    id: true,
    currentIndex: true,
    createdAt: true,
    isActive: true,
  })
  .extend({
    currentIndex: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      return data.currentIndex < data.rotationSequence.length;
    },
    {
      message: "Current index must be < rotation sequence length",
      path: ["currentIndex"],
    }
  );

/**
 * Update Chore Schema
 */
export const updateChoreSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100).optional(),
    cadence: z.string().min(1).optional(),
    rotationSequence: z.array(z.string().uuid()).min(1).optional(),
    currentIndex: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.currentIndex !== undefined && data.rotationSequence !== undefined) {
        return data.currentIndex < data.rotationSequence.length;
      }
      return true;
    },
    {
      message: "Current index must be < rotation sequence length",
      path: ["currentIndex"],
    }
  );

/**
 * ChoreAssignment Schema
 * Validation rules from data-model.md
 */
export const choreAssignmentSchema = z.object({
  id: z.string().uuid(),
  choreId: z.string().uuid(),
  assignedTo: z.string().uuid(),
  dueDate: z.date(),
  completedAt: z.date().nullable(),
  completedBy: z.string().uuid().nullable(),
  isDisputed: z.boolean(),
  createdAt: z.date(),
});

/**
 * Create ChoreAssignment Schema
 */
export const createChoreAssignmentSchema = choreAssignmentSchema
  .omit({
    id: true,
    completedAt: true,
    completedBy: true,
    isDisputed: true,
    createdAt: true,
  })
  .refine(
    (data) => {
      return data.dueDate >= new Date();
    },
    {
      message: "Due date must be in the future",
      path: ["dueDate"],
    }
  );

export const createAssignmentSchema = createChoreAssignmentSchema;

/**
 * Complete Chore Schema
 */
export const completeChoreSchema = z.object({
  assignmentId: z.string().uuid(),
  completedBy: z.string().uuid(),
});

/**
 * Override Assignment Schema (manual override without affecting rotation)
 */
export const overrideAssignmentSchema = z.object({
  choreId: z.string().uuid(),
  assignedTo: z.string().uuid(),
  dueDate: z.date(),
});

/**
 * Type inference helpers
 */
export type Chore = z.infer<typeof choreSchema>;
export type CreateChoreInput = z.infer<typeof createChoreSchema>;
export type UpdateChoreInput = z.infer<typeof updateChoreSchema>;

export type ChoreAssignment = z.infer<typeof choreAssignmentSchema>;
export type CreateChoreAssignmentInput = z.infer<typeof createChoreAssignmentSchema>;
export type CompleteChoreInput = z.infer<typeof completeChoreSchema>;
export type OverrideAssignmentInput = z.infer<typeof overrideAssignmentSchema>;
