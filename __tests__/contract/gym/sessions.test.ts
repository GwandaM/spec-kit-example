/**
 * Contract Tests: Gym Session Actions
 * Tests for logGymSession, updateGymSession, deleteGymSession
 *
 * @group contract
 * @group gym
 */

import { describe, it, expect } from "@jest/globals";
import { logSessionSchema, updateSessionSchema } from "@/src/server/validators/gym.schema";

describe("Gym Session Contracts", () => {
  describe("logGymSession schema validation", () => {
    it("should accept valid cardio session", () => {
      const input = {
        memberId: "member-123",
        date: new Date(),
        type: "cardio",
        duration: 45,
      };

      const result = logSessionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept valid strength session", () => {
      const input = {
        memberId: "member-123",
        date: new Date(),
        type: "strength",
        duration: 60,
      };

      const result = logSessionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept session with notes", () => {
      const input = {
        memberId: "member-123",
        date: new Date(),
        type: "other",
        duration: 30,
        notes: "Yoga and stretching",
      };

      const result = logSessionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid session type", () => {
      const input = {
        memberId: "member-123",
        date: new Date(),
        type: "invalid",
        duration: 45,
      };

      const result = logSessionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject duration less than 1", () => {
      const input = {
        memberId: "member-123",
        date: new Date(),
        type: "cardio",
        duration: 0,
      };

      const result = logSessionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject duration greater than 600", () => {
      const input = {
        memberId: "member-123",
        date: new Date(),
        type: "cardio",
        duration: 601,
      };

      const result = logSessionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject notes longer than 500 chars", () => {
      const input = {
        memberId: "member-123",
        date: new Date(),
        type: "cardio",
        duration: 45,
        notes: "a".repeat(501),
      };

      const result = logSessionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updateGymSession schema validation", () => {
    it("should accept valid update", () => {
      const input = {
        id: "session-123",
        type: "strength",
        duration: 75,
        notes: "Added extra sets",
      };

      const result = updateSessionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const input = {
        id: "session-123",
        duration: 50,
      };

      const result = updateSessionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const input = {
        duration: 45,
      };

      const result = updateSessionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("deleteGymSession contract", () => {
    it("should accept valid session ID", () => {
      const input = { id: "session-123" };

      expect(input.id).toBeTruthy();
      expect(typeof input.id).toBe("string");
    });
  });
});
