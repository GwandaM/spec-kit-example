# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → data utilities / model tasks
   → contracts/: Each file → contract or Server Action test task
   → research.md: Extract decisions → setup or validation tasks
3. Generate tasks by category:
   → Setup: project structure, dependencies, linting, type checks
   → Tests: contract tests, component tests, integration tests
   → Core: Server Actions, Route Handlers, Server/Client components
   → Integration: data sources, caching, revalidation
   → Polish: performance, accessibility, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts/Server Actions have tests?
   → All entities have supporting data utilities?
   → Suspense/loading/error states covered?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js (single app)**: `app/`, `components/`, `lib/`, `app/api/`, `server-actions/`, `__tests__/`
- **Monorepo**: mirror Next app layout under `apps/[name]/`
- **Shared utilities**: `lib/` or `packages/`

## Phase 3.1: Setup
- [ ] T001 Ensure feature route directories exist (e.g., `app/(feature)/[segment]/` scaffold)
- [ ] T002 Install/verify dependencies declared in plan.md (e.g., zod, @tanstack/react-query)
- [ ] T003 [P] Configure linting, formatting, and type checking scripts (`npx next lint`, `npx tsc --noEmit`)
- [ ] T004 [P] Update `tailwind.config.ts` and `postcss.config.mjs` if new design tokens required

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T005 [P] Contract test for `app/api/[resource]/route.ts` in `__tests__/contract/[resource].test.ts`
- [ ] T006 [P] Server Action test in `__tests__/server-actions/[action].test.ts`
- [ ] T007 [P] Component test with React Testing Library in `__tests__/components/[Component].test.tsx`
- [ ] T008 [P] Integration test covering route flow in `__tests__/integration/[feature].test.tsx`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T009 Implement data loader in `lib/[feature]/get-data.ts` with proper caching
- [ ] T010 Implement Server Action in `server-actions/[feature]/[action].ts`
- [ ] T011 Implement Route Handler in `app/api/[resource]/route.ts` with typed `NextResponse`
- [ ] T012 Build Server Component for main page in `app/(feature)/[segment]/page.tsx`
- [ ] T013 Build Client Component for interactive elements in `app/(feature)/[segment]/components/[Component].tsx`
- [ ] T014 Wire Suspense boundaries and `loading.tsx`
- [ ] T015 Register `error.tsx` and `not-found.tsx` with friendly UX copy

## Phase 3.4: Integration
- [ ] T016 Connect data loader to external services or database adapters in `lib/services/`
- [ ] T017 Configure cache revalidation (`revalidatePath` or `revalidateTag`) post-mutation
- [ ] T018 Instrument performance metrics or logging in `lib/observability/`
- [ ] T019 Ensure Tailwind styles cover responsive breakpoints and dark mode variants if needed

## Phase 3.5: Polish
- [ ] T020 [P] Add accessibility sweep (ARIA roles, focus management) to components
- [ ] T021 [P] Verify bundle size and add dynamic imports for heavy client code
- [ ] T022 Update documentation in `docs/[feature].md` or `README` section
- [ ] T023 Run full verification: `npx tsc --noEmit`, `npx next lint`, `npm run build`

## Dependencies
- Tests (T005-T008) before implementation (T009-T015)
- Data loader (T009) before Server Action/Route Handler (T010-T011)
- Suspense/error handling (T014-T015) after core components (T012-T013)
- Revalidation (T017) depends on mutations (T010-T011)
- Polish tasks (T020-T023) after integration (T016-T019)

## Parallel Example
```
# Launch T005-T008 together:
Task: "Contract test for app/api/[resource]/route.ts in __tests__/contract/[resource].test.ts"
Task: "Server Action test in __tests__/server-actions/[action].test.ts"
Task: "Component test with React Testing Library in __tests__/components/[Component].test.tsx"
Task: "Integration test covering route flow in __tests__/integration/[feature].test.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task group
- Avoid: vague tasks, shared file conflicts, mixing server/client concerns

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts & Server Actions**:
   - Each route handler or Server Action → contract test + implementation pair
   - Mutations MUST include revalidation task
   
2. **From Data Model**:
   - Each entity → typed schema + data loader task [P]
   - Relationships → composition tasks in Server Components or hooks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → end-to-end validation tasks

4. **Ordering**:
   - Setup → Tests → Data utilities → Components → Routing → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All routes and Server Actions have corresponding tests
- [ ] All entities have typed schemas and data utilities
- [ ] Suspense/loading/error coverage documented
- [ ] Parallel tasks modify distinct files
- [ ] Each task specifies exact file path
- [ ] No task violates constitution gates (App Router, type safety, performance)
