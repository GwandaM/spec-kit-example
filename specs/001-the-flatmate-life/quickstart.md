# Quickstart Guide: Flatmate Life Tracker

**Feature**: 001-the-flatmate-life
**Purpose**: Integration test scenarios that validate end-to-end user flows
**Target**: Developers setting up the application for the first time

## Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# .env.local
NEXT_PUBLIC_APP_NAME="Flatmate Life Tracker"
NEXT_PUBLIC_DEFAULT_CURRENCY="USD"
NEXT_PUBLIC_DEFAULT_LOCALE="en-US"
```

### 3. Run Development Server
```bash
npm run dev
```

Application runs at `http://localhost:3000`

### 4. First-Run Setup (via UI)
Navigate to `http://localhost:3000/setup` (auto-redirect on first visit)

**Step 1: Create Household**
- Enter household name (e.g., "Apartment 4B")
- Select currency (USD, EUR, GBP, etc.)
- Select locale for date/number formatting

**Step 2: Add Members**
- Add at least 2 members (max 12)
- For each member:
  - Name (e.g., "Alice", "Bob")
  - Color (pick from palette)
  - Default share ratio (0.5 for equal, adjust if needed)

**Step 3: Set PIN**
- Enter 4-digit PIN
- Confirm PIN
- Optionally add hint
- Set auto-lock timeout (default: 15 minutes)

**Step 4: Initial Categories**
- Confirm default expense categories or customize
- Confirm default chore list or customize
- Skip or add initial expenses/chores

## Integration Test Scenarios

These scenarios validate the core user stories from the feature spec. Run through each scenario to verify implementation correctness.

---

### Scenario 1: Split Household Bill Equally
**User Story**: FR-001, FR-003, FR-006 (Split electricity bill equally)

**Steps**:
1. Navigate to `/expenses/new`
2. Fill expense form:
   - Description: "Electricity Bill - October"
   - Amount: 120.00
   - Currency: USD (pre-selected from settings)
   - Category: "Bills"
   - Payer: Alice
   - Split Mode: "Equal"
   - Participants: Alice, Bob (auto-selected all members)
   - Date: Today
3. Submit form
4. Navigate to `/` (dashboard)

**Expected Results**:
- ✅ Expense appears in recent activity
- ✅ Balance dashboard shows:
  - Bob owes Alice $60.00
  - Total: $60.00
- ✅ Expense list shows "Electricity Bill - October" with $120.00

**Validation**:
- Balance calculation: 120 / 2 = 60 per person
- Payer (Alice) paid 120, owes 60 → net +60
- Participant (Bob) paid 0, owes 60 → net -60

---

### Scenario 2: Rotating Cleaning Schedule
**User Story**: FR-015, FR-016, FR-017, FR-018 (Auto-rotate chores with reminders)

**Steps**:
1. Navigate to `/chores`
2. Create new chore:
   - Name: "Clean Kitchen"
   - Cadence: "Weekly" (every Monday)
   - Rotation: Alice → Bob → Alice (round-robin)
3. System auto-assigns first instance to Alice (due next Monday)
4. Fast-forward time to Sunday 9:00 AM (or manually trigger reminder)
5. Check notifications (in-app)
6. Navigate to `/chores`
7. Mark "Clean Kitchen" as complete
8. Verify next assignment

**Expected Results**:
- ✅ Reminder sent 1 day before (Sunday 9 AM for Monday due date)
- ✅ Chore shows "Assigned to: Alice" with due date
- ✅ After completion, next assignment shows "Assigned to: Bob" with next Monday
- ✅ Completion history shows Alice completed on [date]

**Validation**:
- Rotation sequence: `currentIndex` increments from 0 → 1
- Next due date: 7 days after previous (weekly cadence)

---

### Scenario 3: Shared Grocery Tracking
**User Story**: FR-010, FR-011, FR-012 (Log groceries, track contributions)

**Steps**:
1. Navigate to `/groceries`
2. Add grocery item:
   - Name: "Milk"
   - Quantity: 2
   - Unit: "L"
   - Cost: 6.00
   - Category: "Dairy"
   - Purchaser: Bob
   - Date: Today
