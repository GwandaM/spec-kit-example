# Implementation Plan: Flatmate Life Tracker

**Branch**: `001-the-flatmate-life` | **Date**: 2025-10-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-the-flatmate-life/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
The Flatmate Life Tracker is a Next.js 15 PWA that enables flatmates to collaboratively manage shared living responsibilities. Core features include expense splitting with balance tracking, shared grocery lists with contribution tracking, rotating cleaning chore assignments, gym session logging with collective goals, shared notes/reminders, and a lightweight chat board. The app uses local-first architecture with LocalStorage persistence (swappable adapter pattern), local-only PIN authentication via Web Crypto, and supports up to 12 flatmates per household. All data remains client-side with optional encrypted export for backups.

## Technical Context
**Language/Version**: TypeScript 5 (strict mode), React 19.1.0, Next.js 15.5.4 (App Router)
**Primary Dependencies**:
- UI: shadcn/ui components with Radix UI primitives, Tailwind CSS v4, radix-colors for theming
- Validation: Zod (shared schemas for Server Actions and client forms)
- State: Zustand or React Context with selectors (ephemeral UI state only)
- Auth: Web Crypto API (PIN hashing with salt, rate limiting, lockout)
- i18n: next-intl (localization, currency/date formatting)
- Tooling: ESLint, Prettier, Husky (pre-commit hooks), commitlint (Conventional Commits)

**Storage**: LocalStorage via repository pattern (swappable storage adapter); schema versioning with migration runner; import/export to JSON for backups
**Testing**: Jest with React Testing Library (unit/integration), Playwright (E2E), contract tests for Server Actions
**Target Platform**: Web (PWA with offline support via service worker, app manifest, install prompt), browser-based
**Project Type**: Single Next.js application (App Router, Server Components default)
**Performance Goals**:
- Client bundle <200KB JS per page
- Optimistic UI with rollback on failure
- Route-level code splitting, memoized lists
- Virtualize long histories when needed

**Constraints**:
- Local-only data (no server database, LocalStorage first)
- Offline-capable (service worker caching)
- Privacy-first (no tracking without consent, optional encrypted export)
- Max 12 flatmates per household
- Accessibility (WCAG compliance via Radix primitives, keyboard nav, focus management)

**Scale/Scope**:
- Single household app (multi-tenancy not required)
- ~15-20 screens/routes (dashboard, expenses, groceries, chores, gym, notes, chat, settings, PIN setup/lock)
- Data model: 9 core entities (Member, Expense, Balance, GroceryItem, Chore, ChoreAssignment, GymSession, FitnessGoal, Note, Reminder, ChatMessage, Settings)

**CI/CD**: GitHub Actions workflow (type check, lint, unit/E2E tests, preview deploy on PRs, production deploy on main)
**Deployment**: Vercel (preview + production), feature flags for future cloud sync option

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**✅ Next.js 15 App Router compliance**: All routes in `app/`, Server Components by default, Server Actions for all mutations (expense creation, chore updates, PIN verification, etc.), no legacy `pages/api` endpoints. Route Handlers in `app/api/` only for export/import endpoints if needed.

**✅ Type Safety guarantees**: TypeScript strict mode enabled, all Server Actions use explicit Zod schemas for input/output, all component props explicitly typed, no `any` without documented justification. Shared schemas between server and client enforce type safety end-to-end.

**✅ Component architecture boundaries**: Server Components for data fetching (expense list, balance dashboard, chore assignments), Client Components only for interactive forms, optimistic UI, and client-side storage access (marked with `use client`). Custom hooks for shared logic (useLocalStorage, useOptimisticUpdate, usePinAuth).

**✅ Performance obligations**:
- PPR enabled for mixed static/dynamic routes (expense history with real-time balance)
- Suspense boundaries around data-heavy sections (expense lists, gym history)
- Client bundle target <200KB enforced via bundle analyzer
- Optimistic UI for creates/edits with rollback reduces perceived latency
- Service worker caches static assets; localStorage persistence minimizes network needs

