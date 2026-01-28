# Implementation Plan: Gamified Habit Tracker

**Branch**: `001-gamified-habit-tracker` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-gamified-habit-tracker/spec.md`

## Summary

Build a mobile-first, minimalistic habit tracker web app with gamification elements (points, streaks, achievements). Users authenticate via email/password and sync data to the cloud. The app uses a single-screen dashboard pattern showing habits, streaks, and points together. Built with React + Vite for the frontend and Supabase for authentication, database, and real-time sync.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 18, Vite 5, Supabase JS client, TailwindCSS
**Storage**: Supabase PostgreSQL (cloud database with Row Level Security)
**Testing**: Vitest (unit/integration), Playwright (E2E)
**Target Platform**: Web (mobile-first responsive, PWA-ready)
**Project Type**: Web application (frontend-only, Supabase handles backend)
**Performance Goals**: Dashboard loads in <2 seconds (SC-006)
**Constraints**: Online-only (requires internet), single-screen dashboard pattern
**Scale/Scope**: Single user per account, personal use

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Simplicity First** | ✅ PASS | |
| - YAGNI | ✅ | Building only specified features, no speculative additions |
| - Minimal Dependencies | ✅ | React + Supabase is minimal for auth + sync requirements |
| - No Premature Abstraction | ✅ | Will use flat component structure, extract only when needed |
| - Delete Over Deprecate | ✅ | N/A for new project |
| **II. Incremental Delivery** | ✅ PASS | |
| - Working Software | ✅ | Plan delivers in vertical slices (P1→P2→P3→P4) |
| - Vertical Slices | ✅ | Each user story is independently deployable |
| - Validate Early | ✅ | Core habit tracking first, gamification second |
| - Small PRs | ✅ | Tasks will be scoped to single concerns |
| **III. Pragmatic Testing** | ✅ PASS | |
| - Test Behavior | ✅ | Focus on user flows, not implementation |
| - Integration Over Unit | ✅ | Prioritize E2E tests for critical paths |
| - Manual Testing Valid | ✅ | UI animations tested manually |
| - No Test Theater | ✅ | Tests for real user scenarios only |
| **Technology Constraints** | ✅ PASS | |
| - TypeScript strict | ✅ | Enabled in tsconfig |
| - Standard tooling | ✅ | Vite is standard, minimal config |

**Gate Result**: PASS - No violations. Proceed to Phase 0.

### Post-Design Re-check (Phase 1)

| Area | Status | Notes |
|------|--------|-------|
| Data Model Complexity | ✅ | 5 tables, normalized, no over-engineering |
| Schema Size | ✅ | Minimal indexes, straightforward RLS policies |
| Client-side Logic | ✅ | Streak/points calc is simple, no premature optimization |
| Dependencies Added | ✅ | Only required: react-router-dom for routing |
| Abstractions | ✅ | Types file contains only necessary definitions |

**Post-Design Gate**: PASS - Design artifacts follow constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-gamified-habit-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Supabase schema)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/          # React components
│   ├── ui/              # Reusable UI primitives (Button, Input, etc.)
│   ├── habits/          # Habit-specific components
│   ├── gamification/    # Points, streaks, achievements display
│   └── auth/            # Login, signup, password reset forms
├── pages/               # Route-level components
│   ├── Dashboard.tsx    # Main single-screen dashboard
│   ├── Login.tsx        # Auth pages
│   ├── Signup.tsx
│   └── Settings.tsx     # Account settings, deletion
├── hooks/               # Custom React hooks
│   ├── useHabits.ts     # Habit CRUD operations
│   ├── useAuth.ts       # Authentication state
│   └── useGamification.ts # Points, achievements logic
├── lib/                 # Utilities and Supabase client
│   ├── supabase.ts      # Supabase client initialization
│   ├── types.ts         # TypeScript types/interfaces
│   └── utils.ts         # Helper functions (date, streak calc)
├── App.tsx              # Root component with routing
├── main.tsx             # Entry point
└── index.css            # Global styles (Tailwind)

tests/
├── e2e/                 # Playwright E2E tests
│   ├── auth.spec.ts     # Login/signup flows
│   └── habits.spec.ts   # Habit tracking flows
└── integration/         # Vitest integration tests
    └── hooks/           # Hook behavior tests

public/
└── manifest.json        # PWA manifest (optional)
```

**Structure Decision**: Frontend-only SPA using Supabase as Backend-as-a-Service. No separate backend directory needed since Supabase handles authentication, database, and real-time subscriptions. This is the simplest architecture that meets requirements.

## Complexity Tracking

No violations to justify - architecture follows all constitution principles.
