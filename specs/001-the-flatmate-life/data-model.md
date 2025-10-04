# Data Model: Flatmate Life Tracker

**Feature**: 001-the-flatmate-life
**Date**: 2025-10-04
**Version**: 1.0.0

## Overview
This document defines all entities, relationships, and validation rules for the Flatmate Life Tracker application. The data model supports local-first persistence with schema versioning.

## Entity Definitions

### 1. Member
Represents an individual flatmate in the household.

**Fields**:
- `id`: `string` (UUID) - Unique identifier
- `name`: `string` (1-50 chars) - Display name
- `color`: `string` (hex color) - Visual identifier for UI
- `shareRatio`: `number` (0-1) - Default expense split ratio (e.g., 0.5 = 50%)
- `createdAt`: `Date` - When member was added
- `isActive`: `boolean` - False if removed from household

**Validation Rules**:
- Name required, unique within household
- Color must be valid hex (#RRGGBB)
- Share ratio >= 0, <= 1
- Max 12 active members per household

**Relationships**:
- One-to-many with Expense (as payer)
- One-to-many with GroceryItem (as purchaser)
- One-to-many with ChoreAssignment (as assignee)
- One-to-many with GymSession (as logger)
- Many-to-many with Expense (as participant)

---

### 2. Expense
Represents a financial transaction (household bill or casual cost).

**Fields**:
- `id`: `string` (UUID)
- `description`: `string` (1-200 chars)
- `amount`: `number` - Total amount (positive, 2 decimals)
- `currency`: `string` - ISO 4217 code (e.g., "USD", "EUR")
- `category`: `"Bills" | "Groceries" | "Takeout" | "Entertainment" | "Other" | string` - Predefined or custom
- `payerId`: `string` - Member who paid
- `splitMode`: `"equal" | "ratio" | "custom"`
- `participants`: `ExpenseParticipant[]` - Array of participant splits
- `notes`: `string` (0-500 chars, optional)
- `datetime`: `Date` - When expense occurred
- `createdBy`: `string` - Member ID who created entry
- `isSettled`: `boolean` - Whether marked as paid/settled
- `settledAt`: `Date | null` - When settled
- `createdAt`: `Date`
- `updatedAt`: `Date`

**Nested Type: ExpenseParticipant**:
- `memberId`: `string`
- `amount`: `number` - Amount owed by this participant
- `percentage`: `number | null` - Percentage if using ratio mode

**Validation Rules**:
- Amount > 0, max 2 decimals
- Payer must be active member
- Participants sum must equal total amount (within 0.01 tolerance)
- Split mode determines participant calculation:
  - `equal`: amount / participant count
  - `ratio`: amount * member.shareRatio (normalized)
  - `custom`: explicit amounts or percentages provided
- Cannot settle if payer is not in participants
- Custom category max 30 chars

**State Transitions**:
- Created → Unsettled (default)
- Unsettled → Settled (via mark as settled action)
- Settled expenses cannot be edited (only viewed/disputed)

**Relationships**:
- Many-to-one with Member (payer)
- Many-to-many with Member (participants)

---

### 3. Balance
Derived entity representing debt between two members.

**Fields**:
- `fromMemberId`: `string` - Member who owes
- `toMemberId`: `string` - Member who is owed
- `amount`: `number` - Amount owed (positive)
- `currency`: `string` - ISO 4217 code

**Validation Rules**:
- Amount > 0 (zero balances not stored)
- From and to must be different members
- Calculated from unsettled expenses only

**Calculation**:
```
For each expense:
  Payer receives: expense.amount
  Each participant owes: participant.amount

Net balance per member = Σ(paid) - Σ(owed)

Debt simplification:
  Creditors (positive net) ← Debtors (negative net)
  Minimize number of transactions via greedy matching
```

**Note**: Balance is computed on-demand, not stored. Archived in settlement transactions for history.

---

### 4. GroceryItem
Represents a grocery purchase in the shared list.

**Fields**:
- `id`: `string` (UUID)
- `name`: `string` (1-100 chars) - Item name
- `quantity`: `number | null` - Optional quantity
- `unit`: `string | null` - Optional unit (e.g., "kg", "L", "pcs")
- `cost`: `number` - Cost of item (2 decimals)
- `category`: `string` - Category/type (e.g., "Dairy", "Produce", "Snacks")
- `addedBy`: `string` - Member ID who purchased
- `purchasedAt`: `Date` - When purchased
- `createdAt`: `Date`
- `isDuplicate`: `boolean` - Flagged as potential duplicate

**Validation Rules**:
- Name required
- Cost >= 0, max 2 decimals
- Added by must be active member
- Category max 30 chars

**Duplicate Detection**:
- Case-insensitive name similarity >80% (Levenshtein distance)
- Purchased within same 24-hour period
- Flagged for manual review (merge or confirm separate)

**Relationships**:
- Many-to-one with Member (purchaser)

---

### 5. Chore
Represents a recurring household task template.

**Fields**:
- `id`: `string` (UUID)
- `name`: `string` (1-100 chars) - Chore name
- `cadence`: `"daily" | "weekly" | "biweekly" | "monthly" | string` - Frequency (preset or cron-like)
- `rotationSequence`: `string[]` - Ordered array of member IDs
- `currentIndex`: `number` - Current position in rotation
- `createdAt`: `Date`
- `isActive`: `boolean` - False if archived

**Validation Rules**:
- Name required
- Rotation sequence must contain at least 1 active member
- Current index >= 0, < rotation sequence length

**Rotation Logic**:
- On completion: `currentIndex = (currentIndex + 1) % rotationSequence.length`
- Manual override: Set `currentIndex` directly
- Skip member: Increment index without creating assignment

**Relationships**:
- One-to-many with ChoreAssignment

---

### 6. ChoreAssignment
Represents a specific instance of a chore assigned to a member.

**Fields**:
- `id`: `string` (UUID)
- `choreId`: `string` - Parent chore
- `assignedTo`: `string` - Member ID
- `dueDate`: `Date` - When chore is due
- `completedAt`: `Date | null` - When marked complete
- `completedBy`: `string | null` - Member who completed (may differ from assignee)
- `isDisputed`: `boolean` - Flagged for review
- `createdAt`: `Date`

**Validation Rules**:
- Assigned to must be active member
- Due date >= created date
- Completed by must be member (if completed)

**State Transitions**:
- Created → Pending (dueDate in future)
- Pending → Overdue (dueDate in past, not completed)
- Pending/Overdue → Completed (completedAt set)
- Any → Disputed (flagged by another member)

**Relationships**:
- Many-to-one with Chore
- Many-to-one with Member (assignee)

---

### 7. GymSession
Represents a workout logged by a member.

**Fields**:
- `id`: `string` (UUID)
- `memberId`: `string` - Who logged the session
- `date`: `Date` - Session date (can be backdated)
- `type`: `"cardio" | "strength" | "other"` - Session type
- `duration`: `number` - Duration in minutes (1-600)
- `notes`: `string | null` - Optional notes (0-500 chars)
- `createdAt`: `Date`
- `updatedAt`: `Date`

**Validation Rules**:
- Member ID must be active member
- Date cannot be future
- Duration > 0, <= 600 minutes (10 hours)
- Type must be one of enum values

**Relationships**:
- Many-to-one with Member
- Contributes to FitnessGoal progress

---

### 8. FitnessGoal
Represents a collective fitness target for the household.

**Fields**:
- `id`: `string` (UUID)
- `description`: `string` (1-200 chars) - Goal description
- `targetMetric`: `"sessionCount" | "totalDuration"` - What to track
- `targetValue`: `number` - Target to achieve
- `period`: `"week" | "month" | "custom"` - Time period
- `startDate`: `Date`
- `endDate`: `Date`
- `createdAt`: `Date`
- `isActive`: `boolean`

**Validation Rules**:
- Target value > 0
- End date > start date
- Only one active goal per period

**Progress Calculation**:
```
If targetMetric = "sessionCount":
  progress = count of GymSessions where date in [startDate, endDate]
If targetMetric = "totalDuration":
  progress = sum(GymSession.duration) where date in [startDate, endDate]

percentComplete = (progress / targetValue) * 100
```

**Relationships**:
- Aggregates GymSession data for progress

---

### 9. Note
Represents a shared note or reminder.

**Fields**:
- `id`: `string` (UUID)
- `title`: `string` (1-100 chars)
- `content`: `string` (0-2000 chars)
- `type`: `"general" | "shoppingList" | "reminder"` - Note category
- `createdBy`: `string` - Member ID
- `createdAt`: `Date`
- `updatedAt`: `Date`
- `isArchived`: `boolean`

**Validation Rules**:
- Title required
- Created by must be active member
- Shopping list type uses special content format (JSON array of items)

**Shopping List Format**:
```typescript
// For type = "shoppingList"
content: JSON.stringify([
  { item: "Milk", checked: false },
  { item: "Bread", checked: true }
])
```

**Relationships**:
- Many-to-one with Member (creator)
- One-to-many with Reminder (if type = "reminder")

---

### 10. Reminder
Represents a time-based notification.

**Fields**:
- `id`: `string` (UUID)
- `noteId`: `string | null` - Associated note (optional)
- `description`: `string` (1-200 chars)
- `dueDate`: `Date` - When reminder triggers
- `createdBy`: `string` - Member ID
- `notifiedAt`: `Date | null` - When notification sent
- `createdAt`: `Date`

**Validation Rules**:
- Description required
- Due date >= created date
- Created by must be active member

**Notification Logic**:
- Trigger: 1 day before due date at 9:00 AM (configurable)
- Channels: In-app (always), Email/SMS (if configured)
- Mark notifiedAt when sent

**Relationships**:
- Many-to-one with Note (optional)
- Many-to-one with Member (creator)

---

### 11. ChatMessage
Represents a message on the household chat board.

**Fields**:
- `id`: `string` (UUID)
- `content`: `string` (1-1000 chars)
- `authorId`: `string` - Member ID
- `createdAt`: `Date`
- `editedAt`: `Date | null` - If edited after creation
- `isDeleted`: `boolean` - Soft delete flag

**Validation Rules**:
- Content required (unless deleted)
- Author must be active member
- Deleted messages show "[message deleted]" placeholder

**Relationships**:
- Many-to-one with Member (author)

---

### 12. Settings
Singleton entity for household configuration.

**Fields**:
- `currency`: `string` - ISO 4217 code (e.g., "USD")
- `locale`: `string` - BCP 47 locale (e.g., "en-US")
- `theme`: `"light" | "dark" | "system"` - UI theme
- `pinHash`: `string` - Hashed PIN (PBKDF2)
- `pinSalt`: `string` - Salt for PIN hashing (base64)
- `pinHint`: `string | null` - Optional hint (0-100 chars)
- `lockTimeout`: `number` - Auto-lock timeout in minutes (0 = disabled)
- `failedAttempts`: `number` - Current failed PIN attempts
- `lockedUntil`: `Date | null` - Lockout timestamp
- `dataVersion`: `string` - Schema version (semantic versioning)
- `retentionPeriod`: `number` - Historical data retention in months (0 = unlimited)
- `analyticsConsent`: `boolean` - User consent for analytics
- `createdAt`: `Date`
- `updatedAt`: `Date`

**Validation Rules**:
- Currency must be valid ISO 4217
- Locale must be valid BCP 47
- Lock timeout >= 0, <= 1440 minutes (24 hours)
- Data version follows semver (e.g., "1.0.0")
- Retention period >= 0 (0 = unlimited)

**PIN Management**:
- Hash stored, never raw PIN
- Failed attempts increment on wrong PIN
- Lockout after 5 attempts for 15 minutes (configurable)
- Reset failed attempts on successful unlock

**Relationships**:
- None (singleton)

---

## Relationships Diagram

```
Member (1) ─── (M) Expense (payer)
Member (M) ─── (M) Expense (participants)
Member (1) ─── (M) GroceryItem (purchaser)
Member (1) ─── (M) ChoreAssignment (assignee)
Member (1) ─── (M) GymSession (logger)
Member (1) ─── (M) Note (creator)
Member (1) ─── (M) Reminder (creator)
Member (1) ─── (M) ChatMessage (author)

Chore (1) ─── (M) ChoreAssignment
Note (1) ─── (M) Reminder (optional)

GymSession (M) ─── (1) FitnessGoal (aggregated for progress)
```

## Storage Schema

### LocalStorage Keys
```
flatmate:members          → Member[]
flatmate:expenses         → Expense[]
flatmate:groceries        → GroceryItem[]
flatmate:chores           → Chore[]
flatmate:choreAssignments → ChoreAssignment[]
flatmate:gymSessions      → GymSession[]
flatmate:fitnessGoals     → FitnessGoal[]
flatmate:notes            → Note[]
flatmate:reminders        → Reminder[]
flatmate:chatMessages     → ChatMessage[]
flatmate:settings         → Settings
```

### Schema Versioning
Current version: `1.0.0`

Migration runner applies sequential migrations when version mismatch detected:
```typescript
// Example migration from 1.0.0 → 1.1.0
{
  version: '1.1.0',
  up: (data) => {
    // Add new field to all members
    data.members = data.members.map(m => ({
      ...m,
      newField: defaultValue
    }))
    return data
  }
}
```

## Validation Summary

All entities use Zod schemas defined in `src/server/validators/`:
- `expense.schema.ts` - Expense, ExpenseParticipant
- `grocery.schema.ts` - GroceryItem
- `chore.schema.ts` - Chore, ChoreAssignment
- `gym.schema.ts` - GymSession, FitnessGoal
- `shared.schema.ts` - Member, Note, Reminder, ChatMessage, Settings

Schemas shared between Server Actions (validation) and client forms (type inference).

## Indexing Strategy

LocalStorage is unindexed, but in-memory indexes built on load for performance:
- `memberById`: Map<string, Member>
- `expensesByPayer`: Map<string, Expense[]>
- `choresByMember`: Map<string, ChoreAssignment[]>
- `gymSessionsByMember`: Map<string, GymSession[]>

Rebuild indexes on any mutation via storage adapter.

## Data Size Estimates

Typical household (4 members, 1 year data):
- Members: 4 × 200 bytes = 0.8 KB
- Expenses: 500 × 500 bytes = 250 KB
- Groceries: 1000 × 300 bytes = 300 KB
- Chores: 10 × 200 bytes = 2 KB
- Chore Assignments: 500 × 200 bytes = 100 KB
- Gym Sessions: 400 × 250 bytes = 100 KB
- Notes/Reminders: 50 × 500 bytes = 25 KB
- Chat Messages: 500 × 200 bytes = 100 KB
- **Total**: ~900 KB (well within 5-10 MB LocalStorage limit)

## Export/Import Format

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-10-04T12:00:00Z",
  "household": {
    "members": [...],
    "expenses": [...],
    "groceries": [...],
    "chores": [...],
    "choreAssignments": [...],
    "gymSessions": [...],
    "fitnessGoals": [...],
    "notes": [...],
    "reminders": [...],
    "chatMessages": [...],
    "settings": {...}
  }
}
```

Optional encryption: AES-GCM with user-provided password via Web Crypto API.
