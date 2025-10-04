/**
 * Shared Zod Schemas for Flatmate Life Tracker
 * Covers: Member, Note, Reminder, ChatMessage, Settings
 */

import { z } from "zod";

/**
 * Member Schema
 * Validation rules from data-model.md
 */
export const memberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color (#RRGGBB)"),
  shareRatio: z.number().min(0).max(1),
  createdAt: z.date(),
  isActive: z.boolean(),
});

export const createMemberSchema = memberSchema.omit({ id: true, createdAt: true });

export const updateMemberSchema = memberSchema.omit({ id: true, createdAt: true }).partial();

/**
 * Note Schema
 * Validation rules from data-model.md
 */
export const noteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  content: z.string().max(2000),
  type: z.enum(["general", "shoppingList", "reminder"]),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
});

export const createNoteSchema = noteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNoteSchema = noteSchema
  .omit({ id: true, createdBy: true, createdAt: true })
  .partial();

/**
 * Reminder Schema
 * Validation rules from data-model.md
 */
export const reminderSchema = z.object({
  id: z.string().uuid(),
  noteId: z.string().uuid().nullable(),
  description: z.string().min(1).max(200),
  dueDate: z.date(),
  createdBy: z.string().uuid(),
  notifiedAt: z.date().nullable(),
  createdAt: z.date(),
});

export const createReminderSchema = reminderSchema.omit({
  id: true,
  notifiedAt: true,
  createdAt: true,
});

export const updateReminderSchema = reminderSchema
  .omit({ id: true, createdBy: true, createdAt: true })
  .partial();

/**
 * ChatMessage Schema
 * Validation rules from data-model.md
 */
export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(1000),
  authorId: z.string().uuid(),
  createdAt: z.date(),
  editedAt: z.date().nullable(),
  isDeleted: z.boolean(),
});

export const createChatMessageSchema = chatMessageSchema.omit({
  id: true,
  createdAt: true,
  editedAt: true,
  isDeleted: true,
});

export const updateChatMessageSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const sendMessageSchema = createChatMessageSchema;
export const editMessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(1000),
});

/**
 * Settings Schema
 * Validation rules from data-model.md
 */
export const settingsSchema = z.object({
  currency: z.string().length(3, "Must be ISO 4217 code (3 chars)"),
  locale: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/, "Must be BCP 47 locale (e.g., en-US)"),
  theme: z.enum(["light", "dark", "system"]),
  pinHash: z.string(),
  pinSalt: z.string(),
  pinHint: z.string().max(100).nullable(),
  lockTimeout: z.number().min(0).max(1440), // 0-24 hours in minutes
  failedAttempts: z.number().int().min(0),
  lockedUntil: z.date().nullable(),
  dataVersion: z.string().regex(/^\d+\.\d+\.\d+$/, "Must follow semver (e.g., 1.0.0)"),
  retentionPeriod: z.number().int().min(0), // 0 = unlimited
  analyticsConsent: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updateSettingsSchema = settingsSchema
  .omit({ createdAt: true, updatedAt: true })
  .partial();

const pinSchema = z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits");

export const setupPinSchema = z.object({
  pin: pinSchema,
  hint: z.string().max(100).optional(),
});

export const verifyPinSchema = z.object({
  pin: pinSchema,
});

export const changePinSchema = z.object({
  currentPin: pinSchema,
  newPin: pinSchema,
  hint: z.string().max(100).optional(),
});

/**
 * Type inference helpers
 */
export type Member = z.infer<typeof memberSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export type Note = z.infer<typeof noteSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export type Reminder = z.infer<typeof reminderSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>;
export type UpdateChatMessageInput = z.infer<typeof updateChatMessageSchema>;

export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
