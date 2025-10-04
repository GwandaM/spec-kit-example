# Technical Research: Flatmate Life Tracker

**Feature**: 001-the-flatmate-life
**Date**: 2025-10-04
**Status**: Complete

## Overview
This document consolidates technical decisions and research findings for implementing the Flatmate Life Tracker as a Next.js 15 PWA with local-first architecture.

## Technology Stack Decisions

### 1. Next.js 15 App Router
**Decision**: Use Next.js 15.5.4 with App Router exclusively
**Rationale**:
- Server Components by default reduce client bundle size
- Built-in routing, layouts, and error boundaries
- Server Actions provide type-safe mutations without API layer
- Streaming and Suspense support for progressive loading
- PPR (Partial Prerendering) for mixed static/dynamic content

**Alternatives Considered**:
- Pages Router: Rejected—legacy pattern, larger client bundles
- Remix: Rejected—similar benefits but less ecosystem maturity for PWA tooling
- Vite + React Router: Rejected—requires manual SSR setup, no built-in Server Actions

### 2. UI Component Library
**Decision**: shadcn/ui with Radix UI primitives + Tailwind CSS v4
**Rationale**:
- shadcn/ui provides copy-paste components with full control (no package dependency)
- Radix UI primitives guarantee WCAG accessibility out of the box
- Tailwind v4 offers utility-first styling with theme support via CSS variables
- radix-colors provides scientifically-designed color scales for light/dark themes

**Alternatives Considered**:
- Material UI: Rejected—heavy bundle size, harder to customize
- Chakra UI: Rejected—runtime CSS-in-JS impacts performance
- Headless UI alone: Rejected—requires more custom styling work

### 3. Data Validation
**Decision**: Zod for shared schemas across server and client
**Rationale**:
- Single source of truth for validation rules
- TypeScript inference from schemas eliminates duplication
- Works seamlessly with React Hook Form for client forms
- Server Actions can validate with same schemas

**Alternatives Considered**:
- Yup: Rejected—less TypeScript-native
- io-ts: Rejected—steeper learning curve
- Manual validation: Rejected—error-prone, duplicates logic

### 4. State Management
**Decision**: Zustand for ephemeral UI state (not canonical data)
**Rationale**:
- Minimal boilerplate compared to Redux
- Hook-based API fits React patterns
- Selector pattern prevents unnecessary re-renders
- LocalStorage persistence handled separately via adapter (canonical data only)

**Alternatives Considered**:
- React Context: Acceptable—simpler but less performant for complex selectors
- Redux Toolkit: Rejected—overkill for local-only app
- Jotai/Recoil: Rejected—atomic state may complicate LocalStorage sync

### 5. LocalStorage Persistence
**Decision**: Repository pattern with swappable storage adapter
**Rationale**:
- Isolates storage implementation from business logic
- Easy to swap LocalStorage → IndexedDB → SQLite WASM later
- Schema versioning + migration runner enables safe data evolution
- Export/import to JSON for backups independent of storage layer

**Implementation Pattern**:
```typescript
// lib/storage/adapter.ts
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

// lib/storage/local-storage.adapter.ts
class LocalStorageAdapter implements StorageAdapter {
  // localStorage wrapper with async interface
}
```

**Alternatives Considered**:
- Direct LocalStorage calls: Rejected—couples logic to storage, hard to test
- IndexedDB first: Rejected—overkill for v1, adds complexity
- Cloud sync from day 1: Rejected—violates local-first requirement

### 6. Authentication (PIN)
**Decision**: Web Crypto API with PBKDF2 for PIN hashing
**Rationale**:
- `crypto.subtle.importKey` + `crypto.subtle.deriveKey` for secure hashing
- Store hash + salt, never raw PIN
- Rate limiting via progressive delay (100ms → 500ms → 2s → lockout)
- Lockout after N failed attempts (configurable, default 5)
- Optional auto-lock on inactivity timer

**Implementation**:
```typescript
// lib/utils/crypto.ts
async function hashPin(pin: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  )
  return arrayBufferToHex(derivedBits)
}
```

**Alternatives Considered**:
- bcrypt.js: Rejected—not browser-native, larger bundle
- Simple hash (SHA-256): Rejected—vulnerable to rainbow tables without PBKDF2
- Server-based auth: Rejected—violates local-only requirement

### 7. PWA & Offline Support
**Decision**: Next.js + service worker with Workbox
**Rationale**:
- `next-pwa` plugin for automatic service worker generation
- Workbox provides cache strategies (stale-while-revalidate for static assets)
- Web App Manifest for installability
- LocalStorage-first persistence naturally supports offline

**Implementation**:
```javascript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // Next.js config
})
```

**Alternatives Considered**:
- Manual service worker: Rejected—reinvents Workbox
- Offline Plugin for Webpack: Rejected—Next.js uses Turbopack
- No offline support: Rejected—violates PWA requirement

### 8. Internationalization
**Decision**: next-intl for copy + Intl API for formatting
**Rationale**:
- next-intl provides App Router-compatible i18n
- `Intl.NumberFormat` for currency formatting (user-configurable)
- `Intl.DateTimeFormat` for date/time in user's locale
- Lightweight compared to full i18n frameworks

**Alternatives Considered**:
- react-i18next: Rejected—heavier, not Next.js-optimized
- Format.js (Intl MessageFormat): Rejected—more boilerplate
- Manual formatting: Rejected—error-prone, misses edge cases

### 9. Testing Strategy
**Decision**: Jest + RTL for unit/integration, Playwright for E2E
**Rationale**:
- Jest + React Testing Library standard for React testing
- Contract tests for Server Actions ensure input/output schemas
- Playwright for E2E PWA scenarios (offline, install prompt)
- Integration tests for balance engine, chore rotation logic

