/**
 * TypeScript types for Gamified Habit Tracker
 * Generated from data model - Phase 1
 */

// ============================================
// Database Types (match Supabase schema)
// ============================================

export type FrequencyType = 'daily' | 'weekly';

export type AchievementType =
  | 'first_habit'
  | 'streak_7'
  | 'streak_30'
  | 'streak_100'
  | 'habits_10'
  | 'completions_100'
  | 'completions_500'
  | 'completions_1000';

export interface Profile {
  id: string;
  total_points: number;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  is_preset: boolean;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency_type: FrequencyType;
  frequency_value: number;
  category_id: string | null;
  motivation_note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Completion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string; // YYYY-MM-DD format
  completed_at: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: AchievementType;
  unlocked_at: string;
}

// ============================================
// Input Types (for create/update operations)
// ============================================

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency_type?: FrequencyType;
  frequency_value?: number;
  category_id?: string;
  motivation_note?: string;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  frequency_type?: FrequencyType;
  frequency_value?: number;
  category_id?: string | null;
  motivation_note?: string | null;
  is_active?: boolean;
}

export interface CreateCategoryInput {
  name: string;
}

export interface ToggleCompletionInput {
  habit_id: string;
  completed_date: string; // YYYY-MM-DD format
}

// ============================================
// Computed Types (client-side calculations)
// ============================================

export interface Streak {
  current: number;
  longest: number;
  lastCompletedDate: string | null; // YYYY-MM-DD format
}

export interface PointsEarned {
  base: number;
  streakBonus: number;
  total: number;
}

export interface HabitWithStats extends Habit {
  streak: Streak;
  completedToday: boolean;
  completions: Completion[];
  category: Category | null;
}

// ============================================
// Achievement Metadata
// ============================================

export interface AchievementDefinition {
  type: AchievementType;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    type: 'first_habit',
    name: 'First Step',
    description: 'Created your first habit',
    icon: '🌱',
  },
  {
    type: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: '🔥',
  },
  {
    type: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintained a 30-day streak',
    icon: '💪',
  },
  {
    type: 'streak_100',
    name: 'Century Club',
    description: 'Maintained a 100-day streak',
    icon: '🏆',
  },
  {
    type: 'habits_10',
    name: 'Habit Builder',
    description: 'Created 10 habits',
    icon: '📋',
  },
  {
    type: 'completions_100',
    name: 'Centurion',
    description: 'Completed habits 100 times',
    icon: '⭐',
  },
  {
    type: 'completions_500',
    name: 'Dedication',
    description: 'Completed habits 500 times',
    icon: '🌟',
  },
  {
    type: 'completions_1000',
    name: 'Legendary',
    description: 'Completed habits 1000 times',
    icon: '👑',
  },
];

// ============================================
// Points Constants
// ============================================

export const POINTS = {
  BASE_COMPLETION: 10,
  STREAK_BONUS: 5,
  STREAK_MILESTONE: 7, // Bonus every 7 days
} as const;

// ============================================
// Validation Constants
// ============================================

export const LIMITS = {
  HABIT_NAME_MAX: 100,
  HABIT_DESCRIPTION_MAX: 500,
  MOTIVATION_NOTE_MAX: 200,
  CATEGORY_NAME_MAX: 50,
  RETROACTIVE_DAYS: 7,
  WEEKLY_FREQUENCY_MAX: 7,
} as const;
