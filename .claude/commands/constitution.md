<!--
Sync Impact Report:
Version: 1.0.0 → 1.1.0
Rationale: Expanded Next.js 15 guidance and aligned workflow templates (MINOR bump - new enforceable rules)

Modified Principles:
- II. Next.js 15 Best Practices (expanded requirements)
- V. Performance First (PPR and streaming mandates)

Added Sections:
- Development Standards → Routing & Data Flow

Removed Sections:
- None

Templates Requiring Updates:
✅ .specify/templates/plan-template.md - Constitution reference and gates synced
✅ .specify/templates/tasks-template.md - Tasks adjusted for Next.js workflow
✅ CLAUDE.md - Verified alignment with new principles (no edits required)

Follow-up TODOs:
- None (all directives resolved)
-->

# Spec Kit Example Constitution

## Core Principles

### I. Clean & Modular Code

Code MUST be organized into focused, single-responsibility modules. Each component, function, or utility MUST have a clear, well-defined purpose. Code duplication is forbidden—shared logic MUST be extracted into reusable utilities or hooks. Components MUST NOT exceed 250 lines; refactor into smaller components when this limit is approached.

**Rationale**: Modular code improves maintainability, testability, and team collaboration. Clear boundaries reduce cognitive load and make the codebase accessible to new contributors.

### II. Next.js 15 Best Practices

All features MUST use Next.js 15 App Router primitives end-to-end. Routes live in `app/` and default to Server Components; add `use client` only when code touches browser-only APIs, imperative focus management, or stateful UI. Server Actions (`use server`) or typed Route Handlers in `app/api/*/route.ts` MUST perform every mutation—`pages/api` and ad-hoc fetch proxies are forbidden. Data fetching MUST rely on native `fetch`, `cache`, and segment config: declare `dynamic`, `revalidate`, or `fetch` cache directives explicitly and co-locate `generateStaticParams` for static paths. Layouts MUST implement the Metadata API. Each route segment MUST register `loading.tsx`, `error.tsx`, and `not-found.tsx` when applicable. Heavy client-only dependencies MUST be isolated behind dynamic imports with suspense fallbacks.

**Rationale**: Aligning with the App Router unlocks React Server Components, granular caching, and zero-cost streaming. Strict separation between server and client concerns keeps bundles lean and makes framework upgrades frictionless.

### III. Type Safety

TypeScript strict mode MUST be enabled. All functions MUST have explicit return types. Component props MUST use interface or type definitions. No `any` types without documented justification. Type inference should be leveraged for local variables, but exported APIs MUST have explicit types.

**Rationale**: Type safety catches errors at compile-time, serves as living documentation, and enables superior IDE support. Strict typing prevents runtime errors and improves refactoring confidence.

### IV. Component Architecture

Components MUST separate concerns: presentation components for UI, container components for data/logic. Custom hooks MUST be used for reusable stateful logic. Server Components MUST NOT import client-side dependencies. Client Components MUST be pushed to the leaves of the component tree. Component files MUST include types, implementation, and exports—no logic in barrel exports.

**Rationale**: Clear architectural boundaries make components predictable, testable, and reusable. Server/Client separation maximizes performance gains from React Server Components.

### V. Performance First

Images MUST use `next/image` with explicit width/height or fill mode. Fonts MUST use `next/font` for automatic optimization. Third-party scripts MUST use `next/script` with appropriate loading strategies. Partial Prerendering (PPR) MUST be enabled for routes with mixed static and dynamic regions; streaming Suspense boundaries MUST prevent blank states. Server Actions MUST invalidate caches with `revalidatePath` or `revalidateTag` immediately after mutations. Bundle size MUST be monitored—warn when any page bundle exceeds 200KB of client JavaScript. Implement skeleton or progress UIs via Suspense rather than imperative loaders.

**Rationale**: Performance directly impacts user experience, SEO, and conversion rates. Next.js provides primitives for optimization—we MUST leverage them by default, not as an afterthought.

## Development Standards

### Code Organization
- Use path aliases (`@/*`) for imports—no relative paths beyond sibling directories
- Group related files in feature folders (e.g., `app/(marketing)/`, `components/`, `lib/`, `server-actions/`)
- Keep `app/` focused on routing, layouts, and entry components; move business logic into `lib/` or dedicated service modules
- Extract cross-cutting utilities (formatters, adapters) into `lib/` with colocated tests

### Routing & Data Flow
- Route Handlers in `app/api` MUST return typed `NextResponse` objects with explicit status codes
- Server Actions MUST validate input with shared schema utilities and handle errors via union return types, not throw/catch chains
- Revalidation strategy MUST be declared per mutation (`revalidatePath`/`revalidateTag`) and documented in code comments when non-obvious
- Shared data loaders MUST live in `lib/` or `app/_data` modules and be wrapped in `cache()` when safe to memoize on the server

### Styling
- Use Tailwind CSS v4 for styling—no CSS modules or styled-components
- Follow mobile-first responsive design patterns
- Extract repeated utility combinations into component variants
- Use CSS variables for theming when needed

### Error Handling
- Use `error.tsx` and `not-found.tsx` boundary files appropriately
- Provide meaningful error messages for development and user-friendly messages for production
- Log errors with sufficient context for debugging
- Handle loading states explicitly—no layout shift

## Quality Gates

### Pre-Commit Requirements
- TypeScript compilation (`npx tsc --noEmit`) MUST succeed with zero errors
- `npx next lint` MUST pass with no errors; warnings require comments linking to tracked follow-ups
- Code formatting via Prettier (if configured) MUST pass
- Unused imports and variables MUST be removed

### Pre-Merge Requirements
- Production build (`npm run build`) MUST complete successfully
- No `console.log` statements in production code (use structured logging utilities when needed)
- All new components MUST have proper TypeScript types and prop-level documentation when complex
- Breaking changes MUST be documented in commit messages and linked specs/plan docs

### Review Checklist
- Server/Client component boundaries correctly defined with minimal `use client`
- Server Actions and Route Handlers enforce validation and cache revalidation
- Data fetching patterns honor caching directives and avoid mixing client/server fetching
- Accessibility considerations addressed (semantic HTML, ARIA when needed)
- Mobile responsiveness and streaming fallbacks verified

## Governance

### Amendment Process
Constitution changes require:
1. Documented rationale explaining the need for amendment
2. Impact assessment on existing code and templates
3. Version bump following semantic versioning (see below)
4. Update to all dependent templates and documentation

### Versioning Policy
- **MAJOR**: Principle removal, redefinition, or incompatible governance changes
- **MINOR**: New principle additions or material expansions to existing principles
- **PATCH**: Clarifications, wording improvements, non-semantic corrections

### Compliance
All code reviews MUST verify constitutional compliance. Deviations MUST be justified in plan.md Complexity Tracking section. Simplification MUST be attempted before accepting complexity. The constitution supersedes team preferences—challenge principles through amendment process, not ad-hoc violations.

### Template Synchronization
When constitution is amended, the following templates MUST be reviewed and updated:
- `.specify/templates/plan-template.md` (Constitution Check section)
- `.specify/templates/spec-template.md` (Requirements alignment)
- `.specify/templates/tasks-template.md` (Task categorization)
- `.specify/templates/agent-file-template.md` (Development guidelines)
- `CLAUDE.md` or other agent-specific guidance files

**Version**: 1.1.0 | **Ratified**: 2025-10-03 | **Last Amended**: 2025-10-03
