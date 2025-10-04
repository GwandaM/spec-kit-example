"use server";

/**
 * Chat Server Actions
 * Handles household chat board messages
 */

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { sendMessageSchema, editMessageSchema } from "@/src/server/validators/shared.schema";
import { storageAdapter } from "@/lib/storage/adapter";
import type { ChatMessage } from "@/lib/types/entities";

const EDIT_WINDOW_MINUTES = 5;

/**
 * Send a new message to the chat board
 */
export async function sendMessage(input: unknown) {
  try {
    const validated = sendMessageSchema.parse(input);

    const messages = (await storageAdapter.get<ChatMessage[]>("flatmate:chatMessages")) || [];

    const newMessage: ChatMessage = {
      id: uuidv4(),
      content: validated.content,
      authorId: validated.authorId,
      createdAt: new Date(),
      editedAt: null,
      isDeleted: false,
    };

    messages.push(newMessage);
    await storageAdapter.set("flatmate:chatMessages", messages);

    revalidatePath("/chat");
    revalidatePath("/");

    return { success: true, message: newMessage };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

/**
 * Edit a message (author only, within 5-minute window)
 */
export async function editMessage(input: unknown) {
  try {
    const validated = editMessageSchema.parse(input);

    const messages = (await storageAdapter.get<ChatMessage[]>("flatmate:chatMessages")) || [];
    const index = messages.findIndex((m) => m.id === validated.id);

    if (index === -1) {
      return { success: false, error: "Message not found" };
    }

    const message = messages[index];

    // Check if message is deleted
    if (message.isDeleted) {
      return { success: false, error: "Cannot edit deleted message" };
    }

    // Check 5-minute edit window
    const now = new Date();
    const minutesSinceCreation = (now.getTime() - message.createdAt.getTime()) / (1000 * 60);

    if (minutesSinceCreation > EDIT_WINDOW_MINUTES) {
      return { success: false, error: "Edit window expired (5 minutes)" };
    }

    // Update message
    message.content = validated.content;
    message.editedAt = now;

    await storageAdapter.set("flatmate:chatMessages", messages);

    revalidatePath("/chat");

    return { success: true, message };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to edit message",
    };
  }
}

/**
 * Delete a message (author only, soft delete)
 */
export async function deleteMessage(id: string, authorId: string) {
  try {
    if (!id || typeof id !== "string" || !authorId) {
      return { success: false, error: "Invalid parameters" };
    }

    const messages = (await storageAdapter.get<ChatMessage[]>("flatmate:chatMessages")) || [];
    const index = messages.findIndex((m) => m.id === id);

    if (index === -1) {
      return { success: false, error: "Message not found" };
    }

    const message = messages[index];

    // Verify authorship
    if (message.authorId !== authorId) {
      return { success: false, error: "Unauthorized: only author can delete message" };
    }

    // Soft delete
    message.isDeleted = true;
    message.content = "[message deleted]";
    message.editedAt = new Date();

    await storageAdapter.set("flatmate:chatMessages", messages);

    revalidatePath("/chat");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}

/**
 * Get messages with pagination
 */
export async function getMessages(params?: { limit?: number; before?: Date; after?: Date }) {
  try {
    const messages = (await storageAdapter.get<ChatMessage[]>("flatmate:chatMessages")) || [];

    // Filter by date range if specified
    let filtered = messages;

    if (params?.before) {
      filtered = filtered.filter((m) => m.createdAt < params.before!);
    }

    if (params?.after) {
      filtered = filtered.filter((m) => m.createdAt > params.after!);
    }

    // Sort chronologically (oldest first)
    const sorted = filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Apply limit if specified
    const limited = params?.limit ? sorted.slice(-params.limit) : sorted;

    return {
      success: true,
      messages: limited,
      count: limited.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get messages",
    };
  }
}
