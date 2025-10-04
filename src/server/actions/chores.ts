"use server";

/**
 * Chore Server Actions
 * Handles rotating cleaning chore assignments
 */

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import {
  createChoreSchema,
  updateChoreSchema,
  createAssignmentSchema,
} from "@/src/server/validators/chore.schema";
import { STORAGE_KEYS } from "@/lib/storage/adapter";
import { localStorageAdapter as storageAdapter } from "@/lib/storage/local-storage.adapter";
import { getNextAssignee } from "@/lib/utils/chore-rotation";
import type { Chore, ChoreAssignment } from "@/lib/types/entities";

/**
 * Create a new chore with rotation sequence
 */
export async function createChore(input: unknown) {
  try {
    const validated = createChoreSchema.parse(input);

    const chores = (await storageAdapter.get<Chore[]>(STORAGE_KEYS.CHORES)) || [];

    const newChore: Chore = {
      id: uuidv4(),
      name: validated.name,
      cadence: validated.cadence,
      rotationSequence: validated.rotationSequence,
      currentIndex: validated.currentIndex ?? 0,
      createdAt: new Date(),
      isActive: validated.isActive ?? true,
    };

    chores.push(newChore);
    await storageAdapter.set(STORAGE_KEYS.CHORES, chores);

    revalidatePath("/chores");
    revalidatePath("/");

    return { success: true, chore: newChore };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create chore",
    };
  }
}

/**
 * Update an existing chore
 */
export async function updateChore(input: unknown) {
  try {
    const validated = updateChoreSchema.parse(input);

    const chores = (await storageAdapter.get<Chore[]>(STORAGE_KEYS.CHORES)) || [];
    const index = chores.findIndex((c) => c.id === validated.id);

    if (index === -1) {
      return { success: false, error: "Chore not found" };
    }

    // Update chore
    chores[index] = {
      ...chores[index],
      ...(validated.name && { name: validated.name }),
      ...(validated.cadence && { cadence: validated.cadence }),
      ...(validated.rotationSequence && { rotationSequence: validated.rotationSequence }),
      ...(validated.currentIndex !== undefined && { currentIndex: validated.currentIndex }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    };

    await storageAdapter.set(STORAGE_KEYS.CHORES, chores);

    revalidatePath("/chores");
    revalidatePath("/");

    return { success: true, chore: chores[index] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update chore",
    };
  }
}

/**
 * Delete a chore (soft delete)
 */
export async function deleteChore(id: string) {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid chore ID" };
    }

    const chores = (await storageAdapter.get<Chore[]>(STORAGE_KEYS.CHORES)) || [];
    const index = chores.findIndex((c) => c.id === id);

    if (index === -1) {
      return { success: false, error: "Chore not found" };
    }

    // Soft delete by marking inactive
    chores[index].isActive = false;

    await storageAdapter.set(STORAGE_KEYS.CHORES, chores);

    revalidatePath("/chores");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete chore",
    };
  }
}

/**
 * Create a chore assignment
 */
export async function createChoreAssignment(input: unknown) {
  try {
    const validated = createAssignmentSchema.parse(input);

    const chores = (await storageAdapter.get<Chore[]>(STORAGE_KEYS.CHORES)) || [];
    const chore = chores.find((c) => c.id === validated.choreId);

    if (!chore) {
      return { success: false, error: "Chore not found" };
    }

    const assignments =
      (await storageAdapter.get<ChoreAssignment[]>(STORAGE_KEYS.CHORE_ASSIGNMENTS)) || [];

    const newAssignment: ChoreAssignment = {
      id: uuidv4(),
      choreId: validated.choreId,
      assignedTo: validated.assignedTo,
      dueDate: validated.dueDate,
      completedAt: null,
      completedBy: null,
      isDisputed: false,
      createdAt: new Date(),
    };

    assignments.push(newAssignment);
    await storageAdapter.set(STORAGE_KEYS.CHORE_ASSIGNMENTS, assignments);

    revalidatePath("/chores");
    revalidatePath("/");

    return { success: true, assignment: newAssignment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create assignment",
    };
  }
}

/**
 * Mark a chore assignment as complete
 */
