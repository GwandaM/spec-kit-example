# spec-kit-example Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-04

## Active Feature: Flatmate Life Tracker (001-the-flatmate-life)

A Next.js 15 PWA for managing shared living responsibilities including expense splitting, grocery tracking, rotating chores, gym goals, notes/reminders, and household chat.

## Active Technologies
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **UI**: React 19.1.0, shadcn/ui, Radix UI, Tailwind CSS v4, radix-colors
- **Validation**: Zod (shared schemas for Server Actions and client forms)
- **State**: Zustand or React Context (ephemeral UI state only)
- **Storage**: LocalStorage via repository pattern (swappable adapter)
- **Auth**: Web Crypto API (PIN hashing with PBKDF2)
- **i18n**: next-intl
- **PWA**: next-pwa with Workbox
- **Testing**: Jest + React Testing Library, Playwright (E2E)
- **Tooling**: ESLint, Prettier, Husky, commitlint

## Project Structure
```
app/
├── (dashboard)/          # Main dashboard (balances, activity)
├── expenses/             # Expense tracking
├── groceries/            # Shared grocery list
├── chores/               # Chore assignments
├── gym/                  # Gym sessions & goals
├── notes/                # Notes & reminders
├── chat/                 # Chat board
├── settings/             # Household settings
├── setup/                # First-run wizard
├── auth/                 # PIN gate
└── api/                  # Export/import endpoints

src/
├── server/
│   ├── actions/          # Server Actions (expenses, groceries, chores, etc.)
│   ├── services/         # Business logic
│   └── validators/       # Zod schemas
lib/
├── storage/              # Storage adapter (LocalStorage)
├── hooks/                # Custom hooks
├── utils/                # Balance engine, crypto, formatters
└── types/                # Shared types

components/
├── ui/                   # shadcn/ui components
├── expenses/
├── groceries/
├── chores/
├── gym/
└── shared/

__tests__/
├── unit/
├── integration/
└── e2e/
```

## Commands

### Development
```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Build production bundle
npm start            # Start production server
```

### Testing (to be added)
```bash
npm test             # Run Jest unit/integration tests
npm run test:e2e     # Run Playwright E2E tests
npm run test:watch   # Jest watch mode
```

### Code Quality (to be added)
```bash
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run type-check   # TypeScript compilation check
```

## Code Style

### Next.js 15 App Router Principles
- **Server Components by default**: Only add `"use client"` for browser-only APIs, stateful UI, or imperative focus
- **Server Actions for mutations**: All data mutations via Server Actions (`"use server"`) with Zod validation
- **No `pages/api`**: Use Server Actions or Route Handlers in `app/api/*/route.ts`
- **Cache invalidation**: Use `revalidatePath()` or `revalidateTag()` after mutations
- **Loading/Error boundaries**: Add `loading.tsx` and `error.tsx` per route segment

### TypeScript
- Strict mode enabled
- Explicit return types for all functions
- Explicit types for component props
- No `any` without documented justification
- Use Zod for runtime validation + type inference

### Component Architecture
- Server Components for data fetching/display
- Client Components for forms, optimistic UI, LocalStorage access
- Custom hooks for reusable stateful logic
- Components max 250 lines (refactor if exceeded)

### Storage Pattern
```typescript
// Use storage adapter, never direct LocalStorage calls
import { storageAdapter } from '@/lib/storage/adapter'

const data = await storageAdapter.get<Member[]>('flatmate:members')
await storageAdapter.set('flatmate:members', updatedData)
```

### Server Action Pattern
```typescript
// src/server/actions/expenses.ts
'use server'

import { createExpenseSchema } from '@/server/validators/expense.schema'
import { revalidatePath } from 'next/cache'

export async function createExpense(input: unknown) {
  const validated = createExpenseSchema.parse(input)

  // Business logic via service
  const expense = await expenseService.create(validated)

  // Cache invalidation
  revalidatePath('/expenses')
  revalidatePath('/')

  return { success: true, expense }
}
```

