# Tasks: Gamified Habit Tracker

**Input**: Design documents from `/specs/001-gamified-habit-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - tests omitted per constitution (pragmatic testing). Manual testing documented in each phase checkpoint.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths relative to repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create Vite + React + Supabase project structure

- [x] T001 Initialize Vite project with React + TypeScript template using `npm create vite@latest . -- --template react-ts`
- [x] T002 Install core dependencies: `@supabase/supabase-js`, `react-router-dom`
- [x] T003 [P] Install and configure TailwindCSS with `tailwindcss`, `postcss`, `autoprefixer`
- [x] T004 [P] Create `.env.local` with Supabase URL and anon key placeholders
- [x] T005 [P] Configure TypeScript strict mode in `tsconfig.json`
- [x] T006 Create Supabase client in `src/lib/supabase.ts`
- [x] T007 Copy type definitions from `specs/001-gamified-habit-tracker/contracts/types.ts` to `src/lib/types.ts`

**Checkpoint**: `npm run dev` starts without errors, Tailwind classes work

---

## Phase 2: Foundational (Auth + Database Schema)

**Purpose**: Authentication and database infrastructure - BLOCKS all user stories

**⚠️ CRITICAL**: User story work cannot begin until this phase is complete

- [ ] T008 Run Supabase schema SQL from `specs/001-gamified-habit-tracker/contracts/supabase-schema.sql` in Supabase dashboard
- [x] T009 Create `src/hooks/useAuth.ts` with signup, login, logout, and session state
- [x] T010 [P] Create `src/components/auth/LoginForm.tsx` with email/password inputs and validation
- [x] T011 [P] Create `src/components/auth/SignupForm.tsx` with email/password inputs and confirmation
- [x] T012 [P] Create `src/components/auth/ForgotPasswordForm.tsx` with email input for password reset
- [x] T013 Create `src/pages/Login.tsx` combining LoginForm and link to signup
- [x] T014 [P] Create `src/pages/Signup.tsx` combining SignupForm and link to login
- [x] T015 Create `src/App.tsx` with React Router: public routes (login, signup) and protected routes (dashboard)
- [x] T016 Create auth guard component in `src/components/auth/ProtectedRoute.tsx`
- [x] T017 [P] Add offline indicator component in `src/components/ui/OfflineIndicator.tsx`
- [x] T018 Style auth pages with mobile-first Tailwind in `src/index.css`

**Checkpoint**: Can signup, login, logout. Protected routes redirect to login. Password reset email sends.

---

## Phase 3: User Story 1 - Create and Track Daily Habits (Priority: P1) 🎯 MVP

**Goal**: Users can create habits and mark them complete/incomplete for today

**Independent Test**: Create a habit named "Exercise", mark it complete, see checkmark. Refresh page, habit and completion persist.

### Implementation for User Story 1

- [x] T019 [US1] Create date utility functions in `src/lib/utils.ts`: `getLocalDateString()`, `isToday()`, `formatDate()`
- [x] T020 [US1] Create `src/hooks/useHabits.ts` with `fetchHabits()`, `createHabit()`, `toggleCompletion()` using Supabase
- [x] T021 [P] [US1] Create `src/components/habits/HabitCard.tsx` displaying habit name with completion toggle button
- [x] T022 [P] [US1] Create `src/components/habits/AddHabitForm.tsx` with name input (required) and description (optional)
- [x] T023 [P] [US1] Create `src/components/habits/EmptyState.tsx` for when user has no habits with CTA to add first
- [x] T024 [US1] Create `src/components/habits/HabitList.tsx` mapping habits to HabitCards with today's completion status
- [x] T025 [US1] Create `src/pages/Dashboard.tsx` with HabitList and AddHabitForm
- [x] T026 [US1] Add subtle checkmark animation CSS in `src/index.css` for completion toggle
- [x] T027 [US1] Wire Dashboard into App.tsx as protected home route

**Checkpoint**: Full habit CRUD works. Completions toggle and persist. Daily reset at midnight (manual verify by changing system time).

---

## Phase 4: User Story 2 - View Progress and Streaks (Priority: P2)

**Goal**: Users see current streak for each habit and can view completion history

**Independent Test**: Complete a habit for 3 days (use retroactive), see "3 day streak" badge. View calendar showing completion history.

### Implementation for User Story 2

- [x] T028 [US2] Add streak calculation functions to `src/lib/utils.ts`: `calculateStreak()`, `calculateLongestStreak()`
- [x] T029 [US2] Extend `useHabits.ts` to fetch completions and calculate streaks for each habit
- [x] T030 [US2] Update `HabitCard.tsx` to display current streak badge (flame icon + number)
- [x] T031 [P] [US2] Create `src/components/habits/HabitDetailModal.tsx` for viewing single habit details
- [x] T032 [P] [US2] Create `src/components/habits/CompletionCalendar.tsx` showing 4-week history grid with completion dots
- [x] T033 [US2] Add `src/hooks/useCompletions.ts` with `fetchCompletionsForHabit()` and `togglePastCompletion()` for retroactive edits
- [x] T034 [US2] Integrate HabitDetailModal into Dashboard - tap habit to see details with calendar
- [x] T035 [US2] Add retroactive completion toggle to calendar (past 7 days only) in CompletionCalendar.tsx

**Checkpoint**: Streaks calculate correctly. Calendar shows completion history. Can edit past 7 days. Streak breaks on missed day.

---

## Phase 5: User Story 3 - Earn Points and Achievements (Priority: P3)

**Goal**: Users earn points for completions and unlock achievement badges

**Independent Test**: Complete a habit, see points increase by 10. Reach 7-day streak, see "Week Warrior" badge unlock notification.

### Implementation for User Story 3

- [x] T036 [US3] Create `src/hooks/useGamification.ts` with `fetchUserPoints()`, `awardPoints()`, `checkAchievements()`
- [x] T037 [US3] Create `src/lib/achievements.ts` with achievement definitions and unlock criteria checkers
- [x] T038 [P] [US3] Create `src/components/gamification/PointsDisplay.tsx` showing total points in header
- [x] T039 [P] [US3] Create `src/components/gamification/AchievementBadge.tsx` showing badge icon, name, description
- [x] T040 [P] [US3] Create `src/components/gamification/AchievementNotification.tsx` for toast when achievement unlocks
- [x] T041 [US3] Create `src/components/gamification/AchievementsList.tsx` showing all badges (locked + unlocked)
- [x] T042 [US3] Integrate points calculation into completion toggle in `useHabits.ts` (10 base + streak bonus)
- [x] T043 [US3] Add achievement checking after habit creation and completion toggle
- [x] T044 [US3] Add PointsDisplay to Dashboard header
- [x] T045 [US3] Create expandable achievements section in Dashboard or Settings page

**Checkpoint**: Points accumulate correctly. All 8 achievement types unlock at correct milestones. Toast notification on unlock.

---

## Phase 6: User Story 4 - Personalize Habit Settings (Priority: P4)

**Goal**: Users can set frequency, categories, and motivation notes for habits

**Independent Test**: Edit habit to set weekly frequency (5x/week), assign "Health" category, add motivation note. Filter habits by category.

### Implementation for User Story 4

- [x] T046 [US4] Create `src/hooks/useCategories.ts` with `fetchCategories()`, `createCategory()`
- [x] T047 [P] [US4] Create `src/components/habits/CategoryPicker.tsx` dropdown with preset and custom categories
- [x] T048 [P] [US4] Create `src/components/habits/FrequencyPicker.tsx` for daily vs weekly (1-7 times) selection
- [x] T049 [US4] Extend AddHabitForm.tsx with frequency picker, category picker, motivation note input
- [x] T050 [US4] Create `src/components/habits/EditHabitModal.tsx` for editing existing habit details
- [x] T051 [US4] Add category filter to HabitList.tsx with filter chips for each category
- [x] T052 [US4] Display motivation note on HabitCard.tsx (shown on hover/tap)
- [x] T053 [US4] Update progress tracking to respect weekly frequency (show X/Y completed this week)
- [x] T054 [US4] Add soft delete (archive) functionality to EditHabitModal

**Checkpoint**: Can set all habit options. Category filter works. Weekly frequency tracks correctly. Archived habits hidden.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Account settings, error handling, and final polish

- [x] T055 Create `src/pages/Settings.tsx` with account section
- [x] T056 [P] Add account deletion confirmation modal in `src/components/auth/DeleteAccountModal.tsx`
- [x] T057 Implement account deletion calling `supabase.rpc('delete_user_account')` with redirect to login
- [x] T058 [P] Add loading states and skeleton UI to HabitList and Dashboard
- [x] T059 [P] Add error toast component in `src/components/ui/Toast.tsx` for API failures
- [x] T060 Add global error boundary in `src/components/ErrorBoundary.tsx`
- [x] T061 [P] Optimize Supabase queries: add appropriate select fields, avoid over-fetching
- [x] T062 Add Settings link to Dashboard header/menu
- [x] T063 Final mobile responsiveness pass on all pages
- [x] T064 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → [User Stories can run in parallel or sequential]
                                         ↓
                    ┌────────────────────┼────────────────────┐
                    ↓                    ↓                    ↓
              Phase 3 (US1)        Phase 4 (US2)        Phase 5 (US3)
                 MVP!                  ↓                    ↓
                    └────────────────────────────────────────┘
                                         ↓
                                   Phase 6 (US4)
                                         ↓
                                   Phase 7 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (P1) | Foundational only | Phase 2 complete |
| US2 (P2) | US1 (needs habits + completions) | Phase 3 complete |
| US3 (P3) | US1 (needs completions for points) | Phase 3 complete |
| US4 (P4) | US1 (extends habit features) | Phase 3 complete |

**Note**: US2, US3, US4 can run in parallel after US1, but US2 is recommended next for core motivation feature.

### Within Each User Story

1. Utility functions / hooks first
2. UI components (parallelizable)
3. Integration / wiring
4. Polish / animations

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T003, T004, T005 can run in parallel
```