export async function markChoreComplete(assignmentId: string, completedBy?: string) {
  try {
    if (!assignmentId || typeof assignmentId !== "string") {
      return { success: false, error: "Invalid assignment ID" };
    }

    const assignments =
      (await storageAdapter.get<ChoreAssignment[]>(STORAGE_KEYS.CHORE_ASSIGNMENTS)) || [];
    const index = assignments.findIndex((a) => a.id === assignmentId);

    if (index === -1) {
      return { success: false, error: "Assignment not found" };
    }

    const assignment = assignments[index];

    // Mark as completed
    assignment.completedAt = new Date();
    assignment.completedBy = completedBy || assignment.assignedTo;

    await storageAdapter.set(STORAGE_KEYS.CHORE_ASSIGNMENTS, assignments);

    // Rotate the chore to next assignee
    const rotateResult = await rotateChore(assignment.choreId);
    if (!rotateResult.success) {
      // Rollback completion if rotation fails
      assignment.completedAt = null;
      assignment.completedBy = null;
      await storageAdapter.set(STORAGE_KEYS.CHORE_ASSIGNMENTS, assignments);
      return { success: false, error: "Failed to rotate chore" };
    }

    revalidatePath("/chores");
    revalidatePath("/");

    return { success: true, assignment, nextAssignee: rotateResult.nextAssignee };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark chore complete",
    };
  }
}

/**
 * Rotate chore to next assignee in sequence
 */
export async function rotateChore(choreId: string, skipToIndex?: number) {
  try {
    if (!choreId || typeof choreId !== "string") {
      return { success: false, error: "Invalid chore ID" };
    }

    const chores = (await storageAdapter.get<Chore[]>(STORAGE_KEYS.CHORES)) || [];
    const index = chores.findIndex((c) => c.id === choreId);

    if (index === -1) {
      return { success: false, error: "Chore not found" };
    }

    const chore = chores[index];

    let nextMemberId = chore.rotationSequence[chore.currentIndex];

    if (skipToIndex !== undefined) {
      if (skipToIndex < 0 || skipToIndex >= chore.rotationSequence.length) {
        return { success: false, error: "Invalid rotation index" };
      }
      chore.currentIndex = skipToIndex;
      nextMemberId = chore.rotationSequence[skipToIndex];
    } else {
      const result = getNextAssignee({
        sequence: chore.rotationSequence,
        currentIndex: chore.currentIndex,
      });
      chore.currentIndex = result.nextIndex;
      nextMemberId = result.memberId;
    }

    await storageAdapter.set(STORAGE_KEYS.CHORES, chores);

    revalidatePath("/chores");

    return {
      success: true,
      nextAssignee: nextMemberId,
      currentIndex: chore.currentIndex,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to rotate chore",
    };
  }
}

/**
 * Override a chore assignment without affecting rotation
 */
export async function overrideAssignment(params: {
  assignmentId: string;
  newAssignee: string;
  reason?: string;
}) {
  try {
    if (!params.assignmentId || !params.newAssignee) {
      return { success: false, error: "Invalid override parameters" };
    }

    const assignments =
      (await storageAdapter.get<ChoreAssignment[]>(STORAGE_KEYS.CHORE_ASSIGNMENTS)) || [];
    const index = assignments.findIndex((a) => a.id === params.assignmentId);

    if (index === -1) {
      return { success: false, error: "Assignment not found" };
    }

    const assignment = assignments[index];

    // Prevent override if already completed
    if (assignment.completedAt) {
      return { success: false, error: "Cannot override completed assignment" };
    }

    // Update assignee
    assignment.assignedTo = params.newAssignee;

    await storageAdapter.set(STORAGE_KEYS.CHORE_ASSIGNMENTS, assignments);

    revalidatePath("/chores");

    return { success: true, assignment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to override assignment",
    };
  }
}

const reviveChore = (chore: Chore): Chore => ({
  ...chore,
  createdAt: new Date(chore.createdAt),
});

const reviveAssignment = (assignment: ChoreAssignment): ChoreAssignment => ({
  ...assignment,
  dueDate: new Date(assignment.dueDate),
  completedAt: assignment.completedAt ? new Date(assignment.completedAt) : null,
  createdAt: new Date(assignment.createdAt),
});

export async function listChores(options: { includeInactive?: boolean } = {}): Promise<Chore[]> {
  const chores = (await storageAdapter.get<Chore[]>(STORAGE_KEYS.CHORES)) || [];
  const revived = chores.map(reviveChore);
  return options.includeInactive ? revived : revived.filter((chore) => chore.isActive);
}

export async function listChoreAssignments(choreId?: string): Promise<ChoreAssignment[]> {
  const assignments =
    (await storageAdapter.get<ChoreAssignment[]>(STORAGE_KEYS.CHORE_ASSIGNMENTS)) || [];
  const revived = assignments.map(reviveAssignment);
  const filtered = choreId
    ? revived.filter((assignment) => assignment.choreId === choreId)
    : revived;
  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
