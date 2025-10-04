/**
 * Grocery Zod Schemas
 * Covers: GroceryItem
 */

import { z } from "zod";

/**
 * GroceryItem Schema
 * Validation rules from data-model.md
 */
export const groceryItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  quantity: z.number().positive().nullable(),
  unit: z.string().max(20).nullable(),
  cost: z.number().min(0).multipleOf(0.01), // 2 decimal places
  category: z.string().max(30),
  addedBy: z.string().uuid(),
  purchasedAt: z.date(),
  createdAt: z.date(),
  isDuplicate: z.boolean(),
});

/**
 * Add Grocery Schema
 */
export const addGrocerySchema = groceryItemSchema.omit({
  id: true,
  createdAt: true,
  isDuplicate: true,
});

/**
 * Update Grocery Schema
 */
export const updateGrocerySchema = groceryItemSchema
  .omit({
    id: true,
    addedBy: true,
    createdAt: true,
  })
  .partial();

/**
 * Duplicate Detection Input
 */
export const duplicateDetectionSchema = z.object({
  name: z.string().min(1).max(100),
  purchasedAt: z.date(),
  similarityThreshold: z.number().min(0).max(1).default(0.8), // 80% similarity
});

/**
 * Merge Duplicates Schema
 */
export const mergeDuplicatesSchema = z.object({
  keepId: z.string().uuid(),
  mergeIds: z.array(z.string().uuid()).min(1),
});

/**
 * Type inference helpers
 */
export type GroceryItem = z.infer<typeof groceryItemSchema>;
export type AddGroceryInput = z.infer<typeof addGrocerySchema>;
export type UpdateGroceryInput = z.infer<typeof updateGrocerySchema>;
export type DuplicateDetectionInput = z.infer<typeof duplicateDetectionSchema>;
export type MergeDuplicatesInput = z.infer<typeof mergeDuplicatesSchema>;
