# Expense Server Actions Contract

**Module**: `src/server/actions/expenses.ts`
**Feature**: FR-001 to FR-009b (Expense tracking & balances)

## Actions

### 1. createExpense

Creates a new expense and updates balances.

**Input Schema** (Zod):
```typescript
{
  description: string (min: 1, max: 200),
  amount: number (positive, max 2 decimals),
  currency: string (ISO 4217, e.g., "USD"),
  category: string (enum or custom, max 30 chars),
  payerId: string (UUID),
  splitMode: "equal" | "ratio" | "custom",
  participants: [
    {
      memberId: string (UUID),
      amount?: number (if custom mode),
      percentage?: number (if ratio mode)
    }
  ] (min: 1),
  notes?: string (max: 500 chars),
  datetime: Date (ISO 8601 string)
}
```

**Output Schema** (Zod):
```typescript
{
  success: true,
  expense: Expense,
  balances: Balance[]
} | {
  success: false,
  error: string
}
```

**Side Effects**:
- Creates expense record in LocalStorage via storage adapter
- Recalculates balances for all affected members
- Invalidates cache: `revalidatePath('/expenses')`
- Invalidates cache: `revalidatePath('/')`  (dashboard)

**Validation**:
- Payer must be active member
- All participants must be active members
- Participant amounts must sum to total amount (±0.01 tolerance)
- Split mode logic:
  - `equal`: Automatically divide amount by participant count
  - `ratio`: Use member.shareRatio, normalize if needed
  - `custom`: Require explicit amounts or percentages

**Error Cases**:
- Invalid member ID → `"Invalid member ID"`
- Participant sum mismatch → `"Participant amounts do not sum to total"`
- Negative amount → `"Amount must be positive"`

---

### 2. updateExpense

Updates an existing unsettled expense.

**Input Schema** (Zod):
```typescript
{
  id: string (UUID),
  description?: string (min: 1, max: 200),
  amount?: number (positive, max 2 decimals),
  category?: string,
  splitMode?: "equal" | "ratio" | "custom",
  participants?: [...] (same as createExpense),
  notes?: string (max: 500 chars),
  datetime?: Date
}
```

**Output Schema**:
```typescript
{
  success: true,
  expense: Expense,
  balances: Balance[]
} | {
  success: false,
  error: string
}
```

**Side Effects**:
- Updates expense record
- Recalculates balances
- Invalidates cache: `revalidatePath('/expenses')`
- Invalidates cache: `revalidatePath('/')`

**Validation**:
- Expense must exist and be unsettled
- Only creator can update (enforced by checking createdBy)
- Same validation as createExpense for updated fields

**Error Cases**:
- Expense not found → `"Expense not found"`
- Expense already settled → `"Cannot edit settled expense"`
- Unauthorized → `"Only creator can edit expense"`

---

### 3. deleteExpense

Deletes an expense (soft delete).

**Input Schema**:
```typescript
{
  id: string (UUID),
  memberId: string (UUID, current user)
}
```

**Output Schema**:
```typescript
{
  success: true
} | {
  success: false,
  error: string
}
```

**Side Effects**:
- Removes expense from LocalStorage
- Recalculates balances
- Invalidates cache: `revalidatePath('/expenses')`
- Invalidates cache: `revalidatePath('/')`

**Validation**:
- Expense must exist
- Only creator can delete

**Error Cases**:
- Expense not found → `"Expense not found"`
- Unauthorized → `"Only creator can delete expense"`

---

### 4. settleExpense

Marks an expense as settled, creating offsetting transaction.

**Input Schema**:
```typescript
{
  id: string (UUID)
}
```

**Output Schema**:
```typescript
{
  success: true,
  expense: Expense,
  balances: Balance[]
} | {
  success: false,
  error: string
}
```

