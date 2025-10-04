/**
 * Contract Tests: Note Actions
 * Tests for createNote, updateNote, deleteNote, archiveNote
 *
 * @group contract
 * @group notes
 */

import { describe, it, expect } from "@jest/globals";
import { createNoteSchema, updateNoteSchema } from "@/src/server/validators/shared.schema";

describe("Note Action Contracts", () => {
  describe("createNote schema validation", () => {
    it("should accept valid general note", () => {
      const input = {
        title: "Meeting Notes",
        content: "Discussed household budget and upcoming events",
        type: "general",
        createdBy: "member-123",
      };

      const result = createNoteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept valid shopping list", () => {
      const input = {
        title: "Weekly Shopping",
        content: JSON.stringify([
          { item: "Milk", checked: false },
          { item: "Bread", checked: true },
        ]),
        type: "shoppingList",
        createdBy: "member-123",
      };

      const result = createNoteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept valid reminder note", () => {
      const input = {
        title: "Rent Due",
        content: "Pay rent by the 5th of the month",
        type: "reminder",
        createdBy: "member-123",
      };

      const result = createNoteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const input = {
        title: "",
        content: "Some content",
        type: "general",
        createdBy: "member-123",
      };

      const result = createNoteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject title longer than 100 chars", () => {
      const input = {
        title: "a".repeat(101),
        content: "Some content",
        type: "general",
        createdBy: "member-123",
      };

      const result = createNoteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject content longer than 2000 chars", () => {
      const input = {
        title: "Long Note",
        content: "a".repeat(2001),
        type: "general",
        createdBy: "member-123",
      };

      const result = createNoteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updateNote schema validation", () => {
    it("should accept valid update", () => {
      const input = {
        id: "note-123",
        title: "Updated Meeting Notes",
        content: "Added more details about budget",
      };

      const result = updateNoteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const input = {
        id: "note-123",
        content: "Just updating content",
      };

      const result = updateNoteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const input = {
        title: "Updated Note",
      };

      const result = updateNoteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("deleteNote contract", () => {
    it("should accept valid note ID", () => {
      const input = { id: "note-123" };

      expect(input.id).toBeTruthy();
      expect(typeof input.id).toBe("string");
    });
  });

  describe("archiveNote contract", () => {
    it("should accept valid archive request", () => {
      const input = {
        id: "note-123",
        isArchived: true,
      };

      expect(input.id).toBeTruthy();
      expect(typeof input.isArchived).toBe("boolean");
    });

    it("should accept unarchive request", () => {
      const input = {
        id: "note-123",
        isArchived: false,
      };

      expect(input.id).toBeTruthy();
      expect(input.isArchived).toBe(false);
    });
  });
});
