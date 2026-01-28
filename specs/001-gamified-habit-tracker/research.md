# Research: Gamified Habit Tracker

**Phase**: 0 - Research | **Date**: 2026-01-29

## Technology Decisions

### 1. Frontend Framework: React + Vite

**Decision**: React 18 with Vite 5 as build tool

**Rationale**:
- User specified this stack
- Vite provides fast HMR and simple configuration (aligns with Constitution: standard tooling)
- React 18 has mature ecosystem and Supabase official client support
- TypeScript first-class support in both

**Alternatives Considered**:
- Next.js: Overkill for SPA, adds SSR complexity we don't need (online-only app)
- Plain React + Webpack: Vite is simpler and faster

### 2. Backend-as-a-Service: Supabase

**Decision**: Supabase for auth, database, and real-time

**Rationale**:
- User specified this stack
- Provides all backend needs in one service: PostgreSQL, Auth, Real-time subscriptions
- Row Level Security (RLS) handles authorization at database level
- No custom backend code needed (aligns with Constitution: simplicity)
- Official React/JS SDK available

**Alternatives Considered**:
- Firebase: Proprietary, NoSQL (less flexible for relational data like habits/completions)
- Custom backend: Unnecessary complexity for personal app

### 3. Styling: TailwindCSS

**Decision**: TailwindCSS for utility-first styling

**Rationale**:
- Mobile-first responsive design built-in
- Minimal configuration, works out of the box with Vite
- No component library needed for minimalistic UI
- Small bundle size with purging

**Alternatives Considered**:
- CSS Modules: More boilerplate for simple UI
- Styled Components: Runtime overhead, more complex
- UI libraries (MUI, Chakra): Overkill for minimalistic design, harder to customize

### 4. State Management

**Decision**: React hooks + Supabase real-time subscriptions (no external state library)

**Rationale**:
- App is simple enough that React's built-in state is sufficient
- Supabase handles server state and real-time sync
- Avoids complexity of Redux, Zustand, etc. (Constitution: YAGNI)

**Alternatives Considered**:
- TanStack Query: Useful for caching, but Supabase client handles this
- Redux: Way too complex for this scope
- Zustand: Nice but unnecessary when React hooks suffice

### 5. Testing Strategy

**Decision**: Vitest for unit/integration, Playwright for E2E

**Rationale**:
- Vitest integrates natively with Vite, same config
- Playwright for critical user flows (Constitution: integration over unit)
- Focus on behavior testing, not implementation

**Testing Priorities**:
1. E2E: Auth flow (login, signup, logout)
2. E2E: Create habit and mark complete
3. E2E: Streak calculation after multi-day completions
4. Integration: useHabits hook CRUD operations
5. Manual: Animations and visual feedback

### 6. Date/Time Handling

**Decision**: Native JavaScript Date API + user timezone from browser

**Rationale**:
- Simple enough for streak calculations
- No external library needed (day.js, date-fns)
- Store UTC in database, convert to local for display
- Daily reset based on user's local midnight

**Key Considerations**:
- Completions stored with UTC timestamp
- Streak calculation: group completions by local date
- "Today" determined by user's browser timezone

### 7. Authentication Flow

**Decision**: Supabase Auth with email/password

**Rationale**:
- Supabase Auth handles secure password storage, email verification
- Built-in password reset via email
- Session management handled by Supabase client

**Implementation Notes**:
- Use `supabase.auth.signUp()` for registration
- Use `supabase.auth.signInWithPassword()` for login
- Use `supabase.auth.resetPasswordForEmail()` for password reset
- Session persisted in localStorage by Supabase client

### 8. Database Schema Design

**Decision**: Normalized tables with RLS policies

**Key Tables**:
- `users` (managed by Supabase Auth)
- `habits` (user_id FK, name, description, frequency, category, etc.)
- `completions` (habit_id FK, completed_at timestamp)
- `achievements` (user_id FK, achievement_type, unlocked_at)
- `categories` (user_id FK, name) - optional custom categories

**RLS Strategy**:
- All tables have policies: `auth.uid() = user_id`
- Users can only read/write their own data
- Cascade delete when user deletes account

### 9. Streak Calculation

**Decision**: Calculate on client from completion history

**Rationale**:
- Simpler than database triggers/functions
- Completion history already fetched for calendar view
- Small data volume (personal use) makes client-side calc fast

**Algorithm**:
1. Fetch all completions for habit
2. Group by local date
3. Walk backwards from today counting consecutive days
4. Stop at first gap or beginning of data

### 10. Points and Achievements

**Decision**: Calculate points on completion, check achievements periodically

**Points Formula**:
- Base: 10 points per completion
- Streak bonus: +5 points at each 7-day streak milestone (7, 14, 21, etc.)

**Achievement Milestones** (from spec):
- First habit created
- 7-day streak, 30-day streak, 100-day streak
- 10 habits tracked
- 100 completions, 500 completions, 1000 completions

**Implementation**:
- Store total_points on user profile
- Update on each completion
- Check achievement criteria after each action
- Store unlocked achievements in achievements table

## Resolved Clarifications

All technical decisions resolved. No NEEDS CLARIFICATION items remain.

## Next Phase

Proceed to Phase 1: Data Model and Contracts
