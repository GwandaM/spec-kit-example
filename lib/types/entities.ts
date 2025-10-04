/**
 * Entity Type Definitions for Flatmate Life Tracker
 * Based on data-model.md v1.0.0
 */

/**
 * Member - Represents an individual flatmate in the household
 * @validation Name: 1-50 chars, unique within household
 * @validation Color: valid hex (#RRGGBB)
 * @validation ShareRatio: 0-1
 * @validation Max 12 active members per household
 */
export interface Member {
  id: string; // UUID
  name: string; // 1-50 chars
  color: string; // hex color
  shareRatio: number; // 0-1
  createdAt: Date;
  isActive: boolean;
}

/**
 * ExpenseParticipant - Nested type for Expense splits
 */
export interface ExpenseParticipant {
  memberId: string;
  amount: number; // Amount owed by this participant
  percentage: number | null; // Percentage if using ratio mode
}

/**
 * Expense - Represents a financial transaction
 * @validation Amount: > 0, max 2 decimals
 * @validation Participants sum must equal total amount (within 0.01 tolerance)
 * @validation Custom category max 30 chars
 */
export interface Expense {
  id: string; // UUID
  description: string; // 1-200 chars
  amount: number; // positive, 2 decimals
  currency: string; // ISO 4217 code
  category: "Bills" | "Groceries" | "Takeout" | "Entertainment" | "Other" | string;
  payerId: string; // Member who paid
  splitMode: "equal" | "ratio" | "custom";
  participants: ExpenseParticipant[];
  notes?: string; // 0-500 chars, optional
  datetime: Date; // When expense occurred
  createdBy: string; // Member ID who created entry
  isSettled: boolean;
  settledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Balance - Derived entity representing debt between two members
 * @validation Amount > 0 (zero balances not stored)
 * @validation From and to must be different members
 * @note Calculated from unsettled expenses only
 */
export interface Balance {
  fromMemberId: string; // Member who owes
  toMemberId: string; // Member who is owed
  amount: number; // Amount owed (positive)
  currency: string; // ISO 4217 code
}

/**
 * GroceryItem - Represents a grocery purchase
 * @validation Name required
 * @validation Cost >= 0, max 2 decimals
 * @validation Category max 30 chars
 * @note Duplicate detection: name similarity >80% within same 24-hour period
 */
export interface GroceryItem {
  id: string; // UUID
  name: string; // 1-100 chars
  quantity: number | null; // Optional quantity
  unit: string | null; // Optional unit (kg, L, pcs)
  cost: number; // 2 decimals
  category: string; // Category/type
  addedBy: string; // Member ID who purchased
  purchasedAt: Date;
  createdAt: Date;
  isDuplicate: boolean; // Flagged as potential duplicate
}

/**
 * Chore - Represents a recurring household task template
 * @validation Name required
 * @validation Rotation sequence must contain at least 1 active member
 * @validation Current index >= 0, < rotation sequence length
 */
export interface Chore {
  id: string; // UUID
  name: string; // 1-100 chars
  cadence: "daily" | "weekly" | "biweekly" | "monthly" | string; // Frequency
  rotationSequence: string[]; // Ordered array of member IDs
  currentIndex: number; // Current position in rotation
  createdAt: Date;
  isActive: boolean;
}

/**
 * ChoreAssignment - Represents a specific instance of a chore
 * @validation Assigned to must be active member
 * @validation Due date >= created date
 */
export interface ChoreAssignment {
  id: string; // UUID
  choreId: string; // Parent chore
  assignedTo: string; // Member ID
  dueDate: Date;
  completedAt: Date | null;
  completedBy: string | null; // Member who completed (may differ from assignee)
  isDisputed: boolean;
  createdAt: Date;
}

/**
 * GymSession - Represents a workout logged by a member
 * @validation Date cannot be future
 * @validation Duration > 0, <= 600 minutes (10 hours)
 */
export interface GymSession {
  id: string; // UUID
  memberId: string; // Who logged the session
  date: Date; // Session date (can be backdated)
  type: "cardio" | "strength" | "other";
  duration: number; // Duration in minutes (1-600)
  notes: string | null; // Optional notes (0-500 chars)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FitnessGoal - Represents a collective fitness target
 * @validation Target value > 0
 * @validation End date > start date
 * @validation Only one active goal per period
 */
export interface FitnessGoal {
  id: string; // UUID
  description: string; // 1-200 chars
  targetMetric: "sessionCount" | "totalDuration";
  targetValue: number; // Target to achieve
  period: "week" | "month" | "custom";
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  isActive: boolean;
}

/**
 * Note - Represents a shared note or reminder
 * @validation Title required
 * @validation Shopping list type uses special JSON format
 */
export interface Note {
  id: string; // UUID
  title: string; // 1-100 chars
  content: string; // 0-2000 chars
  type: "general" | "shoppingList" | "reminder";
  createdBy: string; // Member ID
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

/**
 * Reminder - Represents a time-based notification
 * @validation Description required
 * @validation Due date >= created date
 */
export interface Reminder {
  id: string; // UUID
  noteId: string | null; // Associated note (optional)
  description: string; // 1-200 chars
  dueDate: Date;
  createdBy: string; // Member ID
  notifiedAt: Date | null;
  createdAt: Date;
}

/**
 * ChatMessage - Represents a message on the household chat board
 * @validation Content required (unless deleted)
 * @validation Deleted messages show "[message deleted]" placeholder
 */
export interface ChatMessage {
  id: string; // UUID
  content: string; // 1-1000 chars
  authorId: string; // Member ID
  createdAt: Date;
  editedAt: Date | null;
  isDeleted: boolean; // Soft delete flag
}

/**
 * Settings - Singleton entity for household configuration
 * @validation Currency must be valid ISO 4217
 * @validation Locale must be valid BCP 47
 * @validation Lock timeout >= 0, <= 1440 minutes (24 hours)
 * @validation Data version follows semver
 * @validation Retention period >= 0 (0 = unlimited)
 */
export interface Settings {
  currency: string; // ISO 4217 code (e.g., "USD")
  locale: string; // BCP 47 locale (e.g., "en-US")
  theme: "light" | "dark" | "system";
  pinHash: string; // Hashed PIN (PBKDF2)
  pinSalt: string; // Salt for PIN hashing (base64)
  pinHint: string | null; // Optional hint (0-100 chars)
  lockTimeout: number; // Auto-lock timeout in minutes (0 = disabled)
  failedAttempts: number; // Current failed PIN attempts
  lockedUntil: Date | null; // Lockout timestamp
  dataVersion: string; // Schema version (semantic versioning)
  retentionPeriod: number; // Historical data retention in months (0 = unlimited)
  analyticsConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type guards for runtime type checking
 */
export function isMember(obj: unknown): obj is Member {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "color" in obj &&
    "shareRatio" in obj
  );
}

export function isExpense(obj: unknown): obj is Expense {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "amount" in obj &&
    "payerId" in obj &&
    "splitMode" in obj
  );
}
