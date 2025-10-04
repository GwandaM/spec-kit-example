# Tasks: Flatmate Life Tracker

**Feature**: 001-the-flatmate-life
**Input**: Design documents from `/specs/001-the-flatmate-life/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Overview

This document provides a dependency-ordered task list for implementing the Flatmate Life Tracker PWA. All tasks follow TDD principles (tests before implementation) and constitutional requirements (Next.js 15 App Router, type safety, performance-first).

**Total Tasks**: 95
**Estimated Duration**: 10-15 days (with parallelization)
**Parallel Execution**: 45+ tasks can run in parallel (marked [P])

---

## Phase 3.1: Foundation Setup (8 tasks)

### T001 [P] Initialize Next.js 15 project structure
**Path**: Repository root
**Description**: Verify Next.js 15.5.4 with App Router, TypeScript strict mode, and Turbopack configuration
**Actions**:
- Confirm `next.config.ts` has Turbopack enabled
- Verify `tsconfig.json` has strict mode and path aliases (`@/*`)
- Create base `app/` directory structure with layout.tsx
**Dependencies**: None
**Validation**: `npx tsc --noEmit` passes

---

### T002 [P] Install core dependencies
**Path**: `package.json`
**Description**: Install all dependencies declared in plan.md
**Actions**:
```bash
npm install zod@3.x next-intl@3.x zustand@4.x
npm install -D @types/node typescript eslint prettier
```
**Dependencies**: None
**Validation**: `npm install` completes without errors

---

### T003 [P] Setup shadcn/ui base components
**Path**: `components/ui/`
**Description**: Initialize shadcn/ui with Radix UI primitives and Tailwind v4
**Actions**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog form input label select
```
**Dependencies**: None
**Validation**: Components appear in `components/ui/`

---

### T004 [P] Configure linting and formatting
**Path**: `.eslintrc.json`, `.prettierrc`, `.husky/`
**Description**: Setup ESLint, Prettier, Husky, and commitlint
**Actions**:
- Configure ESLint with Next.js and TypeScript rules
- Setup Prettier with consistent formatting
- Install Husky pre-commit hooks
- Configure commitlint for Conventional Commits
**Dependencies**: None
**Validation**: `npm run lint` passes on empty codebase

---

### T005 [P] Configure Tailwind CSS v4
**Path**: `tailwind.config.ts`, `app/globals.css`
**Description**: Setup Tailwind with theme tokens and radix-colors
**Actions**:
- Configure theme with CSS variables for light/dark modes
- Import radix-colors for accessible color scales
- Setup responsive breakpoints
**Dependencies**: None
**Validation**: Build succeeds with Tailwind classes

---

### T006 [P] Setup test infrastructure (Jest + RTL)
**Path**: `jest.config.js`, `__tests__/setup.ts`
**Description**: Configure Jest with React Testing Library and Next.js support
**Actions**:
- Install `@testing-library/react`, `@testing-library/jest-dom`
- Configure Jest for TypeScript and Next.js App Router
- Setup test utilities and custom matchers
**Dependencies**: None
**Validation**: `npm test` runs (with no tests yet)

---

### T007 [P] Setup Playwright for E2E tests
**Path**: `playwright.config.ts`, `__tests__/e2e/`
**Description**: Configure Playwright with PWA testing support
**Actions**:
- Install `@playwright/test`
- Configure browsers (Chromium, Firefox, WebKit)
- Setup base URL and viewport sizes
**Dependencies**: None
**Validation**: `npx playwright test` runs (with no tests yet)

---

### T008 [P] Create base route structure
**Path**: `app/` directory
**Description**: Scaffold all route directories with placeholder pages
**Actions**:
- Create directories: `(dashboard)/`, `expenses/`, `groceries/`, `chores/`, `gym/`, `notes/`, `chat/`, `settings/`, `auth/`, `setup/`, `api/`
- Add placeholder `page.tsx` in each route
- Add `loading.tsx` and `error.tsx` templates
**Dependencies**: T001
**Validation**: All routes render without errors

---

## Phase 3.2: Data Layer & Validation (12 tasks)

### T009 [P] Define shared entity types
**Path**: `lib/types/entities.ts`
**Description**: TypeScript interfaces for all 12 entities from data-model.md
**Actions**:
- Define types: Member, Expense, ExpenseParticipant, Balance, GroceryItem, Chore, ChoreAssignment, GymSession, FitnessGoal, Note, Reminder, ChatMessage, Settings
- Include validation rules as JSDoc comments
**Dependencies**: None
**Validation**: TypeScript compilation succeeds

---

### T010 [P] Create Zod schemas - Shared entities
**Path**: `src/server/validators/shared.schema.ts`
**Description**: Zod schemas for Member, Note, Reminder, ChatMessage, Settings
**Actions**:
- Define schemas with all validation rules from data-model.md
- Export type inference helpers
**Dependencies**: T009
**Validation**: Schema validation unit tests pass (T011)

---

### T011 [P] Unit tests for shared schemas
**Path**: `__tests__/unit/validators/shared.schema.test.ts`
**Description**: Contract tests for shared Zod schemas
**Actions**:
- Test valid inputs pass
- Test invalid inputs fail with correct error messages
- Test edge cases (max lengths, boundary values)
**Dependencies**: T010
**Expected**: All tests fail (TDD - schemas not yet implemented)

---

### T012 [P] Create Zod schemas - Expense
**Path**: `src/server/validators/expense.schema.ts`
**Description**: Zod schemas for Expense and ExpenseParticipant
**Actions**:
- Define createExpenseSchema, updateExpenseSchema
- Include split mode validation logic
- Participant sum validation
**Dependencies**: T009
**Validation**: Schema validation unit tests pass (T013)

---

### T013 [P] Unit tests for expense schemas
**Path**: `__tests__/unit/validators/expense.schema.test.ts`
**Description**: Contract tests for expense Zod schemas
**Actions**:
- Test equal split validation
- Test ratio split validation
- Test custom split validation
- Test participant sum mismatch errors
**Dependencies**: T012
**Expected**: All tests fail initially (TDD)

---

### T014 [P] Create Zod schemas - Grocery
**Path**: `src/server/validators/grocery.schema.ts`
**Description**: Zod schemas for GroceryItem
**Actions**:
- Define addGrocerySchema, updateGrocerySchema
- Include duplicate detection fields
**Dependencies**: T009
**Validation**: Schema validation unit tests pass (T015)

---

### T015 [P] Unit tests for grocery schemas
**Path**: `__tests__/unit/validators/grocery.schema.test.ts`
**Description**: Contract tests for grocery Zod schemas
**Dependencies**: T014
**Expected**: All tests fail initially (TDD)

---

### T016 [P] Create Zod schemas - Chore
**Path**: `src/server/validators/chore.schema.ts`
**Description**: Zod schemas for Chore and ChoreAssignment
**Actions**:
- Define createChoreSchema, updateChoreSchema, createAssignmentSchema
- Rotation sequence validation
**Dependencies**: T009
**Validation**: Schema validation unit tests pass (T017)

---

### T017 [P] Unit tests for chore schemas
**Path**: `__tests__/unit/validators/chore.schema.test.ts`
**Description**: Contract tests for chore Zod schemas
**Dependencies**: T016
**Expected**: All tests fail initially (TDD)

---

### T018 [P] Create Zod schemas - Gym
**Path**: `src/server/validators/gym.schema.ts`
**Description**: Zod schemas for GymSession and FitnessGoal
**Actions**:
- Define logSessionSchema, createGoalSchema
- Duration and date validation
**Dependencies**: T009
**Validation**: Schema validation unit tests pass (T019)

---

### T019 [P] Unit tests for gym schemas
**Path**: `__tests__/unit/validators/gym.schema.test.ts`
**Description**: Contract tests for gym Zod schemas
**Dependencies**: T018
**Expected**: All tests fail initially (TDD)

---

### T020 [P] Implement storage adapter interface
**Path**: `lib/storage/adapter.ts`
**Description**: Define StorageAdapter interface with async methods
**Actions**:
- Define interface: get, set, remove, clear
- Add generic type support
- Document contract
**Dependencies**: None
**Validation**: TypeScript compilation succeeds

---

## Phase 3.3: Core Utilities (8 tasks)

### T021 [P] Unit tests for balance engine
**Path**: `__tests__/unit/utils/balance-engine.test.ts`
**Description**: Tests for debt simplification algorithm
**Actions**:
- Test 2-member scenario (simple debt)
- Test 3-member triangle scenario
- Test debt netting and minimization
- Test rounding edge cases
**Dependencies**: None
**Expected**: All tests fail (TDD)

---

### T022 Implement balance engine
**Path**: `lib/utils/balance-engine.ts`
**Description**: Debt simplification algorithm from research.md
**Actions**:
- Calculate net balance per member
- Separate creditors and debtors
- Greedy matching algorithm
- Round to 2 decimals
**Dependencies**: T021
**Validation**: T021 tests pass

---

### T023 [P] Unit tests for chore rotation
**Path**: `__tests__/unit/utils/chore-rotation.test.ts`
**Description**: Tests for round-robin rotation logic
**Actions**:
- Test sequential assignment
- Test wrap-around at end of list
- Test manual override
- Test skip member scenario
**Dependencies**: None
**Expected**: All tests fail (TDD)

---

### T024 Implement chore rotation logic
**Path**: `lib/utils/chore-rotation.ts`
**Description**: Round-robin rotation with manual override
**Actions**:
- Sequential assignment function
- Next assignee calculation
- Manual override support
**Dependencies**: T023
**Validation**: T023 tests pass

---

### T025 [P] Unit tests for PIN crypto utilities
**Path**: `__tests__/unit/utils/crypto.test.ts`
**Description**: Tests for PBKDF2 PIN hashing
**Actions**:
- Test PIN hashing with salt
- Test verification (correct/incorrect PIN)
- Test salt generation
**Dependencies**: None
**Expected**: All tests fail (TDD)

---

### T026 Implement PIN crypto utilities
**Path**: `lib/utils/crypto.ts`
**Description**: Web Crypto API PIN hashing from research.md
**Actions**:
- Implement hashPin with PBKDF2 (100k iterations)
- Implement verifyPin
- Generate random salt
**Dependencies**: T025
**Validation**: T025 tests pass

---

### T027 [P] Unit tests for i18n formatters
**Path**: `__tests__/unit/utils/formatters.test.ts`
**Description**: Tests for currency and date formatting
**Actions**:
- Test currency formatting (various locales)
- Test date/time formatting
**Dependencies**: None
**Expected**: All tests fail (TDD)

---

### T028 Implement i18n formatters
**Path**: `lib/utils/formatters.ts`
**Description**: Intl API formatters for currency and dates
**Actions**:
- Currency formatter using Intl.NumberFormat
- Date formatter using Intl.DateTimeFormat
**Dependencies**: T027
**Validation**: T027 tests pass

---

## Phase 3.4: Storage Layer (5 tasks)

### T029 [P] Unit tests for LocalStorage adapter
**Path**: `__tests__/unit/storage/local-storage.adapter.test.ts`
**Description**: Tests for LocalStorage adapter implementation
**Actions**:
- Test get/set operations
- Test remove and clear
- Test JSON serialization/deserialization
- Mock localStorage in tests
**Dependencies**: T020
**Expected**: All tests fail (TDD)

---

### T030 Implement LocalStorage adapter
**Path**: `lib/storage/local-storage.adapter.ts`
**Description**: LocalStorage implementation of StorageAdapter
**Actions**:
- Implement async wrappers for localStorage
- JSON serialization with error handling
- Implement all interface methods
**Dependencies**: T020, T029
**Validation**: T029 tests pass

---

### T031 [P] Unit tests for migration service
**Path**: `__tests__/unit/services/migration.service.test.ts`
**Description**: Tests for schema migration runner
**Actions**:
- Test version detection
- Test sequential migration application
- Test rollback on failure
**Dependencies**: None
**Expected**: All tests fail (TDD)

---

### T032 Implement migration service
**Path**: `src/server/services/migration.service.ts`
**Description**: Schema versioning with migration runner
**Actions**:
- Version comparison logic
- Migration chain execution
- Initial schema (v1.0.0)
**Dependencies**: T030, T031
**Validation**: T031 tests pass

---

### T033 [P] Create storage initialization script
**Path**: `lib/storage/init.ts`
**Description**: Initialize LocalStorage with default data
**Actions**:
- Setup default Settings singleton
- Create initial schema version
- Export initialization function
**Dependencies**: T030, T032
**Validation**: First-run setup works

---

## Phase 3.5: Expense Server Actions (10 tasks)

### T034 [P] Contract test: createExpense
**Path**: `__tests__/contract/expenses/create-expense.test.ts`
**Description**: Contract test for createExpense Server Action
**Actions**:
- Test input schema validation (all split modes)
- Test output schema validation
- Test cache invalidation calls
- Test error cases from contract
**Dependencies**: T012
**Expected**: All tests fail (TDD)

---

### T035 Implement createExpense action
**Path**: `src/server/actions/expenses.ts`
**Description**: Create expense with split logic and balance update
**Actions**:
- Validate input with Zod schema
- Calculate participant splits based on mode
- Save via storage adapter
- Trigger balance recalculation
- Invalidate cache paths
**Dependencies**: T022, T030, T034
**Validation**: T034 tests pass

---

### T036 [P] Contract test: updateExpense
**Path**: `__tests__/contract/expenses/update-expense.test.ts`
**Description**: Contract test for updateExpense Server Action
**Dependencies**: T012
**Expected**: All tests fail (TDD)

---

### T037 Implement updateExpense action
**Path**: `src/server/actions/expenses.ts`
**Description**: Update unsettled expense (creator only)
**Dependencies**: T035, T036
**Validation**: T036 tests pass

---

### T038 [P] Contract test: deleteExpense
**Path**: `__tests__/contract/expenses/delete-expense.test.ts`
**Description**: Contract test for deleteExpense Server Action
**Dependencies**: T012
**Expected**: All tests fail (TDD)

---

### T039 Implement deleteExpense action
**Path**: `src/server/actions/expenses.ts`
**Description**: Delete expense with authorization check
**Dependencies**: T035, T038
**Validation**: T038 tests pass

---

### T040 [P] Contract test: settleExpense
**Path**: `__tests__/contract/expenses/settle-expense.test.ts`
**Description**: Contract test for settleExpense Server Action
**Dependencies**: T012
**Expected**: All tests fail (TDD)

---

### T041 Implement settleExpense action
**Path**: `src/server/actions/expenses.ts`
**Description**: Mark expense as settled with offsetting transaction
**Dependencies**: T035, T040
**Validation**: T040 tests pass

---

### T042 [P] Contract test: recalculateBalances
**Path**: `__tests__/contract/expenses/recalculate-balances.test.ts`
**Description**: Contract test for recalculateBalances Server Action
**Dependencies**: T012
**Expected**: All tests fail (TDD)

---

### T043 Implement recalculateBalances action
**Path**: `src/server/actions/expenses.ts`
**Description**: Recalculate all balances from scratch
**Actions**:
- Fetch all unsettled expenses
- Run balance engine
- Update balance cache
**Dependencies**: T022, T035, T042
**Validation**: T042 tests pass

---

## Phase 3.6: Other Server Actions (24 tasks in 6 modules)

### Groceries Module (4 tasks)

### T044 [P] Contract tests: Grocery actions
**Path**: `__tests__/contract/groceries/*.test.ts`
**Description**: Tests for addGrocery, updateGrocery, removeGrocery, getContributions
**Dependencies**: T014
**Expected**: All tests fail (TDD)

---

### T045 Implement grocery Server Actions
**Path**: `src/server/actions/groceries.ts`
**Description**: All 4 grocery actions from contracts/README.md
**Actions**:
- addGrocery with duplicate detection
- updateGrocery (creator only)
- removeGrocery
- getContributions (aggregate by member/category)
**Dependencies**: T030, T044
**Validation**: T044 tests pass

---

### T046 [P] Contract tests: Duplicate detection
**Path**: `__tests__/contract/groceries/duplicate-detection.test.ts`
**Description**: Tests for flagDuplicate and mergeDuplicates
**Dependencies**: T014
**Expected**: All tests fail (TDD)

---

### T047 Implement duplicate detection actions
**Path**: `src/server/actions/groceries.ts`
**Description**: Levenshtein distance similarity detection and merge logic
**Dependencies**: T045, T046
**Validation**: T046 tests pass

---

### Chores Module (6 tasks)

### T048 [P] Contract tests: Chore CRUD actions
**Path**: `__tests__/contract/chores/chore-crud.test.ts`
**Description**: Tests for createChore, updateChore, deleteChore
**Dependencies**: T016
**Expected**: All tests fail (TDD)

---

### T049 Implement chore CRUD actions
**Path**: `src/server/actions/chores.ts`
**Description**: Basic chore management actions
**Dependencies**: T030, T048
**Validation**: T048 tests pass

---

### T050 [P] Contract tests: Chore assignment actions
**Path**: `__tests__/contract/chores/assignments.test.ts`
**Description**: Tests for createChoreAssignment, markChoreComplete, rotateChore
**Dependencies**: T016
**Expected**: All tests fail (TDD)

---

### T051 Implement chore assignment actions
**Path**: `src/server/actions/chores.ts`
**Description**: Assignment creation, completion, and rotation
**Actions**:
- Use chore-rotation.ts utility for rotation logic
- Update currentIndex on completion
**Dependencies**: T024, T049, T050
**Validation**: T050 tests pass

---

### T052 [P] Contract tests: Chore override
**Path**: `__tests__/contract/chores/override.test.ts`
**Description**: Tests for overrideAssignment action
**Dependencies**: T016
**Expected**: All tests fail (TDD)

---

### T053 Implement chore override action
**Path**: `src/server/actions/chores.ts`
**Description**: Manual assignment override without affecting rotation sequence
**Dependencies**: T051, T052
**Validation**: T052 tests pass

---

### Gym Module (4 tasks)

### T054 [P] Contract tests: Gym session actions
**Path**: `__tests__/contract/gym/sessions.test.ts`
**Description**: Tests for logGymSession, updateGymSession, deleteGymSession
**Dependencies**: T018
**Expected**: All tests fail (TDD)

---

### T055 Implement gym session actions
**Path**: `src/server/actions/gym.ts`
**Description**: Gym session CRUD actions
**Dependencies**: T030, T054
**Validation**: T054 tests pass

---

### T056 [P] Contract tests: Fitness goal actions
**Path**: `__tests__/contract/gym/goals.test.ts`
**Description**: Tests for createFitnessGoal, updateFitnessGoal, getGoalProgress
**Dependencies**: T018
**Expected**: All tests fail (TDD)

---

### T057 Implement fitness goal actions
**Path**: `src/server/actions/gym.ts`
**Description**: Goal management and progress calculation
**Actions**:
- Create/update goals
- Calculate progress from sessions within date range
**Dependencies**: T055, T056
**Validation**: T056 tests pass

---

### Notes Module (4 tasks)

### T058 [P] Contract tests: Note actions
**Path**: `__tests__/contract/notes/notes.test.ts`
**Description**: Tests for createNote, updateNote, deleteNote, archiveNote
**Dependencies**: T010
**Expected**: All tests fail (TDD)

---

### T059 Implement note actions
**Path**: `src/server/actions/notes.ts`
**Description**: Note CRUD with creator-only edit
**Dependencies**: T030, T058
**Validation**: T058 tests pass

---

### T060 [P] Contract tests: Reminder actions
**Path**: `__tests__/contract/notes/reminders.test.ts`
**Description**: Tests for createReminder, updateReminder, dismissReminder
**Dependencies**: T010
**Expected**: All tests fail (TDD)

---

### T061 Implement reminder actions
**Path**: `src/server/actions/notes.ts`
**Description**: Reminder CRUD and notification logic
**Dependencies**: T059, T060
**Validation**: T060 tests pass

---

### Chat Module (2 tasks)

### T062 [P] Contract tests: Chat actions
**Path**: `__tests__/contract/chat/messages.test.ts`
**Description**: Tests for sendMessage, editMessage, deleteMessage, getMessages
**Dependencies**: T010
**Expected**: All tests fail (TDD)

---

### T063 Implement chat actions
**Path**: `src/server/actions/chat.ts`
**Description**: Chat board message CRUD with time-limited edits
**Actions**:
- 5-minute edit window enforcement
- Soft delete with placeholder
**Dependencies**: T030, T062
**Validation**: T062 tests pass

---

### Auth Module (4 tasks)

### T064 [P] Contract tests: Auth actions
**Path**: `__tests__/contract/auth/pin.test.ts`
**Description**: Tests for setupPin, verifyPin, changePin, lockApp
**Dependencies**: T010, T026
**Expected**: All tests fail (TDD)

---

### T065 Implement auth actions
**Path**: `src/server/actions/auth.ts`
**Description**: PIN management with rate limiting
**Actions**:
- Use crypto.ts utilities for hashing
- Implement progressive delay on failed attempts
- Lockout after 5 attempts
**Dependencies**: T026, T030, T064
**Validation**: T064 tests pass

---

### Settings Module (not counted - covered in T067)

---

## Phase 3.7: UI Components (15 tasks)

### T066 [P] Shared components: Navigation
**Path**: `components/shared/nav.tsx`
**Description**: Main navigation with mobile menu
**Actions**:
- Bottom nav for mobile (5 main routes)
- Sidebar for desktop
- Active route highlighting
**Dependencies**: T003
**Validation**: Renders correctly on all breakpoints

---

### T067 [P] Shared components: Error boundaries
**Path**: `components/shared/error-boundary.tsx`
**Description**: Reusable error boundary with retry
**Dependencies**: T003
**Validation**: Catches and displays errors

---

### T068 [P] Shared components: Skeleton loaders
**Path**: `components/shared/skeleton-loader.tsx`
**Description**: Loading skeletons for lists and cards
**Dependencies**: T003
**Validation**: Matches actual component dimensions

---

### T069 [P] Expense components: ExpenseList (Server Component)
**Path**: `components/expenses/expense-list.tsx`
**Description**: Server Component for expense list with filters
**Actions**:
- Fetch expenses via Server Action
- Support filtering by category, date, member
- Pagination/virtualization if >100 items
**Dependencies**: T035, T003
**Validation**: Renders with mock data

---

### T070 [P] Expense components: ExpenseForm (Client Component)
**Path**: `components/expenses/expense-form.tsx`
**Description**: Client Component for expense create/edit form
**Actions**:
- Use React Hook Form + Zod validation
- Split mode selector (equal/ratio/custom)
- Participant selection with amount calculation
- Optimistic UI updates
**Dependencies**: T035, T003, T012
**Validation**: Form validation works, submission triggers Server Action

---

### T071 [P] Expense components: BalanceDashboard
**Path**: `components/expenses/balance-dashboard.tsx`
**Description**: Server Component showing current balances
**Actions**:
- Fetch balances from Server Action
- Visual balance cards (who owes whom)
- "Settle" button for each balance
**Dependencies**: T043, T003
**Validation**: Balances displayed correctly

---

### T072 [P] Grocery components
**Path**: `components/groceries/grocery-list.tsx`, `grocery-form.tsx`
**Description**: Grocery list (Server) and form (Client)
**Dependencies**: T045, T003
**Validation**: Add/remove groceries works

---

### T073 [P] Chore components
**Path**: `components/chores/chore-list.tsx`, `chore-card.tsx`
**Description**: Chore list and individual chore cards
**Actions**:
- Show current assignment
- "Complete" button
- Rotation indicator
**Dependencies**: T051, T003
**Validation**: Mark complete triggers rotation

---

### T074 [P] Gym components
**Path**: `components/gym/session-list.tsx`, `session-form.tsx`, `goal-progress.tsx`
**Description**: Gym session list, log form, and goal progress bar
**Dependencies**: T055, T057, T003
**Validation**: Goal progress updates after session log

---

### T075 [P] Notes components
**Path**: `components/notes/note-list.tsx`, `note-form.tsx`
**Description**: Note list and create/edit form
**Dependencies**: T059, T003
**Validation**: Archive functionality works

---

### T076 [P] Chat components
**Path**: `components/chat/message-list.tsx`, `message-input.tsx`
**Description**: Chat message list and input form
**Actions**:
- Chronological message ordering
- Edit/delete buttons (author only)
**Dependencies**: T063, T003
**Validation**: Send message appears instantly (optimistic UI)

---

### T077 [P] Settings components
**Path**: `components/settings/member-manager.tsx`, `data-export.tsx`
**Description**: Member management and data export UI
**Dependencies**: T003
**Validation**: Add/remove members works

---

### T078 [P] Auth components: PIN entry
**Path**: `components/auth/pin-entry.tsx`
**Description**: Client Component for PIN input
**Actions**:
- 4-digit PIN input with masking
- Progressive delay on failed attempts
- Lockout countdown display
**Dependencies**: T065, T003
**Validation**: Rate limiting enforced

---

### T079 [P] Setup wizard components
**Path**: `components/setup/wizard.tsx`
**Description**: Multi-step first-run setup
**Actions**:
- Step 1: Household name, currency, locale
- Step 2: Add members
- Step 3: Set PIN
- Step 4: Initial categories
**Dependencies**: T003
**Validation**: All steps complete without errors

---

### T080 [P] Custom hooks
**Path**: `lib/hooks/use-local-storage.ts`, `use-optimistic-update.ts`, `use-pin-auth.ts`
**Description**: Reusable hooks for client components
**Actions**:
- useLocalStorage for direct access
- useOptimisticUpdate for mutations
- usePinAuth for auth state
**Dependencies**: T030
**Validation**: Hooks work in test components

---

## Phase 3.8: Routes & Pages (10 tasks)

### T081 Root layout and middleware
**Path**: `app/layout.tsx`, middleware (if needed)
**Description**: Root layout with theme provider, i18n, and auth check
**Actions**:
- Wrap with next-intl provider
- Theme provider (light/dark toggle)
- Font configuration (Geist Sans/Mono)
**Dependencies**: T066
**Validation**: All routes inherit layout

---

### T082 Dashboard page
**Path**: `app/(dashboard)/page.tsx`
**Description**: Main dashboard with balances and recent activity
**Actions**:
- Server Component fetching balances
- Recent expense list (last 10)
- Quick action buttons
**Dependencies**: T071, T069
**Validation**: Shows current balances

---

### T083 Expense routes
**Path**: `app/expenses/page.tsx`, `new/page.tsx`, `[id]/page.tsx`
**Description**: Expense list, create, and detail pages
**Actions**:
- List page with filters (Server Component)
- Create page with form (Client Component in form)
- Detail page with edit/delete
**Dependencies**: T069, T070
**Validation**: Full CRUD works

---

### T084 [P] Grocery route
**Path**: `app/groceries/page.tsx`
**Description**: Grocery list page
**Dependencies**: T072
**Validation**: Add/remove groceries

---

### T085 [P] Chore route
**Path**: `app/chores/page.tsx`
**Description**: Chore assignment page
**Dependencies**: T073
**Validation**: Complete chore rotates assignment

---

### T086 [P] Gym route
**Path**: `app/gym/page.tsx`
**Description**: Gym sessions and goals page
**Dependencies**: T074
**Validation**: Log session updates goal progress

---

### T087 [P] Notes route
**Path**: `app/notes/page.tsx`
**Description**: Shared notes and reminders page
**Dependencies**: T075
**Validation**: Create/archive notes

---

### T088 [P] Chat route
**Path**: `app/chat/page.tsx`
**Description**: Chat board page
**Dependencies**: T076
**Validation**: Send/edit messages

---

### T089 Settings routes
**Path**: `app/settings/page.tsx`, `members/page.tsx`, `data/page.tsx`
**Description**: Settings, member management, and data export pages
**Dependencies**: T077
**Validation**: Export/import data works

---

### T090 Auth and setup routes
**Path**: `app/auth/page.tsx`, `auth/setup/page.tsx`, `app/setup/page.tsx`
**Description**: PIN entry gate, PIN setup, and first-run wizard
**Actions**:
- Auth gate redirects if not authenticated
- Setup wizard only on first run
**Dependencies**: T078, T079
**Validation**: PIN lock/unlock works

---

## Phase 3.9: PWA & Integration (5 tasks)

### T091 Configure PWA
**Path**: `next.config.ts`, `public/manifest.json`, service worker
**Description**: Setup next-pwa with Workbox
**Actions**:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})
module.exports = withPWA({ /* next config */ })
```
- Create manifest.json with icons
- Configure caching strategies
**Dependencies**: T001
**Validation**: Service worker registers, offline mode works

---

### T092 [P] Integration test: Expense flow
**Path**: `__tests__/integration/expense-flow.test.ts`
**Description**: Full expense flow (create → update → settle)
**Actions**:
- Create expense
- Verify balance update
- Update expense
- Settle expense
- Verify balance cleared
**Dependencies**: T035-T043
**Validation**: Test passes

---

### T093 [P] Integration test: Chore rotation
**Path**: `__tests__/integration/chore-rotation.test.ts`
**Description**: Chore rotation over multiple cycles
**Actions**:
- Create chore with 3-member rotation
- Complete 10 assignments
- Verify rotation sequence correct
**Dependencies**: T049-T053
**Validation**: Test passes

---

### T094 [P] Integration test: Balance accuracy
**Path**: `__tests__/integration/balance-engine.test.ts`
**Description**: Multi-member balance calculation
**Actions**:
- Create 5 expenses with different splits
- Verify debt simplification
- Test rounding edge cases
**Dependencies**: T022, T035
**Validation**: Test passes

---

### T095 [P] E2E tests: Quickstart scenarios
**Path**: `__tests__/e2e/*.spec.ts`
**Description**: All 10 quickstart scenarios from quickstart.md
**Actions**:
- Scenario 1: Split bill equally
- Scenario 2: Rotating cleaning schedule
- Scenario 3: Shared grocery tracking
- Scenario 4: Collective fitness goal
- Scenario 5: Event reminder
- Scenario 6: Chat board communication
- Scenario 7: Unequal expense split
- Scenario 8: Settle balance
- Scenario 9: Duplicate grocery detection
- Scenario 10: PWA offline mode
**Dependencies**: T081-T090, T091
**Validation**: All scenarios pass

---

## Dependencies Graph

```
Foundation (T001-T008) → Data Layer (T009-T020)
  ↓
Data Layer → Utilities (T021-T028)
  ↓
Utilities + Storage (T029-T033) → Server Actions (T034-T065)
  ↓
Server Actions → UI Components (T066-T080)
  ↓
UI Components → Routes (T081-T090)
  ↓
Routes + PWA (T091) → Integration Tests (T092-T095)
```

**Critical Path**:
T001 → T009 → T012 → T021 → T022 → T030 → T034 → T035 → T069 → T083 → T092

---

## Parallel Execution Examples

### Parallel Batch 1: Foundation (run together)
```bash
# T002-T008 can all run in parallel
Task: Install core dependencies (T002)
Task: Setup shadcn/ui (T003)
Task: Configure linting (T004)
Task: Configure Tailwind (T005)
Task: Setup Jest (T006)
Task: Setup Playwright (T007)
```

### Parallel Batch 2: Zod Schemas (run together after T009)
```bash
# T010-T019 (odd-numbered: tests, even: implementation)
Task: Create shared schemas + tests (T010, T011)
Task: Create expense schemas + tests (T012, T013)
Task: Create grocery schemas + tests (T014, T015)
Task: Create chore schemas + tests (T016, T017)
Task: Create gym schemas + tests (T018, T019)
```

### Parallel Batch 3: Utilities (run together)
```bash
# T021-T027 (tests in parallel)
Task: Balance engine tests (T021)
Task: Chore rotation tests (T023)
Task: PIN crypto tests (T025)
Task: Formatters tests (T027)
```

### Parallel Batch 4: Contract Tests (run together)
```bash
# All contract tests for Server Actions
Task: Expense contract tests (T034, T036, T038, T040, T042)
Task: Grocery contract tests (T044, T046)
Task: Chore contract tests (T048, T050, T052)
Task: Gym contract tests (T054, T056)
Task: Notes contract tests (T058, T060)
Task: Chat contract tests (T062)
Task: Auth contract tests (T064)
```

### Parallel Batch 5: UI Components (run together)
```bash
# T066-T080 (all different files)
Task: Shared components (T066, T067, T068)
Task: Expense components (T069, T070, T071)
Task: Grocery components (T072)
Task: Chore components (T073)
Task: Gym components (T074)
Task: Notes components (T075)
Task: Chat components (T076)
Task: Settings components (T077)
Task: Auth components (T078)
Task: Setup components (T079)
Task: Custom hooks (T080)
```

### Parallel Batch 6: Routes (run together)
```bash
# T084-T089 (independent routes)
Task: Grocery route (T084)
Task: Chore route (T085)
Task: Gym route (T086)
Task: Notes route (T087)
Task: Chat route (T088)
```

### Parallel Batch 7: Final Tests (run together)
```bash
# T092-T095
Task: Expense flow integration test (T092)
Task: Chore rotation integration test (T093)
Task: Balance accuracy integration test (T094)
Task: E2E quickstart tests (T095)
```

---

## Validation Checklist

Before marking the feature complete, verify:

- [ ] All 95 tasks completed
- [ ] All contract tests pass (T034-T064)
- [ ] All integration tests pass (T092-T094)
- [ ] All E2E tests pass (T095)
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Bundle size <200KB per route (check with bundle analyzer)
- [ ] PWA manifest and service worker registered
- [ ] Lighthouse score: Performance >90, Accessibility 100
- [ ] All 12 entities have Zod schemas
- [ ] All Server Actions use "use server" directive
- [ ] All mutations invalidate cache with revalidatePath
- [ ] All routes have loading.tsx and error.tsx
- [ ] PIN auth works (setup, lock, unlock, rate limiting)
- [ ] Balance calculation accurate (debt simplification)
- [ ] Chore rotation works over multiple cycles
- [ ] Offline mode works (service worker caching)
- [ ] Export/import data round-trip successful

---

## Constitutional Compliance

Each task adheres to constitutional principles:

✅ **Next.js 15 App Router**: All routes in `app/`, Server Components default, Server Actions for mutations
✅ **Type Safety**: All actions use Zod validation, strict TypeScript, no `any`
✅ **Component Boundaries**: Server/Client separation clear, `"use client"` only where needed
✅ **Performance**: PPR enabled, Suspense boundaries, <200KB bundles, optimistic UI
✅ **Development Standards**: Error boundaries, loading states, Tailwind-only styling

---

## Notes

- **TDD Strict**: All test tasks (odd-numbered) MUST be completed and MUST FAIL before implementation (even-numbered)
- **Parallel Execution**: 45+ tasks marked [P] can run simultaneously in different files
- **Cache Invalidation**: Every mutation Server Action must call `revalidatePath()` for affected routes
- **Storage Adapter**: All data access goes through adapter (never direct localStorage)
- **Constitutional Gates**: Each task verifies compliance before marking complete

---

**Status**: ✅ Ready for implementation via `/implement` command
**Next Steps**: Run `/implement` to begin task execution, or manually execute tasks in dependency order

---

*Generated from Constitution v1.1.0 - See `.specify/memory/constitution.md`*
