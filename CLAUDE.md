# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Active Feature: Flatmate Life Tracker

A Next.js 15 PWA for managing shared living between flatmates. Features include expense splitting with balance tracking, shared grocery lists, rotating chore assignments, gym session logging with collective goals, notes/reminders, and a household chat board.

**Branch**: `001-the-flatmate-life`
**Status**: Planning complete, ready for implementation

## Commands

### Development
- `npm run dev` - Start development server with Turbopack (default port: 3000)
- `npm run build` - Build production bundle with Turbopack
- `npm start` - Start production server

### Testing (to be added)
- `npm test` - Run Jest unit/integration tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:watch` - Jest watch mode

### Code Quality (to be added)
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run type-check` - TypeScript compilation check (`npx tsc --noEmit`)

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **React**: v19.1.0
- **TypeScript**: v5 (strict mode)
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS v4, radix-colors for theming
- **Validation**: Zod (shared schemas for Server Actions and forms)
- **State**: Zustand or React Context (ephemeral UI state only)
- **Storage**: LocalStorage via repository pattern (swappable adapter)
- **Auth**: Web Crypto API (PIN with PBKDF2 hashing)
- **i18n**: next-intl
- **PWA**: next-pwa with Workbox
- **Testing**: Jest + React Testing Library, Playwright (E2E)
- **Tooling**: ESLint, Prettier, Husky, commitlint (Conventional Commits)
- **Fonts**: Geist Sans and Geist Mono (via next/font)

### Project Structure
```
app/
├── (dashboard)/              # Main dashboard with balances
│   ├── page.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   └── error.tsx
├── expenses/                 # Expense tracking
│   ├── page.tsx              # Expense list
│   ├── new/page.tsx          # Create expense
│   ├── [id]/page.tsx         # Detail/edit
│   ├── loading.tsx
│   └── error.tsx
├── groceries/                # Shared grocery list
├── chores/                   # Chore assignments & rotation
├── gym/                      # Gym sessions & fitness goals
├── notes/                    # Shared notes & reminders
├── chat/                     # Household chat board
├── settings/                 # Household settings
│   ├── members/              # Manage flatmates
│   └── data/                 # Import/export
├── setup/                    # First-run wizard
├── auth/                     # PIN entry gate
│   └── setup/                # PIN setup
├── api/
│   ├── export/route.ts       # Data export endpoint
│   └── import/route.ts       # Data import endpoint
├── layout.tsx                # Root layout
├── globals.css
└── not-found.tsx

src/
├── server/
│   ├── actions/              # Server Actions
│   │   ├── expenses.ts       # 8 expense actions
│   │   ├── groceries.ts
│   │   ├── chores.ts
│   │   ├── gym.ts
│   │   ├── notes.ts
│   │   ├── chat.ts
│   │   ├── auth.ts
│   │   └── settings.ts
│   ├── services/             # Business logic
│   │   ├── expense.service.ts
│   │   ├── balance.service.ts
│   │   ├── grocery.service.ts
│   │   ├── chore.service.ts
│   │   ├── gym.service.ts
│   │   ├── auth.service.ts
│   │   └── migration.service.ts
│   └── validators/           # Zod schemas
│       ├── expense.schema.ts
│       ├── grocery.schema.ts
│       ├── chore.schema.ts
│       ├── gym.schema.ts
│       └── shared.schema.ts

lib/
├── storage/
│   ├── adapter.ts            # Storage interface
│   ├── local-storage.adapter.ts
│   └── types.ts
├── hooks/
│   ├── use-local-storage.ts
│   ├── use-optimistic-update.ts
│   ├── use-pin-auth.ts
│   └── use-client-store.ts
├── utils/
│   ├── balance-engine.ts     # Debt simplification algorithm
│   ├── chore-rotation.ts     # Round-robin logic
│   ├── crypto.ts             # PIN hashing (PBKDF2)
│   └── formatters.ts         # i18n formatters
└── types/
    └── entities.ts           # Shared entity types

components/
├── ui/                       # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   └── ...
├── expenses/
│   ├── expense-list.tsx      # Server Component
│   ├── expense-form.tsx      # Client Component
│   └── balance-dashboard.tsx
├── groceries/
├── chores/
├── gym/
└── shared/
    ├── nav.tsx
    ├── error-boundary.tsx
    └── skeleton-loader.tsx

__tests__/
├── unit/
│   ├── services/             # Balance, rotation, crypto
│   ├── utils/
│   └── hooks/
├── integration/
│   ├── expenses.test.ts
│   ├── chores.test.ts
│   └── balance-engine.test.ts
└── e2e/
    ├── expense-flow.spec.ts
    ├── chore-rotation.spec.ts
    └── pwa-offline.spec.ts
```

- TypeScript path alias: `@/*` maps to root directory

### Data Model (12 entities)

**Core Entities**:
- **Member**: Flatmate (name, color, shareRatio)
- **Expense**: Transaction with split (equal/ratio/custom)
- **Balance**: Computed debt between members
- **GroceryItem**: Purchase (name, cost, category)
- **Chore**: Recurring task with rotation
- **ChoreAssignment**: Specific instance
- **GymSession**: Workout log (date, type, duration)
- **FitnessGoal**: Collective target
- **Note**: Shared note or shopping list
- **Reminder**: Time-based notification
- **ChatMessage**: Board message
- **Settings**: Household config (currency, locale, PIN)

**LocalStorage Keys**:
```
flatmate:members
flatmate:expenses
flatmate:groceries
flatmate:chores
flatmate:choreAssignments
flatmate:gymSessions
flatmate:fitnessGoals
flatmate:notes
flatmate:reminders
flatmate:chatMessages
flatmate:settings
```