**Phase 2 (Foundational)**:
```
T010, T011, T012 can run in parallel (auth forms)
T014, T017 can run in parallel
```

**Phase 3 (US1)**:
```
T021, T022, T023 can run in parallel (components)
```

**Phase 4 (US2)**:
```
T031, T032 can run in parallel (modal + calendar)
```

**Phase 5 (US3)**:
```
T038, T039, T040 can run in parallel (display components)
```

**Phase 6 (US4)**:
```
T047, T048 can run in parallel (pickers)
```

**Phase 7 (Polish)**:
```
T056, T058, T059, T061 can run in parallel
```

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# After T019-T020 complete, launch component tasks together:
Task: "Create HabitCard.tsx" [T021]
Task: "Create AddHabitForm.tsx" [T022]
Task: "Create EmptyState.tsx" [T023]

# Then sequential integration:
Task: "Create HabitList.tsx" [T024] - depends on T021, T023
Task: "Create Dashboard.tsx" [T025] - depends on T024, T022
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~30 min)
2. Complete Phase 2: Foundational (~2-3 hours)
3. Complete Phase 3: User Story 1 (~2 hours)
4. **STOP and VALIDATE**: Test habit creation and completion independently
5. **MVP DONE**: Can track habits daily with persistence

### Incremental Delivery

| Increment | Stories Included | New Value Delivered |
|-----------|------------------|---------------------|
| MVP | US1 | Create & track habits daily |
| v0.2 | +US2 | Streaks & history calendar |
| v0.3 | +US3 | Points & achievements |
| v1.0 | +US4 + Polish | Full personalization |

### Estimated Effort

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| Setup | 7 | 30 min |
| Foundational | 11 | 2-3 hours |
| US1 (MVP) | 9 | 2 hours |
| US2 | 8 | 2 hours |
| US3 | 10 | 2-3 hours |
| US4 | 9 | 2 hours |
| Polish | 10 | 1-2 hours |
| **Total** | **64** | **12-15 hours** |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story checkpoint validates independent functionality
- Commit after each task or logical group
- Manual testing preferred per constitution (pragmatic testing)
- Mobile-first: test on phone-sized viewport throughout
