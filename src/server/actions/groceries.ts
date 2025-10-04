"use server";

/**
 * Grocery Server Actions
 * Handles shared grocery list management with duplicate detection
 */

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { addGrocerySchema, updateGrocerySchema } from "@/src/server/validators/grocery.schema";
import { localStorageAdapter as storageAdapter } from "@/lib/storage/local-storage.adapter";
import { STORAGE_KEYS } from "@/lib/storage/adapter";
import type { GroceryItem } from "@/lib/types/entities";

/**
 * Add a new grocery item to the shared list
 */
export async function addGrocery(input: unknown) {
  try {
    const validated = addGrocerySchema.parse(input);

    // Get existing groceries
    const groceries = (await storageAdapter.get<GroceryItem[]>(STORAGE_KEYS.GROCERIES)) || [];

    // Check for potential duplicates
    const isDuplicate = checkForDuplicates(validated.name, validated.purchasedAt, groceries);

    const newGrocery: GroceryItem = {
      id: uuidv4(),
      name: validated.name,
      quantity: validated.quantity || null,
      unit: validated.unit || null,
      cost: validated.cost,
      category: validated.category,
      addedBy: validated.addedBy,
      purchasedAt: validated.purchasedAt,
      createdAt: new Date(),
      isDuplicate,
    };

    groceries.push(newGrocery);
    await storageAdapter.set(STORAGE_KEYS.GROCERIES, groceries);

    revalidatePath("/groceries");
    revalidatePath("/");

    return { success: true, grocery: newGrocery };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add grocery item",
    };
  }
}

/**
 * Update an existing grocery item (creator only)
 */
export async function updateGrocery(input: unknown) {
  try {
    const validated = updateGrocerySchema.parse(input);

    const groceries = (await storageAdapter.get<GroceryItem[]>(STORAGE_KEYS.GROCERIES)) || [];
    const index = groceries.findIndex((g) => g.id === validated.id);

    if (index === -1) {
      return { success: false, error: "Grocery item not found" };
    }

    // Update grocery item
    groceries[index] = {
      ...groceries[index],
      ...(validated.name && { name: validated.name }),
      ...(validated.quantity !== undefined && { quantity: validated.quantity }),
      ...(validated.unit !== undefined && { unit: validated.unit }),
      ...(validated.cost !== undefined && { cost: validated.cost }),
      ...(validated.category && { category: validated.category }),
    };

    await storageAdapter.set(STORAGE_KEYS.GROCERIES, groceries);

    revalidatePath("/groceries");
    revalidatePath("/");

    return { success: true, grocery: groceries[index] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update grocery item",
    };
  }
}

/**
 * Remove a grocery item
 */
export async function removeGrocery(id: string) {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid grocery ID" };
    }

    const groceries = (await storageAdapter.get<GroceryItem[]>(STORAGE_KEYS.GROCERIES)) || [];
    const filtered = groceries.filter((g) => g.id !== id);

    if (filtered.length === groceries.length) {
      return { success: false, error: "Grocery item not found" };
    }

    await storageAdapter.set(STORAGE_KEYS.GROCERIES, filtered);

    revalidatePath("/groceries");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove grocery item",
    };
  }
}

const reviveGrocery = (item: GroceryItem): GroceryItem => ({
  ...item,
  purchasedAt: new Date(item.purchasedAt),
  createdAt: new Date(item.createdAt),
});

export async function listGroceries(): Promise<GroceryItem[]> {
  const groceries = (await storageAdapter.get<GroceryItem[]>(STORAGE_KEYS.GROCERIES)) || [];
  return groceries
    .map(reviveGrocery)
    .sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime());
}

/**
 * Get grocery contributions by member or category
 */
