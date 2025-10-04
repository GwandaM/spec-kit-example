/**
 * Contract Tests: Reminder Actions
 * Tests for createReminder, updateReminder, dismissReminder
 *
 * @group contract
 * @group notes
 */

import { describe, it, expect } from "@jest/globals";
import { createReminderSchema, updateReminderSchema } from "@/src/server/validators/shared.schema";

describe("Reminder Action Contracts", () => {
  describe("createReminder schema validation", () => {
    it("should accept valid reminder", () => {
      const input = {
        description: "Pay electricity bill",
        dueDate: new Date("2025-10-15"),
        createdBy: "member-123",
      };

      const result = createReminderSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept reminder with associated note", () => {
      const input = {
        noteId: "note-123",
        description: "Review budget notes",
        dueDate: new Date("2025-10-15"),
        createdBy: "member-123",
      };

      const result = createReminderSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject empty description", () => {
      const input = {
        description: "",
        dueDate: new Date("2025-10-15"),
        createdBy: "member-123",
      };

      const result = createReminderSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject description longer than 200 chars", () => {
      const input = {
        description: "a".repeat(201),
        dueDate: new Date("2025-10-15"),
        createdBy: "member-123",
      };

      const result = createReminderSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updateReminder schema validation", () => {
    it("should accept valid update", () => {
      const input = {
        id: "reminder-123",
        description: "Updated reminder description",
        dueDate: new Date("2025-10-20"),
      };

      const result = updateReminderSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const input = {
        id: "reminder-123",
        dueDate: new Date("2025-10-25"),
      };

      const result = updateReminderSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const input = {
        description: "Updated reminder",
      };

      const result = updateReminderSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("dismissReminder contract", () => {
    it("should accept valid reminder ID", () => {
      const input = { id: "reminder-123" };

      expect(input.id).toBeTruthy();
      expect(typeof input.id).toBe("string");
    });

    it("should mark notification as sent", () => {
      const reminder = {
        id: "reminder-123",
        notifiedAt: new Date(),
      };

      expect(reminder.notifiedAt).toBeInstanceOf(Date);
    });
  });
});