3. Add another item:
   - Name: "Bread"
   - Cost: 3.50
   - Category: "Bakery"
   - Purchaser: Bob
4. Navigate to `/groceries` contributions view
5. Verify totals

**Expected Results**:
- ✅ Grocery list shows 2 items (Milk, Bread)
- ✅ Each item shows purchaser and cost
- ✅ Contributions by member:
  - Bob: $9.50 (Dairy: $6.00, Bakery: $3.50)
  - Alice: $0.00
- ✅ Total household groceries: $9.50

**Validation**:
- Cost aggregation by category works
- Contribution breakdown by member accurate

---

### Scenario 4: Collective Fitness Goal
**User Story**: FR-024, FR-025 (Set goal, track progress)

**Steps**:
1. Navigate to `/gym`
2. Create fitness goal:
   - Description: "20 gym sessions this month"
   - Target Metric: "Session Count"
   - Target Value: 20
   - Period: "Month" (current month)
3. Log gym session for Alice:
   - Date: Today
   - Type: "Cardio"
   - Duration: 45 minutes
   - Notes: "Treadmill + bike"
4. Log gym session for Bob:
   - Date: Today
   - Type: "Strength"
   - Duration: 60 minutes
5. View goal progress

**Expected Results**:
- ✅ Goal shows "2 / 20 sessions" (10% complete)
- ✅ Progress bar at 10%
- ✅ Individual contributions:
  - Alice: 1 session
  - Bob: 1 session
- ✅ Gym history shows 2 sessions logged today

**Validation**:
- Progress calculation: count sessions within date range
- Individual stats tracked separately

---

### Scenario 5: Event Reminder
**User Story**: FR-030, FR-031 (Create reminder, send notification)

**Steps**:
1. Navigate to `/notes`
2. Create reminder:
   - Description: "Internet bill due"
   - Due Date: Tomorrow
   - Created by: Alice
3. Fast-forward time to today 9:00 AM (or manually trigger)
4. Check notifications

**Expected Results**:
- ✅ In-app notification appears: "Reminder: Internet bill due (due tomorrow)"
- ✅ Notification badge on `/notes` page
- ✅ If email/SMS configured, external notification sent
- ✅ After dismissal, reminder shows "Notified at [timestamp]"

**Validation**:
- Reminder triggered 1 day before due date
- Notification marked as sent

---

### Scenario 6: Chat Board Communication
**User Story**: FR-034, FR-035, FR-036 (Post messages, chronological view)

**Steps**:
1. Navigate to `/chat`
2. Post message as Alice: "Planning a house party this Friday!"
3. Post message as Bob: "Sounds great! What should I bring?"
4. Post message as Alice: "Maybe some drinks?"
5. View chat history

**Expected Results**:
- ✅ Messages appear in chronological order (oldest first or newest first, configurable)
- ✅ Each message shows author name + timestamp
- ✅ Alice can edit/delete her messages (within 5 minutes)
- ✅ Bob cannot edit Alice's messages
- ✅ Message count badge updates

**Validation**:
- Message ordering correct
- Author-only edit/delete enforced

---

### Scenario 7: Unequal Expense Split
**User Story**: FR-004 (Custom split with fixed amounts)

**Steps**:
1. Navigate to `/expenses/new`
2. Fill expense form:
   - Description: "Takeout dinner"
   - Amount: 45.00
   - Payer: Alice
   - Split Mode: "Custom"
   - Participants:
     - Alice: $30.00
     - Bob: $15.00
3. Submit form
4. View balance dashboard

**Expected Results**:
- ✅ Expense shows "Takeout dinner" with $45.00
- ✅ Balance update:
  - Bob owes Alice $75.00 ($60 from previous + $15 from this)
  - (Alice paid $45, owes $30 → net +$15 this expense)

**Validation**:
- Custom split amounts sum to total (30 + 15 = 45)
- Balance accumulates correctly

---

### Scenario 8: Settle Balance
**User Story**: FR-007 (Mark expense as settled, archive from active)

**Steps**:
1. Navigate to `/expenses`
2. Find "Electricity Bill - October" (unsettled)
3. Click "Mark as Settled"
4. Confirm settlement
5. View balance dashboard