**Side Effects**:
- Sets `isSettled = true`, `settledAt = now`
- Creates settlement transaction (offsetting expense with negative amounts)
- Archives from active balance calculations
- Preserves in expense history
- Invalidates cache: `revalidatePath('/expenses')`
- Invalidates cache: `revalidatePath('/')`

**Validation**:
- Expense must exist and be unsettled
- Payer must be in participants (otherwise nothing to settle)

**Error Cases**:
- Expense not found → `"Expense not found"`
- Already settled → `"Expense already settled"`

---

### 5. flagExpense

Flags an expense for dispute/review.

**Input Schema**:
```typescript
{
  id: string (UUID),
  flaggedBy: string (UUID, current user),
  reason?: string (max 200 chars)
}
```

**Output Schema**:
```typescript
{
  success: true
} | {
  success: false,
  error: string
}
```

**Side Effects**:
- Adds flag to expense metadata (separate flags array in storage)
- Invalidates cache: `revalidatePath('/expenses')`

**Validation**:
- Expense must exist
- Cannot flag own expense

**Error Cases**:
- Expense not found → `"Expense not found"`
- Self-flagging → `"Cannot flag own expense"`

---

### 6. recalculateBalances

Recalculates all balances from unsettled expenses (admin utility).

**Input Schema**:
```typescript
{} // No input
```

**Output Schema**:
```typescript
{
  success: true,
  balances: Balance[]
} | {
  success: false,
  error: string
}
```

**Side Effects**:
- Recomputes all balances from scratch
- Applies debt simplification algorithm
- Invalidates cache: `revalidatePath('/')`

**Validation**:
- None (idempotent utility)

**Error Cases**:
- Storage failure → `"Failed to recalculate balances"`

---

### 7. getExpenseHistory

Fetches expense history with filters.

**Input Schema**:
```typescript
{
  filters?: {
    memberId?: string (UUID),
    category?: string,
    startDate?: Date,
    endDate?: Date,
    isSettled?: boolean
  },
  sort?: {
    field: "datetime" | "amount" | "category",
    order: "asc" | "desc"
  },
  limit?: number (max 1000),
  offset?: number
}
```

**Output Schema**:
```typescript
{
  success: true,
  expenses: Expense[],
  total: number
} | {
  success: false,
  error: string
}
```

**Side Effects**:
- None (read-only)

**Validation**:
- Date range valid (start < end)
- Limit <= 1000

**Error Cases**:
- Invalid date range → `"Invalid date range"`

---

### 8. exportExpenses

Exports expense data to JSON.

**Input Schema**:
```typescript
{
  filters?: {
    startDate?: Date,
    endDate?: Date
  }
}
```

**Output Schema**:
```typescript
{
  success: true,
  data: string (JSON),
  filename: string
} | {
  success: false,
  error: string
}
```

**Side Effects**:
- None (read-only)

**Validation**:
- Date range valid

**Error Cases**:
- Storage failure → `"Export failed"`

---

## Test Coverage

### Contract Tests (unit)
- ✅ createExpense: Equal split validation
- ✅ createExpense: Ratio split validation
- ✅ createExpense: Custom split validation
- ✅ createExpense: Participant sum mismatch error
- ✅ updateExpense: Only creator can edit
- ✅ updateExpense: Cannot edit settled expense
- ✅ deleteExpense: Only creator can delete
- ✅ settleExpense: Creates settlement transaction
- ✅ flagExpense: Cannot flag own expense
- ✅ recalculateBalances: Debt simplification

### Integration Tests
- ✅ Full expense flow: Create → Update → Settle
- ✅ Balance calculation accuracy (multi-member scenario)
- ✅ Concurrent expense creation (race condition handling)

## Implementation Notes

- All actions use `"use server"` directive
- Input validated with Zod schemas from `src/server/validators/expense.schema.ts`
- Storage adapter injected via `lib/storage/adapter.ts`
- Balance engine in `lib/utils/balance-engine.ts`
- Cache invalidation uses Next.js `revalidatePath`