**✅ Development standards**:
- All mutations via Server Actions with Zod validation
- Error boundaries (`error.tsx`) at route segment level
- Loading states (`loading.tsx`) with skeleton UI
- Tailwind CSS v4 for all styling (no CSS modules)
- Validation centralized in `lib/validators/` using Zod schemas
- Data flow: UI → Server Action → Service → Storage Adapter → LocalStorage

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
app/
├── (dashboard)/
│   ├── page.tsx              # Main dashboard (balances, recent activity)
│   ├── layout.tsx            # Shared layout with nav
│   ├── loading.tsx           # Dashboard skeleton
│   └── error.tsx             # Dashboard error boundary
├── expenses/
│   ├── page.tsx              # Expense list/history
│   ├── new/
│   │   └── page.tsx          # Create expense form
│   ├── [id]/
│   │   └── page.tsx          # Expense detail/edit
│   ├── loading.tsx
│   └── error.tsx
├── groceries/
│   ├── page.tsx              # Grocery list
│   ├── loading.tsx
│   └── error.tsx
├── chores/
│   ├── page.tsx              # Chore assignments
│   ├── loading.tsx
│   └── error.tsx
├── gym/
│   ├── page.tsx              # Gym sessions & goals
│   ├── loading.tsx
│   └── error.tsx
├── notes/
│   ├── page.tsx              # Shared notes & reminders
│   ├── loading.tsx
│   └── error.tsx
├── chat/
│   ├── page.tsx              # Chat board
│   ├── loading.tsx
│   └── error.tsx
├── settings/
│   ├── page.tsx              # Household settings
│   ├── members/
│   │   └── page.tsx          # Manage flatmates
│   ├── data/
│   │   └── page.tsx          # Import/export
│   └── error.tsx
├── setup/
│   ├── page.tsx              # First-run wizard
│   └── error.tsx
├── auth/
│   ├── page.tsx              # PIN entry gate
│   └── setup/
│       └── page.tsx          # PIN setup
├── api/
│   ├── export/
│   │   └── route.ts          # Data export endpoint
│   └── import/
│       └── route.ts          # Data import endpoint
├── layout.tsx                # Root layout
├── globals.css
└── not-found.tsx

src/
├── server/
│   ├── actions/
│   │   ├── expenses.ts       # Expense Server Actions
│   │   ├── groceries.ts      # Grocery Server Actions
│   │   ├── chores.ts         # Chore Server Actions
│   │   ├── gym.ts            # Gym Server Actions
│   │   ├── notes.ts          # Notes/reminders Server Actions
│   │   ├── chat.ts           # Chat Server Actions
│   │   ├── auth.ts           # PIN auth Server Actions
│   │   └── settings.ts       # Settings Server Actions
│   ├── services/
│   │   ├── expense.service.ts
│   │   ├── balance.service.ts
│   │   ├── grocery.service.ts
│   │   ├── chore.service.ts
│   │   ├── gym.service.ts
│   │   ├── auth.service.ts
│   │   └── migration.service.ts
│   └── validators/
│       ├── expense.schema.ts
│       ├── grocery.schema.ts
│       ├── chore.schema.ts
│       ├── gym.schema.ts
│       └── shared.schema.ts

lib/
├── storage/
│   ├── adapter.ts            # Storage adapter interface
│   ├── local-storage.adapter.ts
│   └── types.ts
├── hooks/
│   ├── use-local-storage.ts
│   ├── use-optimistic-update.ts
│   ├── use-pin-auth.ts
│   └── use-client-store.ts
├── utils/
│   ├── balance-engine.ts     # Balance calculation & netting
│   ├── chore-rotation.ts     # Rotation algorithms
│   ├── crypto.ts             # PIN hashing utilities
│   └── formatters.ts         # i18n formatters
└── types/
    └── entities.ts           # Shared entity types

components/
├── ui/                       # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   └── ...
├── expenses/
│   ├── expense-list.tsx
│   ├── expense-form.tsx
│   └── balance-dashboard.tsx
├── groceries/
│   ├── grocery-list.tsx
│   └── grocery-form.tsx
├── chores/
│   ├── chore-list.tsx
│   └── chore-card.tsx
├── gym/
│   ├── session-list.tsx
│   ├── session-form.tsx
│   └── goal-progress.tsx
└── shared/
    ├── nav.tsx
    ├── error-boundary.tsx
    └── skeleton-loader.tsx

__tests__/
├── unit/
│   ├── services/
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

public/
├── icons/
├── manifest.json
└── sw.js                     # Service worker

.github/
└── workflows/
    └── ci.yml                # Type check, lint, test, deploy
