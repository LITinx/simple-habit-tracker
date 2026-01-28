# Data Model: Gamified Habit Tracker

**Phase**: 1 - Design | **Date**: 2026-01-29

## Entity Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │───┬───│    Habit    │───────│ Completion  │
│  (Supabase) │   │   └─────────────┘       └─────────────┘
└─────────────┘   │
                  ├───┌─────────────┐
                  │   │  Category   │
                  │   └─────────────┘
                  │
                  └───┌─────────────┐
                      │ Achievement │
                      └─────────────┘
```

## Entities

### User (Supabase Auth)

Managed by Supabase Auth. Extended with profile data.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK | Supabase auth.users.id |
| email | string | unique, not null | User's email address |
| created_at | timestamp | not null | Account creation time |

**Profile Extension** (profiles table):

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, FK→auth.users | Links to auth user |
| total_points | integer | default 0 | Accumulated points |
| timezone | string | nullable | User's preferred timezone (auto-detect) |
| created_at | timestamp | not null | Profile creation time |
| updated_at | timestamp | not null | Last update time |

### Habit

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| user_id | uuid | FK→profiles, not null | Owner of habit |
| name | string(100) | not null | Habit name (required) |
| description | string(500) | nullable | Optional description |
| frequency_type | enum | not null, default 'daily' | 'daily' or 'weekly' |
| frequency_value | integer | default 1 | Times per period (1-7 for weekly) |
| category_id | uuid | FK→categories, nullable | Optional category |
| motivation_note | string(200) | nullable | Personal why reminder |
| is_active | boolean | default true | Soft delete flag |
| created_at | timestamp | not null | Creation time |
| updated_at | timestamp | not null | Last update time |

**Validation Rules**:
- name: 1-100 characters, trimmed
- description: max 500 characters
- frequency_value: 1-7 when frequency_type is 'weekly', always 1 when 'daily'
- motivation_note: max 200 characters

### Completion

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| habit_id | uuid | FK→habits, not null | Which habit completed |
| user_id | uuid | FK→profiles, not null | Denormalized for RLS |
| completed_date | date | not null | Local date of completion |
| completed_at | timestamp | not null | Exact completion time (UTC) |
| created_at | timestamp | not null | Record creation time |

**Constraints**:
- Unique: (habit_id, completed_date) - one completion per habit per day
- completed_date must be within past 7 days (retroactive limit)

**Validation Rules**:
- Cannot mark same habit complete twice for same date (upsert/toggle)
- completed_date cannot be in the future

### Category

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| user_id | uuid | FK→profiles, not null | Owner |
| name | string(50) | not null | Category name |
| is_preset | boolean | default false | System preset vs user-created |
| created_at | timestamp | not null | Creation time |

**Preset Categories** (seeded on signup):
- Health
- Learning
- Productivity

**Validation Rules**:
- name: 1-50 characters, trimmed
- Unique: (user_id, name) - no duplicate names per user

### Achievement

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| user_id | uuid | FK→profiles, not null | Who earned it |
| achievement_type | enum | not null | Type of achievement |
| unlocked_at | timestamp | not null | When unlocked |

**Achievement Types** (enum):
- `first_habit` - Created first habit
- `streak_7` - 7-day streak on any habit
- `streak_30` - 30-day streak
- `streak_100` - 100-day streak
- `habits_10` - Created 10 habits
- `completions_100` - 100 total completions
- `completions_500` - 500 total completions
- `completions_1000` - 1000 total completions

**Constraints**:
- Unique: (user_id, achievement_type) - each achievement unlocked once

## Calculated Fields (Client-side)

These are not stored in the database but calculated on fetch:

### Streak (per habit)

```typescript
type Streak = {
  current: number;      // Consecutive days including today (if completed)
  longest: number;      // Historical best streak
  lastCompletedDate: Date | null;
}
```

**Calculation**:
1. Get all completions for habit ordered by completed_date DESC
2. Check if today is completed → start count at 1, else 0
3. Walk backwards checking each previous date is exactly 1 day before
4. Stop at first gap

### Points Breakdown (per completion)

```typescript
type PointsEarned = {
  base: number;         // Always 10
  streakBonus: number;  // +5 for each 7-day milestone
  total: number;        // base + streakBonus
}
```

**Calculation**:
- Base: 10 points
- Streak bonus: if current_streak % 7 === 0, add +5

## State Transitions

### Habit Lifecycle

```
Created → Active → (can be edited) → Deleted (soft delete: is_active=false)
```

### Completion Toggle

```
Not Completed Today → Complete (create completion record)
Completed Today → Not Complete (delete completion record)
```

### Achievement Unlock

```
Locked (not in table) → Check criteria → Unlocked (insert record)
```

Achievement checks triggered on:
- Habit creation → check `first_habit`, `habits_10`
- Completion toggle → check `completions_*`, `streak_*`

## Indexes

For query performance:

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| habits | idx_habits_user | user_id | List user's habits |
| completions | idx_completions_habit | habit_id | Streak calculation |
| completions | idx_completions_user_date | user_id, completed_date | Dashboard: today's completions |
| achievements | idx_achievements_user | user_id | List user's achievements |