### Server Actions (8 modules)

Each module in `src/server/actions/`:

**Expenses** (`expenses.ts`):
- `createExpense` - Create with split logic
- `updateExpense` - Update unsettled expense
- `deleteExpense` - Delete (creator only)
- `settleExpense` - Mark settled, archive
- `flagExpense` - Dispute flag
- `recalculateBalances` - Recompute all
- `getExpenseHistory` - Fetch with filters
- `exportExpenses` - Export to JSON

**Groceries, Chores, Gym, Notes, Chat, Auth, Settings** - Similar patterns

All actions:
- Use `"use server"` directive
- Validate with Zod schemas
- Return `{ success: true, data } | { success: false, error }`
- Invalidate cache with `revalidatePath()`

### Key Algorithms

**Balance Calculation** (`lib/utils/balance-engine.ts`):
1. Net balance per member = Σ(paid) - Σ(owed)
2. Separate creditors (positive) and debtors (negative)
3. Match largest debtor with largest creditor
4. Minimize transactions (debt simplification)

**Chore Rotation** (`lib/utils/chore-rotation.ts`):
- Sequential round-robin: `[Alice, Bob, Alice, ...]`
- On completion: `currentIndex = (currentIndex + 1) % sequence.length`
- Manual override: Set index directly

**PIN Auth** (`lib/utils/crypto.ts`):
- PBKDF2 with 100k iterations via Web Crypto API
- Store hash + salt, never raw PIN
- Rate limiting: progressive delay
- Lockout after 5 failed attempts

### Specify Workflow Integration

This project uses `.specify/` directory with structured development workflow:
- **Slash commands**: `/specify`, `/plan`, `/clarify`, `/tasks`, `/analyze`, `/implement`, `/constitution`
- **Templates**: specifications, planning, task management
- **Constitution**: project principles and governance (v1.1.0)

**Current status**: Planning complete, ready for `/tasks` command to generate implementation tasks

### Build Configuration
- Uses Turbopack for faster builds and development
- TypeScript strict mode enabled
- ES2017 target with ESNext modules
- PWA manifest and service worker via next-pwa

## Development Guidelines

### Next.js 15 App Router Principles
✅ **Server Components by default** - Only add `"use client"` for:
  - Browser-only APIs (LocalStorage, Web Crypto)
  - Stateful UI (forms with optimistic updates)
  - Imperative focus management

✅ **Server Actions for mutations** - All data changes via:
  - Server Actions (`"use server"`) with Zod validation
  - Cache invalidation via `revalidatePath()` or `revalidateTag()`
  - Never use legacy `pages/api`

✅ **Route segments** - Each route must have:
  - `loading.tsx` - Skeleton UI with Suspense
  - `error.tsx` - Error boundary
  - `not-found.tsx` - 404 handling (where applicable)

### Code Patterns

**Storage Adapter Pattern**:
```typescript
// ALWAYS use adapter, NEVER direct LocalStorage
import { storageAdapter } from '@/lib/storage/adapter'

const members = await storageAdapter.get<Member[]>('flatmate:members')
await storageAdapter.set('flatmate:members', updatedMembers)
```

**Server Action Pattern**:
```typescript
// src/server/actions/expenses.ts
'use server'

import { createExpenseSchema } from '@/server/validators/expense.schema'
import { revalidatePath } from 'next/cache'

export async function createExpense(input: unknown) {
  const validated = createExpenseSchema.parse(input)
  const expense = await expenseService.create(validated)

  revalidatePath('/expenses')
  revalidatePath('/')

  return { success: true, expense }
}
```

**Component Pattern**:
```typescript
// Server Component (default)
async function ExpenseList() {
  const expenses = await getExpenses()
  return <div>...</div>
}

// Client Component (minimal)
'use client'
function ExpenseForm() {
  const [isPending, startTransition] = useTransition()
  return <form action={createExpense}>...</form>
}
```

### TypeScript
- Strict mode enabled
- Explicit return types for all functions
- Explicit types for component props
- No `any` without documented justification
- Zod schemas provide runtime validation + type inference

### Styling
- Tailwind CSS v4 utility-first (no CSS modules)
- Mobile-first responsive design
- Theme support via CSS variables (light/dark with radix-colors)
- shadcn/ui components for accessibility

### Testing
- **Contract tests**: Validate Server Action schemas
- **Unit tests**: Balance engine, rotation logic, crypto utilities
- **Integration tests**: Full flows (expense create → settle)
- **E2E tests**: 10 quickstart scenarios + PWA offline mode

## Constitutional Requirements

Based on `.specify/memory/constitution.md` v1.1.0:

✅ **Clean & Modular Code** - Single responsibility, no duplication, ≤250 lines per component
✅ **Next.js 15 Best Practices** - App Router, Server Components, Server Actions, metadata API
✅ **Type Safety** - Strict mode, explicit types, no `any`
✅ **Component Architecture** - Server/Client boundaries, custom hooks for shared logic
✅ **Performance First** - PPR, Suspense, <200KB bundles, optimistic UI

## References

- **Feature Spec**: `specs/001-the-flatmate-life/spec.md`
- **Implementation Plan**: `specs/001-the-flatmate-life/plan.md`
- **Data Model**: `specs/001-the-flatmate-life/data-model.md`
- **Contracts**: `specs/001-the-flatmate-life/contracts/`
- **Quickstart**: `specs/001-the-flatmate-life/quickstart.md`
- **Constitution**: `.specify/memory/constitution.md`
