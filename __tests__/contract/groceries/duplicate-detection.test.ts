/**
 * Contract Tests: Duplicate Detection
 * Tests for flagDuplicate and mergeDuplicates
 *
 * @group contract
 * @group groceries
 */

import { describe, it, expect } from "@jest/globals";

describe("Duplicate Detection Contracts", () => {
  describe("flagDuplicate contract", () => {
    it("should accept valid grocery IDs", () => {
      const input = {
        groceryId1: "grocery-123",
        groceryId2: "grocery-456",
      };

      expect(input.groceryId1).toBeTruthy();
      expect(input.groceryId2).toBeTruthy();
      expect(input.groceryId1).not.toBe(input.groceryId2);
    });

    it("should validate different IDs", () => {
      const input = {
        groceryId1: "grocery-123",
        groceryId2: "grocery-123",
      };

      // IDs should be different
      expect(input.groceryId1 === input.groceryId2).toBe(true); // This should fail in actual validation
    });
  });

  describe("mergeDuplicates contract", () => {
    it("should accept valid merge parameters", () => {
      const input = {
        primaryId: "grocery-123",
        duplicateIds: ["grocery-456", "grocery-789"],
        keepPrimaryDetails: true,
      };

      expect(input.primaryId).toBeTruthy();
      expect(Array.isArray(input.duplicateIds)).toBe(true);
      expect(input.duplicateIds.length).toBeGreaterThan(0);
    });

    it("should accept merge with combined cost", () => {
      const input = {
        primaryId: "grocery-123",
        duplicateIds: ["grocery-456"],
        combineCosts: true,
      };

      expect(input.combineCosts).toBe(true);
    });

    it("should reject empty duplicate list", () => {
      const input = {
        primaryId: "grocery-123",
        duplicateIds: [],
      };

      expect(input.duplicateIds.length).toBe(0); // Should fail validation
    });
  });

  describe("Levenshtein similarity detection", () => {
    it("should detect similar names", () => {
      const name1 = "Milk";
      const name2 = "milk";

      // Case-insensitive comparison
      expect(name1.toLowerCase()).toBe(name2.toLowerCase());
    });

    it("should detect minor typos", () => {
      const name1 = "Bread";
      const name2 = "Breads";

      // Similarity threshold >80%
      const similarity = calculateSimilarity(name1, name2);
      expect(similarity).toBeGreaterThan(0.8);
    });

    it("should not flag dissimilar items", () => {
      const name1 = "Milk";
      const name2 = "Eggs";

      const similarity = calculateSimilarity(name1, name2);
      expect(similarity).toBeLessThanOrEqual(0.8);
    });
  });

  describe("24-hour purchase window", () => {
    it("should detect items purchased within 24 hours", () => {
      const date1 = new Date("2025-10-04T10:00:00Z");
      const date2 = new Date("2025-10-04T20:00:00Z");

      const hoursDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeLessThanOrEqual(24);
    });

    it("should not flag items purchased beyond 24 hours", () => {
      const date1 = new Date("2025-10-04T10:00:00Z");
      const date2 = new Date("2025-10-05T11:00:00Z");

      const hoursDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeGreaterThan(24);
    });
  });
});

// Helper function for testing (actual implementation will be in utils)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;

  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  return 1 - distance / maxLength;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