**Expected Results**:
- ✅ Expense status changes to "Settled"
- ✅ Settlement transaction created (offsetting entry)
- ✅ Balance dashboard updates:
  - Bob owes Alice $15.00 (only from "Takeout dinner")
  - Electricity bill removed from active balance
- ✅ Expense history still shows both expenses (with "Settled" badge on electricity)

**Validation**:
- Settlement creates offsetting transaction
- Active balance excludes settled expenses
- Historical data preserved

---

### Scenario 9: Duplicate Grocery Detection
**User Story**: FR-013 (Flag potential duplicates)

**Steps**:
1. Navigate to `/groceries`
2. Add grocery item:
   - Name: "milk" (lowercase)
   - Cost: 6.00
   - Purchaser: Alice
3. System flags potential duplicate (similar to "Milk" added earlier)
4. Review flagged items
5. Merge duplicates OR confirm separate

**Expected Results**:
- ✅ Duplicate detection alert: "Similar item 'Milk' already exists"
- ✅ Option to:
  - Merge (combine costs, sum quantities)
  - Keep separate (confirm intentional)
- ✅ If merged: Single entry "Milk" with combined cost
- ✅ If kept separate: Both "Milk" and "milk" listed

**Validation**:
- Levenshtein distance similarity > 80% triggers flag
- Merge logic combines correctly

---

### Scenario 10: PWA Offline Mode
**User Story**: Non-functional requirement (Offline capability)

**Steps**:
1. Open app in browser
2. Navigate through pages (expenses, groceries, chores)
3. Open browser DevTools → Network tab
4. Enable "Offline" mode
5. Navigate to `/expenses`
6. Create new expense (if form pre-loaded)
7. Re-enable network
8. Verify sync

**Expected Results**:
- ✅ App loads from service worker cache (no network requests)
- ✅ Static assets (CSS, JS, images) served from cache
- ✅ LocalStorage data still accessible offline
- ✅ Forms functional (data saved to LocalStorage)
- ✅ On reconnect, no data loss (local-first architecture)

**Validation**:
- Service worker intercepts requests
- Stale-while-revalidate strategy for assets
- LocalStorage independent of network

---

## Development Validation Checklist

After completing quickstart scenarios, verify:

- [ ] All Server Actions have matching contract tests
- [ ] All Zod schemas defined in `src/server/validators/`
- [ ] Storage adapter interface implemented
- [ ] Balance engine produces correct results (unit tests)
- [ ] Chore rotation logic works (integration tests)
- [ ] PIN auth secure (hash stored, rate limiting works)
- [ ] PWA manifest and service worker registered
- [ ] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] Unit tests pass (`npm run test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Bundle size <200KB per page (run `npm run analyze`)
- [ ] Accessibility check (run Lighthouse or axe DevTools)

## Troubleshooting

### LocalStorage Not Persisting
- Check browser privacy settings (disable "Clear on exit")
- Verify storage adapter implementation
- Check DevTools → Application → Local Storage

### Service Worker Not Caching
- Enable "Update on reload" in DevTools → Application → Service Workers
- Clear cache and hard reload
- Verify `next-pwa` config in `next.config.ts`

### Balance Calculation Incorrect
- Check rounding logic (always 2 decimals)
- Verify participant amounts sum to total
- Review debt simplification algorithm in `lib/utils/balance-engine.ts`

### Chore Rotation Skipping Members
- Verify rotation sequence matches active members
- Check `currentIndex` bounds (0 <= index < sequence.length)
- Ensure wrap-around logic works

## Next Steps

After completing quickstart:
1. Run full test suite: `npm run test && npm run test:e2e`
2. Deploy preview: `npm run build && npm start`
3. Test PWA install prompt on mobile
4. Review Lighthouse report for performance/accessibility
5. Begin user acceptance testing with real flatmates

## Reference

- Feature Spec: `specs/001-the-flatmate-life/spec.md`
- Data Model: `specs/001-the-flatmate-life/data-model.md`
- Contracts: `specs/001-the-flatmate-life/contracts/`
- Research: `specs/001-the-flatmate-life/research.md`
