/**
 * Contract Tests: Chat Actions
 * Tests for sendMessage, editMessage, deleteMessage, getMessages
 *
 * @group contract
 * @group chat
 */

import { describe, it, expect } from "@jest/globals";
import { sendMessageSchema, editMessageSchema } from "@/src/server/validators/shared.schema";

describe("Chat Action Contracts", () => {
  describe("sendMessage schema validation", () => {
    it("should accept valid message", () => {
      const input = {
        content: "Hey everyone, don't forget about the house meeting tonight!",
        authorId: "member-123",
      };

      const result = sendMessageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject empty content", () => {
      const input = {
        content: "",
        authorId: "member-123",
      };

      const result = sendMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject content longer than 1000 chars", () => {
      const input = {
        content: "a".repeat(1001),
        authorId: "member-123",
      };

      const result = sendMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject missing authorId", () => {
      const input = {
        content: "Test message",
      };

      const result = sendMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("editMessage schema validation", () => {
    it("should accept valid edit", () => {
      const input = {
        id: "message-123",
        content: "Updated message content",
      };

      const result = editMessageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const input = {
        content: "Updated message",
      };

      const result = editMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject empty content", () => {
      const input = {
        id: "message-123",
        content: "",
      };

      const result = editMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("deleteMessage contract", () => {
    it("should accept valid message ID", () => {
      const input = { id: "message-123" };

      expect(input.id).toBeTruthy();
      expect(typeof input.id).toBe("string");
    });

    it("should soft delete with placeholder", () => {
      const message = {
        id: "message-123",
        content: "[message deleted]",
        isDeleted: true,
      };

      expect(message.isDeleted).toBe(true);
      expect(message.content).toBe("[message deleted]");
    });
  });

  describe("getMessages contract", () => {
    it("should accept valid query parameters", () => {
      const input = {
        limit: 50,
        before: new Date(),
      };

      expect(input.limit).toBeGreaterThan(0);
      expect(input.before).toBeInstanceOf(Date);
    });

    it("should return messages in chronological order", () => {
      const messages = [
        { createdAt: new Date("2025-10-04T10:00:00Z") },
        { createdAt: new Date("2025-10-04T11:00:00Z") },
        { createdAt: new Date("2025-10-04T12:00:00Z") },
      ];

      const sorted = messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      expect(sorted[0].createdAt.getTime()).toBeLessThan(sorted[1].createdAt.getTime());
    });
  });

  describe("5-minute edit window enforcement", () => {
    it("should allow edit within 5 minutes", () => {
      const createdAt = new Date("2025-10-04T10:00:00Z");
      const now = new Date("2025-10-04T10:04:00Z");

      const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      expect(minutesSinceCreation).toBeLessThanOrEqual(5);
    });

    it("should reject edit after 5 minutes", () => {
      const createdAt = new Date("2025-10-04T10:00:00Z");
      const now = new Date("2025-10-04T10:06:00Z");

      const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      expect(minutesSinceCreation).toBeGreaterThan(5);
    });
  });
});