**Test Organization**:
```
__tests__/
├── unit/
│   ├── services/           # Balance engine, rotation logic
│   ├── utils/              # Crypto, formatters
│   └── hooks/              # useLocalStorage, usePinAuth
├── integration/
│   ├── expenses.test.ts    # Full expense flow
│   ├── chores.test.ts      # Chore assignment flow
│   └── balance-engine.test.ts
└── e2e/
    ├── expense-flow.spec.ts
    ├── chore-rotation.spec.ts
    └── pwa-offline.spec.ts
```

**Alternatives Considered**:
- Cypress: Rejected—Playwright has better PWA support
- Vitest: Acceptable—but Jest more mature for Next.js
- No E2E: Rejected—PWA offline scenarios need browser testing

### 10. Code Quality Tooling
**Decision**: ESLint + Prettier + Husky + commitlint
**Rationale**:
- ESLint with Next.js config + TypeScript rules
- Prettier for consistent formatting
- Husky pre-commit hooks enforce quality gates
- commitlint ensures Conventional Commits for changelog generation

**Configuration**:
```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

// .lintstagedrc.json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}

// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

**Alternatives Considered**:
- No pre-commit hooks: Rejected—relies on developer discipline
- Custom linting: Rejected—Next.js ESLint config covers best practices

### 11. CI/CD Pipeline
**Decision**: GitHub Actions with Vercel deployment
**Rationale**:
- GitHub Actions for CI (type check, lint, test)
- Vercel for preview + production deployment
- Preview deploys on PRs for testing
- Environment variables for feature flags

**Workflow**:
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e
```

**Alternatives Considered**:
- GitLab CI: Rejected—GitHub-first project
- CircleCI: Rejected—GitHub Actions native to repo
- No CI: Rejected—quality gates required

## Key Architecture Decisions

### Balance Engine
**Algorithm**: Debt simplification via netting to minimize transfers
**Approach**:
1. Calculate net balance per flatmate (total paid - total owed)
2. Separate into creditors (positive) and debtors (negative)
3. Match largest debtor with largest creditor iteratively
4. Repeat until all balanced

**Edge Cases**:
- Rounding: Always round to 2 decimals, remainder absorbed by payer
- Deleted members: Preserve balances, require settlement before removal
- Multi-currency: v1 uses single currency per household; FX table deferred

### Chore Rotation
**Algorithm**: Sequential round-robin with manual override
**Approach**:
1. Store rotation sequence: `[memberId1, memberId2, ...]`
2. On chore completion, assign next member in sequence
3. Wrap around at end of list
4. Manual override updates current assignment without altering sequence

**Edge Cases**:
- Skip/holiday: Manual override to skip person, next rotation resumes sequence
- Load balancing: Track completion count, optionally reorder sequence to balance

### Schema Versioning
**Approach**: Semantic versioning + migration runner
**Pattern**:
```typescript
// lib/storage/migrations.ts
const migrations = {
  '1.0.0': (data: any) => data, // Initial
  '1.1.0': (data: any) => {
    // Add new field
    return { ...data, newField: defaultValue }
  }
}

function migrate(data: any, fromVersion: string, toVersion: string) {
  const versions = Object.keys(migrations).sort()
  const startIdx = versions.indexOf(fromVersion) + 1
  const endIdx = versions.indexOf(toVersion)

  return versions.slice(startIdx, endIdx + 1).reduce(
    (acc, version) => migrations[version](acc),
    data
  )
}
```

## Performance Considerations

### Bundle Size Optimization
- Tree-shake shadcn/ui components (import only used)
- Dynamic import heavy dependencies (chart libraries if added)
- Route-level code splitting via App Router automatic
- Bundle analyzer to monitor <200KB target

### Rendering Optimization
- Server Components for data-heavy lists (expense history)
- Memoize list items with `React.memo`
- Virtualize long lists (react-window) if >100 items
- Optimistic UI for mutations (update UI before server confirmation)

### Caching Strategy
- Service worker caches static assets (stale-while-revalidate)
- LocalStorage caches canonical data (never expires, user-controlled)
- Server Actions use `revalidatePath` after mutations
- No server-side caching needed (local-first)

## Privacy & Security

### Local-Only Data
- All data stored in LocalStorage (browser-scoped)
- No server database, no data transmission
- Export to JSON (optional encryption via user-provided password + Web Crypto)
- Import validates schema before loading

### Consent & Analytics
- No analytics by default
- Optional PostHog integration with explicit consent dialog
- Event logging (errors, performance) stored locally unless opted in

### Security Measures
- PIN hash + salt (PBKDF2 with 100k iterations)
- Rate limiting on PIN attempts (progressive delay)
- Auto-lock on inactivity (configurable timeout)
- Content Security Policy headers in production

## Deferred/Future Considerations

### Stretch Goals (Not v1)
- Biometric auth via WebAuthn (fingerprint, Face ID)
- Cloud sync option (Supabase, SQLite WASM with sync)
- Multi-currency support with FX rate table
- Push notifications (Web Push API) for reminders
- Advanced analytics (spending trends, chore compliance)

### Migration Path
- Storage adapter enables LocalStorage → IndexedDB → SQLite WASM
- Schema versioning supports data model evolution
- Export/import enables device migration without cloud
- Feature flags in `next.config.ts` for gradual rollout

## Research Summary
All technical unknowns resolved. Stack validated against constitution principles. No blockers identified for Phase 1 design.

**Status**: ✅ Ready for Phase 1 (Design & Contracts)
