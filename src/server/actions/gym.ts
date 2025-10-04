"use server";

/**
 * Gym Server Actions
 * Handles gym session logging and fitness goal tracking
 */

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import {
  logSessionSchema,
  updateSessionSchema,
  createGoalSchema,
  updateGoalSchema,
} from "@/src/server/validators/gym.schema";
import { STORAGE_KEYS } from "@/lib/storage/adapter";
import { localStorageAdapter as storageAdapter } from "@/lib/storage/local-storage.adapter";
import type { GymSession, FitnessGoal } from "@/lib/types/entities";

/**
 * Log a new gym session
 */
export async function logGymSession(input: unknown) {
  try {
    const validated = logSessionSchema.parse(input);

    const sessions = (await storageAdapter.get<GymSession[]>(STORAGE_KEYS.GYM_SESSIONS)) || [];

    const newSession: GymSession = {
      id: uuidv4(),
      memberId: validated.memberId,
      date: validated.date,
      type: validated.type,
      duration: validated.duration,
      notes: validated.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    sessions.push(newSession);
    await storageAdapter.set(STORAGE_KEYS.GYM_SESSIONS, sessions);

    revalidatePath("/gym");
    revalidatePath("/");

    return { success: true, session: newSession };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to log gym session",
    };
  }
}

/**
 * Update an existing gym session
 */
export async function updateGymSession(input: unknown) {
  try {
    const validated = updateSessionSchema.parse(input);

    const sessions = (await storageAdapter.get<GymSession[]>(STORAGE_KEYS.GYM_SESSIONS)) || [];
    const index = sessions.findIndex((s) => s.id === validated.id);

    if (index === -1) {
      return { success: false, error: "Gym session not found" };
    }

    // Update session
    sessions[index] = {
      ...sessions[index],
      ...(validated.date && { date: validated.date }),
      ...(validated.type && { type: validated.type }),
      ...(validated.duration !== undefined && { duration: validated.duration }),
      ...(validated.notes !== undefined && { notes: validated.notes }),
      updatedAt: new Date(),
    };

    await storageAdapter.set(STORAGE_KEYS.GYM_SESSIONS, sessions);

    revalidatePath("/gym");
    revalidatePath("/");

    return { success: true, session: sessions[index] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update gym session",
    };
  }
}

/**
 * Delete a gym session
 */
export async function deleteGymSession(id: string) {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid session ID" };
    }

    const sessions = (await storageAdapter.get<GymSession[]>(STORAGE_KEYS.GYM_SESSIONS)) || [];
    const filtered = sessions.filter((s) => s.id !== id);

    if (filtered.length === sessions.length) {
      return { success: false, error: "Gym session not found" };
    }

    await storageAdapter.set(STORAGE_KEYS.GYM_SESSIONS, filtered);

    revalidatePath("/gym");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete gym session",
    };
  }
}

/**
 * Create a new fitness goal
 */
export async function createFitnessGoal(input: unknown) {
  try {
    const validated = createGoalSchema.parse(input);

    const goals = (await storageAdapter.get<FitnessGoal[]>(STORAGE_KEYS.FITNESS_GOALS)) || [];

    // Check for existing active goal in the same period
    const hasActiveGoal = goals.some(
      (g) =>
        g.isActive &&
        g.period === validated.period &&
        g.startDate <= validated.endDate &&
        g.endDate >= validated.startDate
    );

    if (hasActiveGoal) {
      return { success: false, error: "An active goal already exists for this period" };
    }

    const newGoal: FitnessGoal = {
      id: uuidv4(),
      description: validated.description,
      targetMetric: validated.targetMetric,
      targetValue: validated.targetValue,
      period: validated.period,
      startDate: validated.startDate,
      endDate: validated.endDate,
      createdAt: new Date(),
      isActive: true,
    };

    goals.push(newGoal);
    await storageAdapter.set(STORAGE_KEYS.FITNESS_GOALS, goals);

    revalidatePath("/gym");
    revalidatePath("/");

    return { success: true, goal: newGoal };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create fitness goal",
    };
  }
}

