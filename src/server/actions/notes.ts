"use server";

/**
 * Notes & Reminders Server Actions
 * Handles shared notes and time-based reminders
 */

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import {
  createNoteSchema,
  updateNoteSchema,
  createReminderSchema,
  updateReminderSchema,
} from "@/src/server/validators/shared.schema";
import { STORAGE_KEYS } from "@/lib/storage/adapter";
import { localStorageAdapter as storageAdapter } from "@/lib/storage/local-storage.adapter";
import type { Note, Reminder } from "@/lib/types/entities";

/**
 * Create a new note
 */
export async function createNote(input: unknown) {
  try {
    const validated = createNoteSchema.parse(input);

    const notes = (await storageAdapter.get<Note[]>(STORAGE_KEYS.NOTES)) || [];

    const newNote: Note = {
      id: uuidv4(),
      title: validated.title,
      content: validated.content,
      type: validated.type,
      createdBy: validated.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
    };

    notes.push(newNote);
    await storageAdapter.set(STORAGE_KEYS.NOTES, notes);

    revalidatePath("/notes");
    revalidatePath("/");

    return { success: true, note: newNote };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create note",
    };
  }
}

/**
 * Update an existing note (creator only)
 */
export async function updateNote(input: unknown) {
  try {
    const validated = updateNoteSchema.parse(input);

    const notes = (await storageAdapter.get<Note[]>(STORAGE_KEYS.NOTES)) || [];
    const index = notes.findIndex((n) => n.id === validated.id);

    if (index === -1) {
      return { success: false, error: "Note not found" };
    }

    // Update note
    notes[index] = {
      ...notes[index],
      ...(validated.title && { title: validated.title }),
      ...(validated.content !== undefined && { content: validated.content }),
      ...(validated.type && { type: validated.type }),
      updatedAt: new Date(),
    };

    await storageAdapter.set(STORAGE_KEYS.NOTES, notes);

    revalidatePath("/notes");
    revalidatePath("/");

    return { success: true, note: notes[index] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update note",
    };
  }
}

/**
 * Delete a note
 */
export async function deleteNote(id: string) {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid note ID" };
    }

    const notes = (await storageAdapter.get<Note[]>(STORAGE_KEYS.NOTES)) || [];
    const filtered = notes.filter((n) => n.id !== id);

    if (filtered.length === notes.length) {
      return { success: false, error: "Note not found" };
    }

    await storageAdapter.set(STORAGE_KEYS.NOTES, filtered);

    // Also delete associated reminders
    const reminders = (await storageAdapter.get<Reminder[]>(STORAGE_KEYS.REMINDERS)) || [];
    const filteredReminders = reminders.filter((r) => r.noteId !== id);
    await storageAdapter.set(STORAGE_KEYS.REMINDERS, filteredReminders);

    revalidatePath("/notes");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete note",
    };
  }
}

/**
 * Archive or unarchive a note
 */
export async function archiveNote(id: string, isArchived: boolean) {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid note ID" };
    }

    const notes = (await storageAdapter.get<Note[]>(STORAGE_KEYS.NOTES)) || [];
    const index = notes.findIndex((n) => n.id === id);

    if (index === -1) {
      return { success: false, error: "Note not found" };
    }

    notes[index].isArchived = isArchived;
    notes[index].updatedAt = new Date();

    await storageAdapter.set(STORAGE_KEYS.NOTES, notes);

    revalidatePath("/notes");

    return { success: true, note: notes[index] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive note",
    };
  }
}

/**
 * Create a new reminder
 */
export async function createReminder(input: unknown) {
  try {
    const validated = createReminderSchema.parse(input);

    const reminders = (await storageAdapter.get<Reminder[]>(STORAGE_KEYS.REMINDERS)) || [];

    const newReminder: Reminder = {
      id: uuidv4(),
      noteId: validated.noteId || null,
      description: validated.description,
      dueDate: validated.dueDate,
      createdBy: validated.createdBy,
      notifiedAt: null,
      createdAt: new Date(),
    };

    reminders.push(newReminder);
    await storageAdapter.set(STORAGE_KEYS.REMINDERS, reminders);

    revalidatePath("/notes");
    revalidatePath("/");

    return { success: true, reminder: newReminder };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create reminder",
    };
  }
}

/**
 * Update an existing reminder
 */
export async function updateReminder(input: unknown) {
  try {
    const validated = updateReminderSchema.parse(input);

    const reminders = (await storageAdapter.get<Reminder[]>(STORAGE_KEYS.REMINDERS)) || [];
    const index = reminders.findIndex((r) => r.id === validated.id);

    if (index === -1) {
      return { success: false, error: "Reminder not found" };
    }

    // Update reminder
    reminders[index] = {
      ...reminders[index],
      ...(validated.noteId !== undefined && { noteId: validated.noteId }),
      ...(validated.description && { description: validated.description }),
      ...(validated.dueDate && { dueDate: validated.dueDate }),
    };

    await storageAdapter.set(STORAGE_KEYS.REMINDERS, reminders);

    revalidatePath("/notes");
    revalidatePath("/");

    return { success: true, reminder: reminders[index] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update reminder",
    };
  }
}

/**
 * Dismiss a reminder (mark as notified)
 */
export async function dismissReminder(id: string) {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid reminder ID" };
    }

    const reminders = (await storageAdapter.get<Reminder[]>(STORAGE_KEYS.REMINDERS)) || [];
    const index = reminders.findIndex((r) => r.id === id);

    if (index === -1) {
      return { success: false, error: "Reminder not found" };
    }

    reminders[index].notifiedAt = new Date();

    await storageAdapter.set(STORAGE_KEYS.REMINDERS, reminders);

    revalidatePath("/notes");

    return { success: true, reminder: reminders[index] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to dismiss reminder",
    };
  }
}

/**
 * Get pending reminders (due within next 24 hours)
 */
export async function getPendingReminders() {
  try {
    const reminders = (await storageAdapter.get<Reminder[]>(STORAGE_KEYS.REMINDERS)) || [];

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const pending = reminders.filter(
      (r) => !r.notifiedAt && r.dueDate >= now && r.dueDate <= tomorrow
    );

    return { success: true, reminders: pending };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get pending reminders",
    };
  }
}