```

**Structure Decision**: Single Next.js application with App Router. All backend logic lives under `src/server/*` (Server Actions, services, validators) following a clean repository pattern. Storage adapter isolates LocalStorage access for future swapping. UI components organized by domain (expenses, groceries, chores, gym) with shared shadcn/ui primitives in `components/ui/`. Test organization mirrors source structure.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: ✅ research.md complete (no NEEDS CLARIFICATION remaining)

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint or Server Action signature
   - Prefer Route Handlers (`app/api`) over legacy endpoints
   - Output typed request/response schemas alongside HTTP contract tests

3. **Generate contract tests** from contracts:
   - One test file per endpoint or Server Action
   - Assert request/response schemas and cache invalidation triggers

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh codex`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: ✅ data-model.md, /contracts/*, quickstart.md, AGENTS.md (codex)

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
The `/tasks` command will generate a dependency-ordered task list following TDD principles:

1. **Foundation Tasks** (parallel where possible):
   - Setup tooling: ESLint, Prettier, Husky, commitlint configs
   - Install dependencies: shadcn/ui, Zod, Zustand/Context, next-intl, next-pwa
   - Configure TypeScript paths and strict mode
   - Setup test infrastructure: Jest, RTL, Playwright configs

2. **Data Layer Tasks** (TDD order):
   - Define Zod schemas in `src/server/validators/` (one per domain: expenses, groceries, chores, gym, notes, chat, auth, settings)
   - Implement storage adapter interface + LocalStorage adapter [P]
   - Write unit tests for storage adapter
   - Implement schema migration runner with version 1.0.0
   - Write unit tests for migration logic

3. **Core Utilities Tasks** (parallel):
   - Balance engine with debt simplification algorithm + unit tests [P]
   - Chore rotation logic (round-robin, manual override) + unit tests [P]
   - PIN crypto utilities (PBKDF2 hashing, verification) + unit tests [P]
   - i18n formatters (currency, date/time) + unit tests [P]

4. **Server Actions Tasks** (TDD order, contract tests first):
   - For each domain (expenses, groceries, chores, gym, notes, chat, auth, settings):
     - Write contract tests (input/output validation, side effects)
     - Implement Server Actions with Zod validation
     - Implement service layer (business logic)
     - Verify cache invalidation patterns

5. **UI Component Tasks** (bottom-up):
   - Setup shadcn/ui base components (button, card, dialog, form, input, etc.)
   - Implement shared components (nav, error-boundary, skeleton-loader)
   - Implement domain components (Server Components for lists, Client Components for forms):
     - Expenses: expense-list, expense-form, balance-dashboard
     - Groceries: grocery-list, grocery-form
     - Chores: chore-list, chore-card
     - Gym: session-list, session-form, goal-progress
     - Notes: note-list, note-form
     - Chat: message-list, message-input

6. **Route/Page Tasks** (with loading + error boundaries):
   - Setup root layout with theme provider and i18n
   - Implement auth gate (`/auth` pages with PIN entry)
   - Implement first-run setup wizard (`/setup`)
   - Implement dashboard (`/` with balances + activity)
   - Implement domain routes (expenses, groceries, chores, gym, notes, chat, settings)
   - Add loading.tsx and error.tsx for each route segment

7. **PWA Tasks**:
   - Configure next-pwa in next.config.ts
   - Create manifest.json with icons
   - Setup service worker with Workbox caching strategies
   - Add install prompt UI
   - Test offline mode

8. **Integration Tests**:
   - Full expense flow (create → update → settle)
   - Balance calculation accuracy (multi-member scenarios)
   - Chore rotation over multiple cycles
   - Data export/import round-trip
   - Duplicate grocery detection and merge

9. **E2E Tests** (Playwright):
   - Quickstart scenario tests (all 10 scenarios from quickstart.md)
   - PWA offline mode test
   - PIN auth flow test

10. **CI/CD Tasks**:
    - Create GitHub Actions workflow (type check, lint, test, E2E)
    - Configure Vercel deployment
    - Setup environment variables
    - Add bundle size monitoring

**Ordering Strategy**:
- **TDD order**: All tests written before implementation
- **Dependency order**:
  - Foundation → Data layer → Utilities → Server Actions → Services → Components → Routes
  - Within each layer, tasks marked [P] can run in parallel
- **Constitutional compliance**: Each task verifies Server Component boundaries, cache invalidation, and bundle size

**Task Count Estimate**: 80-100 tasks total
- Foundation: ~8 tasks
- Data layer: ~12 tasks
- Utilities: ~8 tasks
- Server Actions: ~40 tasks (8 domains × 5 actions avg)
- UI Components: ~15 tasks
- Routes: ~10 tasks
- PWA: ~5 tasks
- Testing: ~15 tasks
- CI/CD: ~4 tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

**No violations identified.** All design decisions align with constitutional principles:
- Server Components used by default, Client Components only where necessary (forms, LocalStorage access)
- Server Actions handle all mutations with Zod validation
- Storage adapter pattern enables future migration without constitutional violations
- Bundle size managed via tree-shaking and dynamic imports
- Error boundaries and loading states at route segment level


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (Technical Context fully specified)
- [x] Complexity deviations documented (None identified)

---
*Based on Constitution v1.1.0 - See `/memory/constitution.md`*