### Validation Schemas
All Zod schemas in `src/server/validators/`:
- `expense.schema.ts` - Expense, ExpenseParticipant
- `grocery.schema.ts` - GroceryItem
- `chore.schema.ts` - Chore, ChoreAssignment
- `gym.schema.ts` - GymSession, FitnessGoal
- `shared.schema.ts` - Member, Note, Reminder, ChatMessage, Settings

### Styling
- Tailwind CSS v4 utility-first
- No CSS modules or styled-components
- Mobile-first responsive design
- Theme support via CSS variables (light/dark)

## Data Model

### Core Entities (12 total)
- **Member**: Flatmate with name, color, shareRatio
- **Expense**: Transaction with split logic (equal/ratio/custom)
- **Balance**: Computed debt between members
- **GroceryItem**: Purchase with cost and category
- **Chore**: Recurring task with rotation sequence
- **ChoreAssignment**: Specific chore instance
- **GymSession**: Workout log (date, type, duration)
- **FitnessGoal**: Collective target with progress
- **Note**: Shared note or shopping list
- **Reminder**: Time-based notification
- **ChatMessage**: Board message
- **Settings**: Household config (currency, locale, PIN)

### LocalStorage Keys
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

## Key Algorithms

### Balance Calculation
1. Calculate net balance per member (paid - owed)
2. Separate creditors (positive) and debtors (negative)
3. Match largest debtor with largest creditor
4. Repeat until balanced (debt simplification)

### Chore Rotation
- Sequential round-robin: `[Alice, Bob, Alice, ...]`
- On completion: `currentIndex = (currentIndex + 1) % sequence.length`
- Manual override: Set index directly without altering sequence

### PIN Authentication
- PBKDF2 with 100k iterations via Web Crypto API
- Store hash + salt, never raw PIN
- Rate limiting: progressive delay (100ms → 500ms → 2s)
- Lockout after 5 failed attempts for 15 minutes

## Testing Strategy

### Contract Tests (unit)
- Validate input/output schemas for Server Actions
- Test side effects (cache invalidation, storage calls)
- Error cases (validation, not found, unauthorized)

### Integration Tests
- Full flows: expense create → update → settle
- Balance calculation accuracy
- Chore rotation over multiple cycles
- Data export/import round-trip

### E2E Tests (Playwright)
- 10 quickstart scenarios from `specs/001-the-flatmate-life/quickstart.md`
- PWA offline mode
- PIN auth flow

## Constitutional Requirements

Based on `.specify/memory/constitution.md` v1.1.0:

### Clean & Modular Code
- Single-responsibility modules
- No code duplication (extract shared logic)
- Components ≤250 lines

### Next.js 15 Best Practices
- App Router primitives end-to-end
- Server Components default, `"use client"` minimal
- Server Actions for mutations, no `pages/api`
- Native `fetch`, `cache`, segment config
- Metadata API in layouts
- `loading.tsx`, `error.tsx`, `not-found.tsx` per segment

### Type Safety
- Strict mode enabled
- Explicit return types
- Explicit component prop types
- No `any` without justification

### Performance First
- `next/image` with explicit dimensions
- `next/font` for optimization
- PPR enabled for mixed routes
- Suspense boundaries for streaming
- Bundle target <200KB client JS per page
- Optimistic UI with rollback

## Recent Changes
- 2025-10-04: Initial feature plan for Flatmate Life Tracker
- 2025-10-04: Added TypeScript 5, React 19, Next.js 15.5.4
- 2025-10-04: Defined data model (12 entities)
- 2025-10-04: Designed Server Actions contracts (8 modules)
- 2025-10-04: LocalStorage adapter pattern with schema versioning

## References
- Feature Spec: `specs/001-the-flatmate-life/spec.md`
- Implementation Plan: `specs/001-the-flatmate-life/plan.md`
- Data Model: `specs/001-the-flatmate-life/data-model.md`
- Contracts: `specs/001-the-flatmate-life/contracts/`
- Quickstart: `specs/001-the-flatmate-life/quickstart.md`
- Constitution: `.specify/memory/constitution.md`

<!-- MANUAL ADDITIONS START -->
<!-- Add project-specific notes, gotchas, or local setup instructions here -->
<!-- MANUAL ADDITIONS END -->
