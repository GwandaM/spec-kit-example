/**
 * Expense Zod Schemas
 * Covers: Expense, ExpenseParticipant, Balance
 */

import { z } from "zod";

/**
 * ExpenseParticipant Schema
 */
export const expenseParticipantSchema = z.object({
  memberId: z.string().uuid(),
  amount: z.number().positive().multipleOf(0.01), // 2 decimal places
  percentage: z.number().min(0).max(100).nullable(),
});

/**
 * Expense Schema
 * Validation rules from data-model.md
 */
export const expenseSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1).max(200),
  amount: z.number().positive().multipleOf(0.01), // 2 decimal places
  currency: z.string().length(3, "Must be ISO 4217 code"),
  category: z.string().max(30),
  payerId: z.string().uuid(),
  splitMode: z.enum(["equal", "ratio", "custom"]),
  participants: z.array(expenseParticipantSchema).min(1),
  notes: z.string().max(500).optional(),
  datetime: z.date(),
  createdBy: z.string().uuid(),
  isSettled: z.boolean(),
  settledAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Create Expense Schema with validation
 * Validates that participant amounts sum to total expense amount
 */
export const createExpenseSchema = expenseSchema
  .omit({
    id: true,
    isSettled: true,
    settledAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine(
    (data) => {
      const participantSum = data.participants.reduce((sum, p) => sum + p.amount, 0);
      const tolerance = 0.01;
      return Math.abs(participantSum - data.amount) < tolerance;
    },
    {
      message: "Participant amounts must sum to total expense amount (within 0.01 tolerance)",
      path: ["participants"],
    }
  )
  .refine(
    (data) => {
      // Payer must be in participants
      return data.participants.some((p) => p.memberId === data.payerId);
    },
    {
      message: "Payer must be included in participants",
      path: ["payerId"],
    }
  );

/**
 * Update Expense Schema
 * Can only update unsettled expenses
 */
export const updateExpenseSchema = expenseSchema
  .omit({
    id: true,
    createdBy: true,
    createdAt: true,
    updatedAt: true,
    isSettled: true,
    settledAt: true,
  })
  .partial()
  .refine(
    (data) => {
      if (!data.participants || !data.amount) return true;
      const participantSum = data.participants.reduce((sum, p) => sum + p.amount, 0);
      const tolerance = 0.01;
      return Math.abs(participantSum - data.amount) < tolerance;
    },
    {
      message: "Participant amounts must sum to total expense amount",
      path: ["participants"],
    }
  );

/**
 * Settle Expense Schema
 */
export const settleExpenseSchema = z.object({
  expenseId: z.string().uuid(),
  settledBy: z.string().uuid(),
});

/**
 * Balance Schema (derived entity)
 */
export const balanceSchema = z.object({
  fromMemberId: z.string().uuid(),
  toMemberId: z.string().uuid(),
  amount: z.number().positive().multipleOf(0.01),
  currency: z.string().length(3),
});

/**
 * Helper schemas for split mode calculations
 */
export const equalSplitSchema = z.object({
  splitMode: z.literal("equal"),
  amount: z.number().positive(),
  memberIds: z.array(z.string().uuid()).min(1),
});

export const ratioSplitSchema = z.object({
  splitMode: z.literal("ratio"),
  amount: z.number().positive(),
  memberRatios: z.array(
    z.object({
      memberId: z.string().uuid(),
      ratio: z.number().min(0).max(1),
    })
  ),
});

export const customSplitSchema = z.object({
  splitMode: z.literal("custom"),
  amount: z.number().positive(),
  customAmounts: z.array(
    z.object({
      memberId: z.string().uuid(),
      amount: z.number().positive(),
    })
  ),
});

/**
 * Type inference helpers
 */
export type Expense = z.infer<typeof expenseSchema>;
export type ExpenseParticipant = z.infer<typeof expenseParticipantSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type SettleExpenseInput = z.infer<typeof settleExpenseSchema>;
export type Balance = z.infer<typeof balanceSchema>;

export type EqualSplitInput = z.infer<typeof equalSplitSchema>;
export type RatioSplitInput = z.infer<typeof ratioSplitSchema>;
export type CustomSplitInput = z.infer<typeof customSplitSchema>;