export async function getContributions(params: {
  memberId?: string;
  category?: string;
  startDate: Date;
  endDate: Date;
}) {
  try {
    const groceries = (await storageAdapter.get<GroceryItem[]>(STORAGE_KEYS.GROCERIES)) || [];

    // Filter by date range
    let filtered = groceries.filter(
      (g) => g.purchasedAt >= params.startDate && g.purchasedAt <= params.endDate
    );

    // Filter by member if specified
    if (params.memberId) {
      filtered = filtered.filter((g) => g.addedBy === params.memberId);
    }

    // Filter by category if specified
    if (params.category) {
      filtered = filtered.filter((g) => g.category === params.category);
    }

    // Aggregate by member
    const byMember = filtered.reduce(
      (acc, grocery) => {
        if (!acc[grocery.addedBy]) {
          acc[grocery.addedBy] = { count: 0, total: 0, items: [] };
        }
        acc[grocery.addedBy].count++;
        acc[grocery.addedBy].total += grocery.cost;
        acc[grocery.addedBy].items.push(grocery);
        return acc;
      },
      {} as Record<string, { count: number; total: number; items: GroceryItem[] }>
    );

    // Aggregate by category
    const byCategory = filtered.reduce(
      (acc, grocery) => {
        if (!acc[grocery.category]) {
          acc[grocery.category] = { count: 0, total: 0, items: [] };
        }
        acc[grocery.category].count++;
        acc[grocery.category].total += grocery.cost;
        acc[grocery.category].items.push(grocery);
        return acc;
      },
      {} as Record<string, { count: number; total: number; items: GroceryItem[] }>
    );

    return {
      success: true,
      data: {
        byMember,
        byCategory,
        total: filtered.reduce((sum, g) => sum + g.cost, 0),
        count: filtered.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get contributions",
    };
  }
}

/**
 * Flag potential duplicate groceries
 */
export async function flagDuplicate(groceryId1: string, groceryId2: string) {
  try {
    if (!groceryId1 || !groceryId2 || groceryId1 === groceryId2) {
      return { success: false, error: "Invalid grocery IDs" };
    }

    const groceries = (await storageAdapter.get<GroceryItem[]>(STORAGE_KEYS.GROCERIES)) || [];

    const grocery1 = groceries.find((g) => g.id === groceryId1);
    const grocery2 = groceries.find((g) => g.id === groceryId2);

    if (!grocery1 || !grocery2) {
      return { success: false, error: "Grocery items not found" };
    }

    // Update both as duplicates
    grocery1.isDuplicate = true;
    grocery2.isDuplicate = true;

    await storageAdapter.set(STORAGE_KEYS.GROCERIES, groceries);

    revalidatePath("/groceries");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to flag duplicates",
    };
  }
}

/**
 * Merge duplicate groceries
 */
export async function mergeDuplicates(params: {
  primaryId: string;
  duplicateIds: string[];
  combineCosts?: boolean;
}) {
  try {
    if (!params.primaryId || !params.duplicateIds || params.duplicateIds.length === 0) {
      return { success: false, error: "Invalid merge parameters" };
    }

    const groceries = (await storageAdapter.get<GroceryItem[]>(STORAGE_KEYS.GROCERIES)) || [];

    const primary = groceries.find((g) => g.id === params.primaryId);
    if (!primary) {
      return { success: false, error: "Primary grocery item not found" };
    }

    // Find all duplicates
    const duplicates = groceries.filter((g) => params.duplicateIds.includes(g.id));

    if (duplicates.length !== params.duplicateIds.length) {
      return { success: false, error: "Some duplicate items not found" };
    }

    // Combine costs if requested
    if (params.combineCosts) {
      const totalCost = duplicates.reduce((sum, d) => sum + d.cost, primary.cost);
      primary.cost = Math.round(totalCost * 100) / 100; // Round to 2 decimals
    }

    // Remove duplicates
    const filtered = groceries.filter((g) => !params.duplicateIds.includes(g.id));

    // Update primary to not be flagged as duplicate
    primary.isDuplicate = false;

    await storageAdapter.set(STORAGE_KEYS.GROCERIES, filtered);

    revalidatePath("/groceries");

    return { success: true, merged: primary };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to merge duplicates",
    };
  }
}

/**
 * Helper: Check for potential duplicates using Levenshtein distance
 */
function checkForDuplicates(
  name: string,
  purchasedAt: Date,
  existingGroceries: GroceryItem[]
): boolean {
  const threshold = 0.8; // 80% similarity
  const timeWindow = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  for (const grocery of existingGroceries) {
    // Check time window
    const timeDiff = Math.abs(purchasedAt.getTime() - grocery.purchasedAt.getTime());
    if (timeDiff > timeWindow) continue;

    // Check name similarity
    const similarity = calculateSimilarity(name, grocery.name);
    if (similarity > threshold) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;

  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  return 1 - distance / maxLength;
}

/**
 * Calculate Levenshtein distance between two strings
 */
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
