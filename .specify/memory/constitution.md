<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Rationale: Initial constitution creation (MAJOR bump - establishing governance from scratch)

Modified Principles:
- Created: I. Clean & Modular Code
- Created: II. Next.js 15 Best Practices
- Created: III. Type Safety
- Created: IV. Component Architecture
- Created: V. Performance First

Added Sections:
- Core Principles
- Development Standards
- Quality Gates
- Governance

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section references this version
✅ spec-template.md - No conflicts, requirements alignment verified
✅ tasks-template.md - Task categorization aligns with principles
✅ agent-file-template.md - Generic template, no agent-specific references

Follow-up TODOs:
- None (all placeholders resolved)
-->

# Spec Kit Example Constitution

## Core Principles

### I. Clean & Modular Code

Code MUST be organized into focused, single-responsibility modules. Each component, function, or utility MUST have a clear, well-defined purpose. Code duplication is forbidden—shared logic MUST be extracted into reusable utilities or hooks. Components MUST NOT exceed 250 lines; refactor into smaller components when this limit is approached.

**Rationale**: Modular code improves maintainability, testability, and team collaboration. Clear boundaries reduce cognitive load and make the codebase accessible to new contributors.

### II. Next.js 15 Best Practices

All code MUST follow Next.js 15 App Router conventions. Use Server Components by default; mark Client Components explicitly with 'use client' only when required for interactivity, browser APIs, or React hooks. Data fetching MUST use native fetch with proper caching strategies (force-cache, no-store, revalidate). Metadata MUST be defined using the Metadata API. File-based routing MUST be used for all pages. Dynamic imports MUST be used for code-splitting heavy components.

**Rationale**: Next.js 15 provides significant performance improvements through the App Router and React Server Components. Following framework conventions ensures optimal bundle sizes, automatic optimizations, and future compatibility.

### III. Type Safety

TypeScript strict mode MUST be enabled. All functions MUST have explicit return types. Component props MUST use interface or type definitions. No 'any' types without documented justification. Type inference should be leveraged for local variables, but exported APIs MUST have explicit types.

**Rationale**: Type safety catches errors at compile-time, serves as living documentation, and enables superior IDE support. Strict typing prevents runtime errors and improves refactoring confidence.

### IV. Component Architecture

Components MUST separate concerns: presentation components for UI, container components for data/logic. Custom hooks MUST be used for reusable stateful logic. Server Components MUST NOT import client-side dependencies. Client Components MUST be pushed to the leaves of the component tree. Component files MUST include types, implementation, and exports—no logic in barrel exports.

**Rationale**: Clear architectural boundaries make components predictable, testable, and reusable. Server/Client separation maximizes performance gains from React Server Components.

### V. Performance First

Images MUST use next/image with explicit width/height or fill mode. Fonts MUST use next/font for automatic optimization. Third-party scripts MUST use next/script with appropriate loading strategies. Client-side JavaScript MUST be minimized—prefer Server Components. Bundle size MUST be monitored; warn when page bundles exceed 200KB. Implement proper loading states and Suspense boundaries.

**Rationale**: Performance directly impacts user experience, SEO, and conversion rates. Next.js provides primitives for optimization—we MUST leverage them by default, not as an afterthought.

## Development Standards

### Code Organization
- Use path aliases (@/*) for imports—no relative paths beyond sibling directories
- Group related files in feature folders (components, hooks, utils, types)
- Keep app/ directory clean—only routing files and layouts
- Extract business logic into separate lib/ or services/ directories

### Styling
- Use Tailwind CSS v4 for styling—no CSS modules or styled-components
- Follow mobile-first responsive design patterns
- Extract repeated utility combinations into component variants
- Use CSS variables for theming when needed

### Error Handling
- Use error.tsx and not-found.tsx boundary files appropriately
- Provide meaningful error messages for development and user-friendly messages for production
- Log errors with sufficient context for debugging
- Handle loading states explicitly—no layout shift

## Quality Gates

### Pre-Commit Requirements
- TypeScript compilation MUST succeed with zero errors
- No ESLint errors (warnings acceptable with justification)
- Code formatting via Prettier (if configured) MUST pass
- Unused imports and variables MUST be removed

### Pre-Merge Requirements
- Build process (npm run build) MUST complete successfully
- No console.log statements in production code (use proper logging utilities)
- All new components MUST have proper TypeScript types
- Breaking changes MUST be documented in commit messages

### Review Checklist
- Server/Client component boundaries correctly defined
- No unnecessary 'use client' directives
- Proper data fetching patterns (not mixing client/server data fetching)
- Accessibility considerations addressed (semantic HTML, ARIA when needed)
- Mobile responsiveness verified

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

**Version**: 1.0.0 | **Ratified**: 2025-10-03 | **Last Amended**: 2025-10-03
