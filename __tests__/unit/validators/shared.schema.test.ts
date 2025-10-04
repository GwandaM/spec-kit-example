/**
 * Unit tests for shared Zod schemas
 * T011: Contract tests for Member, Note, Reminder, ChatMessage, Settings schemas
 */

import { describe, it, expect } from "@jest/globals";
import {
  memberSchema,
  createMemberSchema,
  updateMemberSchema,
  noteSchema,
  createNoteSchema,
  updateNoteSchema,
  reminderSchema,
  createReminderSchema,
  updateReminderSchema,
  chatMessageSchema,
  createChatMessageSchema,
  updateChatMessageSchema,
  settingsSchema,
  updateSettingsSchema,
  setupPinSchema,
  verifyPinSchema,
  changePinSchema,
} from "@/src/server/validators/shared.schema";

describe("Member Schema", () => {
  const validMember = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "John Doe",
    color: "#FF5733",
    shareRatio: 0.5,
    createdAt: new Date(),
    isActive: true,
  };

  it("should validate a valid member", () => {
    const result = memberSchema.safeParse(validMember);
    expect(result.success).toBe(true);
  });

  it("should reject member with invalid UUID", () => {
    const result = memberSchema.safeParse({ ...validMember, id: "invalid-uuid" });
    expect(result.success).toBe(false);
  });

  it("should reject member with empty name", () => {
    const result = memberSchema.safeParse({ ...validMember, name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject member with name > 50 chars", () => {
    const result = memberSchema.safeParse({
      ...validMember,
      name: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("should reject member with invalid hex color", () => {
    const result = memberSchema.safeParse({ ...validMember, color: "red" });
    expect(result.success).toBe(false);
  });

  it("should reject member with shareRatio < 0", () => {
    const result = memberSchema.safeParse({ ...validMember, shareRatio: -0.1 });
    expect(result.success).toBe(false);
  });

  it("should reject member with shareRatio > 1", () => {
    const result = memberSchema.safeParse({ ...validMember, shareRatio: 1.1 });
    expect(result.success).toBe(false);
  });
});

describe("CreateMember Schema", () => {
  it("should validate input without id and createdAt", () => {
    const result = createMemberSchema.safeParse({
      name: "Jane Doe",
      color: "#00FF00",
      shareRatio: 0.33,
      isActive: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("Note Schema", () => {
  const validNote = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Shopping List",
    content: "Milk, Bread, Eggs",
    type: "shoppingList" as const,
    createdBy: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    isArchived: false,
  };

  it("should validate a valid note", () => {
    const result = noteSchema.safeParse(validNote);
    expect(result.success).toBe(true);
  });

  it("should reject note with empty title", () => {
    const result = noteSchema.safeParse({ ...validNote, title: "" });
    expect(result.success).toBe(false);
  });

  it("should reject note with title > 100 chars", () => {
    const result = noteSchema.safeParse({ ...validNote, title: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("should reject note with content > 2000 chars", () => {
    const result = noteSchema.safeParse({ ...validNote, content: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("should reject note with invalid type", () => {
    const result = noteSchema.safeParse({ ...validNote, type: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid note types", () => {
    const types = ["general", "shoppingList", "reminder"];
    types.forEach((type) => {
      const result = noteSchema.safeParse({ ...validNote, type });
      expect(result.success).toBe(true);
    });
  });
});

describe("Reminder Schema", () => {
  const validReminder = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    noteId: "123e4567-e89b-12d3-a456-426614174000",
    description: "Take out the trash",
    dueDate: new Date("2025-12-31"),
    createdBy: "123e4567-e89b-12d3-a456-426614174000",
    notifiedAt: null,
    createdAt: new Date(),
  };

  it("should validate a valid reminder", () => {
    const result = reminderSchema.safeParse(validReminder);
    expect(result.success).toBe(true);
  });

  it("should accept null noteId", () => {
    const result = reminderSchema.safeParse({ ...validReminder, noteId: null });
    expect(result.success).toBe(true);
  });

  it("should reject reminder with empty description", () => {
    const result = reminderSchema.safeParse({ ...validReminder, description: "" });
    expect(result.success).toBe(false);
  });

  it("should reject reminder with description > 200 chars", () => {
    const result = reminderSchema.safeParse({
      ...validReminder,
      description: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("ChatMessage Schema", () => {
  const validMessage = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    content: "Hello everyone!",
    authorId: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    editedAt: null,
    isDeleted: false,
  };

  it("should validate a valid chat message", () => {
    const result = chatMessageSchema.safeParse(validMessage);
    expect(result.success).toBe(true);
  });

  it("should reject message with empty content", () => {
    const result = chatMessageSchema.safeParse({ ...validMessage, content: "" });
    expect(result.success).toBe(false);
  });

  it("should reject message with content > 1000 chars", () => {
    const result = chatMessageSchema.safeParse({
      ...validMessage,
      content: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("should accept editedAt as date", () => {
    const result = chatMessageSchema.safeParse({
      ...validMessage,
      editedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });
});

describe("Settings Schema", () => {
  const validSettings = {
    currency: "USD",
    locale: "en-US",
    theme: "system" as const,
    pinHash: "hashed_pin_value",
    pinSalt: "salt_value",
    pinHint: "My birthday",
    lockTimeout: 30,
    failedAttempts: 0,
    lockedUntil: null,
    dataVersion: "1.0.0",
    retentionPeriod: 365,
    analyticsConsent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should validate valid settings", () => {
    const result = settingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it("should reject currency not 3 chars", () => {
    const result = settingsSchema.safeParse({ ...validSettings, currency: "US" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid locale format", () => {
    const result = settingsSchema.safeParse({ ...validSettings, locale: "en_US" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid theme", () => {
    const result = settingsSchema.safeParse({ ...validSettings, theme: "blue" });
    expect(result.success).toBe(false);
  });

  it("should accept valid themes", () => {
    const themes = ["light", "dark", "system"];
    themes.forEach((theme) => {
      const result = settingsSchema.safeParse({ ...validSettings, theme });
      expect(result.success).toBe(true);
    });
  });

  it("should reject lockTimeout > 1440", () => {
    const result = settingsSchema.safeParse({ ...validSettings, lockTimeout: 1441 });
    expect(result.success).toBe(false);
  });

  it("should reject lockTimeout < 0", () => {
    const result = settingsSchema.safeParse({ ...validSettings, lockTimeout: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject invalid semver format", () => {
    const result = settingsSchema.safeParse({ ...validSettings, dataVersion: "1.0" });
    expect(result.success).toBe(false);
  });

  it("should accept null pinHint", () => {
    const result = settingsSchema.safeParse({ ...validSettings, pinHint: null });
    expect(result.success).toBe(true);
  });
});

describe("PIN Schemas", () => {
  it("should validate 4-digit PIN", () => {
    const result = setupPinSchema.safeParse({ pin: "1234" });
    expect(result.success).toBe(true);
  });

  it("should validate 6-digit PIN", () => {
    const result = setupPinSchema.safeParse({ pin: "123456" });
    expect(result.success).toBe(true);
  });

  it("should reject PIN with < 4 digits", () => {
    const result = setupPinSchema.safeParse({ pin: "123" });
    expect(result.success).toBe(false);
  });

  it("should reject PIN with > 6 digits", () => {
    const result = setupPinSchema.safeParse({ pin: "1234567" });
    expect(result.success).toBe(false);
  });

  it("should reject PIN with non-digits", () => {
    const result = setupPinSchema.safeParse({ pin: "12ab" });
    expect(result.success).toBe(false);
  });

  it("should accept optional hint", () => {
    const result = setupPinSchema.safeParse({ pin: "1234", hint: "My birthday" });
    expect(result.success).toBe(true);
  });

  it("should validate changePinSchema with both PINs", () => {
    const result = changePinSchema.safeParse({
      currentPin: "1234",
      newPin: "5678",
      hint: "New hint",
    });
    expect(result.success).toBe(true);
  });
});