/**
 * Update an existing fitness goal
 */
export async function updateFitnessGoal(input: unknown) {
  try {
    const validated = updateGoalSchema.parse(input);

    const goals = (await storageAdapter.get<FitnessGoal[]>(STORAGE_KEYS.FITNESS_GOALS)) || [];
    const index = goals.findIndex((g) => g.id === validated.id);

    if (index === -1) {
      return { success: false, error: "Fitness goal not found" };
    }

    // Update goal
    goals[index] = {
      ...goals[index],
      ...(validated.description && { description: validated.description }),
      ...(validated.targetMetric && { targetMetric: validated.targetMetric }),
      ...(validated.targetValue !== undefined && { targetValue: validated.targetValue }),
      ...(validated.period && { period: validated.period }),
      ...(validated.startDate && { startDate: validated.startDate }),
      ...(validated.endDate && { endDate: validated.endDate }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    };

    await storageAdapter.set(STORAGE_KEYS.FITNESS_GOALS, goals);

    revalidatePath("/gym");
    revalidatePath("/");

    return { success: true, goal: goals[index] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update fitness goal",
    };
  }
}

/**
 * Get progress for a fitness goal
 */
export async function getGoalProgress(goalId: string) {
  try {
    if (!goalId || typeof goalId !== "string") {
      return { success: false, error: "Invalid goal ID" };
    }

    const goals = (await storageAdapter.get<FitnessGoal[]>(STORAGE_KEYS.FITNESS_GOALS)) || [];
    const goal = goals.find((g) => g.id === goalId);

    if (!goal) {
      return { success: false, error: "Fitness goal not found" };
    }

    const revivedGoal = reviveGoal(goal);

    const sessions = (await storageAdapter.get<GymSession[]>(STORAGE_KEYS.GYM_SESSIONS)) || [];
    const revivedSessions = sessions.map(reviveSession);

    // Filter sessions within goal date range
    const relevantSessions = revivedSessions.filter(
      (s) => s.date >= revivedGoal.startDate && s.date <= revivedGoal.endDate
    );

    let progress: number;

    if (revivedGoal.targetMetric === "sessionCount") {
      progress = relevantSessions.length;
    } else {
      // totalDuration
      progress = relevantSessions.reduce((sum, s) => sum + s.duration, 0);
    }

    const percentComplete = Math.round((progress / revivedGoal.targetValue) * 100);

    return {
      success: true,
      data: {
        goal: revivedGoal,
        progress,
        targetValue: revivedGoal.targetValue,
        percentComplete,
        isComplete: progress >= revivedGoal.targetValue,
        sessionsCount: relevantSessions.length,
        totalDuration: relevantSessions.reduce((sum, s) => sum + s.duration, 0),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get goal progress",
    };
  }
}

const reviveSession = (session: GymSession): GymSession => ({
  ...session,
  date: new Date(session.date),
  createdAt: new Date(session.createdAt),
  updatedAt: new Date(session.updatedAt),
});

const reviveGoal = (goal: FitnessGoal): FitnessGoal => ({
  ...goal,
  startDate: new Date(goal.startDate),
  endDate: new Date(goal.endDate),
  createdAt: new Date(goal.createdAt),
});

export async function listGymSessions(memberId?: string): Promise<GymSession[]> {
  const sessions = (await storageAdapter.get<GymSession[]>(STORAGE_KEYS.GYM_SESSIONS)) || [];
  const revived = sessions.map(reviveSession);
  const filtered = memberId ? revived.filter((session) => session.memberId === memberId) : revived;
  return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function listFitnessGoals(
  options: { activeOnly?: boolean } = {}
): Promise<FitnessGoal[]> {
  const goals = (await storageAdapter.get<FitnessGoal[]>(STORAGE_KEYS.FITNESS_GOALS)) || [];
  const revived = goals.map(reviveGoal);
  return options.activeOnly ? revived.filter((goal) => goal.isActive) : revived;
}
