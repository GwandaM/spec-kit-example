/**
 * Storage Adapter Interface
 * Provides abstraction over storage implementations (LocalStorage, IndexedDB, etc.)
 * Following repository pattern for swappable storage backends
 */

/**
 * StorageAdapter Interface
 * All methods are async to support future IndexedDB/SQLite implementations
 */
export interface StorageAdapter {
  /**
   * Retrieve a value from storage
   * @param key - Storage key
   * @returns Parsed value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Store a value in storage
   * @param key - Storage key
   * @param value - Value to store (will be JSON serialized)
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove a value from storage
   * @param key - Storage key
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all storage
   */
  clear(): Promise<void>;

  /**
   * Get all keys in storage
   * @returns Array of all storage keys
   */
  keys(): Promise<string[]>;

  /**
   * Check if a key exists in storage
   * @param key - Storage key
   */
  has(key: string): Promise<boolean>;
}

/**
 * Storage Keys - Centralized key definitions
 */
export const STORAGE_KEYS = {
  MEMBERS: "flatmate:members",
  EXPENSES: "flatmate:expenses",
  BALANCES: "flatmate:balances",
  GROCERIES: "flatmate:groceries",
  CHORES: "flatmate:chores",
  CHORE_ASSIGNMENTS: "flatmate:choreAssignments",
  GYM_SESSIONS: "flatmate:gymSessions",
  FITNESS_GOALS: "flatmate:fitnessGoals",
  NOTES: "flatmate:notes",
  REMINDERS: "flatmate:reminders",
  CHAT_MESSAGES: "flatmate:chatMessages",
  SETTINGS: "flatmate:settings",
} as const;

/**
 * Storage Error Types
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "SERIALIZATION_ERROR" | "QUOTA_EXCEEDED" | "UNKNOWN"
  ) {
    super(message);
    this.name = "StorageError";
  }
}

/**
 * Type-safe storage key type
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
