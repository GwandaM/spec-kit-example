# Server Actions Contracts

This directory contains API contracts for all Server Actions in the Flatmate Life Tracker application.

## Modules

### 1. Expenses (`expenses.contract.md`)
- ✅ `createExpense` - Create new expense with split
- ✅ `updateExpense` - Update unsettled expense
- ✅ `deleteExpense` - Delete expense (creator only)
- ✅ `settleExpense` - Mark expense as settled
- ✅ `flagExpense` - Flag expense for dispute
- ✅ `recalculateBalances` - Recalculate all balances
- ✅ `getExpenseHistory` - Fetch expense history with filters
- ✅ `exportExpenses` - Export expenses to JSON

### 2. Groceries (`groceries.contract.md`)
- `addGrocery` - Add grocery item
- `updateGrocery` - Update grocery item (creator only)
- `removeGrocery` - Remove grocery item
- `flagDuplicate` - Flag potential duplicate
- `mergeDuplicates` - Merge flagged duplicates
- `getGroceryList` - Fetch current grocery list
- `getContributions` - Calculate contributions by member

### 3. Chores (`chores.contract.md`)
- `createChore` - Create recurring chore
- `updateChore` - Update chore details
- `deleteChore` - Delete chore (archive)
- `createChoreAssignment` - Assign chore instance
- `markChoreComplete` - Mark assignment complete
- `rotateChore` - Trigger next rotation
- `overrideAssignment` - Manual assignment override
- `getChoreAssignments` - Fetch current assignments
- `getChoreHistory` - Fetch completion history

### 4. Gym (`gym.contract.md`)
- `logGymSession` - Log workout session
- `updateGymSession` - Update session (creator only)
- `deleteGymSession` - Delete session
- `createFitnessGoal` - Create collective goal
- `updateFitnessGoal` - Update goal
- `getGoalProgress` - Calculate progress
- `getGymHistory` - Fetch session history
- `getGymStats` - Calculate individual stats

### 5. Notes & Reminders (`notes.contract.md`)
- `createNote` - Create shared note
- `updateNote` - Update note (creator only)
- `deleteNote` - Delete note
- `archiveNote` - Archive note
- `createReminder` - Create reminder
- `updateReminder` - Update reminder
- `dismissReminder` - Mark reminder as seen
- `getActiveReminders` - Fetch upcoming reminders

### 6. Chat (`chat.contract.md`)
- `sendMessage` - Post message to board
- `editMessage` - Edit message (author only, within 5 min)
- `deleteMessage` - Soft delete message
- `getMessages` - Fetch message history
- `flagMessage` - Flag message for review

### 7. Auth (`auth.contract.md`)
- `setupPin` - Initial PIN setup
- `verifyPin` - Verify PIN for unlock
- `changePin` - Change existing PIN
- `lockApp` - Manually lock app
- `resetLockout` - Reset failed attempts (after timeout)
- `checkLockStatus` - Check if app is locked

### 8. Settings (`settings.contract.md`)
- `updateSettings` - Update household settings
- `addMember` - Add new flatmate
- `updateMember` - Update member details
- `removeMember` - Remove flatmate (requires settlement)
- `exportData` - Export all data to JSON
- `importData` - Import data from JSON (with validation)
- `migrateData` - Run schema migration

## Shared Patterns

### Input Validation
All actions use Zod schemas from `src/server/validators/`:
```typescript
import { createExpenseSchema } from '@/server/validators/expense.schema'

export async function createExpense(input: unknown) {
  const validated = createExpenseSchema.parse(input)
  // ... implementation
}
```

### Output Format
Consistent success/error format:
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

### Cache Invalidation
Actions that mutate data must invalidate relevant paths:
```typescript
import { revalidatePath } from 'next/cache'

// After mutation
revalidatePath('/expenses')      // List page
revalidatePath('/')              // Dashboard
revalidatePath('/expenses/[id]', 'page') // Detail pages
```

### Error Handling
- Validation errors: Return `{ success: false, error: "Validation message" }`
- Storage errors: Log to error boundary, return generic error
- Not found: Return specific `"Resource not found"` message
- Unauthorized: Return `"Unauthorized"` (for creator-only actions)

## Testing Strategy

### Contract Tests
Each action has unit tests validating:
- Input schema validation
- Output schema validation
- Side effects (cache invalidation, storage calls)
- Error cases

### Integration Tests
Cross-action flows:
- Expense creation → Balance recalculation → Settlement
- Chore creation → Assignment → Rotation
- Gym session → Goal progress update

### E2E Tests
Full user flows via Playwright:
- Complete expense split flow (create, view, settle)
- Chore rotation over multiple cycles
- Data export/import round-trip

## Implementation Checklist

- [ ] Define all Zod schemas in `src/server/validators/`
- [ ] Implement storage adapter interface in `lib/storage/adapter.ts`
- [ ] Implement LocalStorage adapter in `lib/storage/local-storage.adapter.ts`
- [ ] Write contract tests for each action (TDD)
- [ ] Implement actions in `src/server/actions/`
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Verify cache invalidation patterns
- [ ] Document any deviations from contracts

## Notes

- All Server Actions marked with `"use server"` directive
- Storage adapter injected via dependency injection (not imported directly)
- Balance engine and chore rotation logic in `lib/utils/`
- Schema versioning managed by migration service
- Contract files serve as source of truth for API design
