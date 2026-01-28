import type { AchievementType, AchievementDefinition } from './types'

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
]

export function getAchievementDefinition(type: AchievementType): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find(a => a.type === type)
}

export interface AchievementCheckResult {
  type: AchievementType
  shouldUnlock: boolean
}

/**
 * Check which achievements should be unlocked based on current stats
 */
export function checkAchievements(
  stats: {
    totalHabits: number
    totalCompletions: number
    maxStreak: number
  },
  unlockedTypes: Set<AchievementType>
): AchievementCheckResult[] {
  const results: AchievementCheckResult[] = []

  // First habit
  if (stats.totalHabits >= 1 && !unlockedTypes.has('first_habit')) {
    results.push({ type: 'first_habit', shouldUnlock: true })
  }

  // 10 habits
  if (stats.totalHabits >= 10 && !unlockedTypes.has('habits_10')) {
    results.push({ type: 'habits_10', shouldUnlock: true })
  }

  // Streak milestones
  if (stats.maxStreak >= 7 && !unlockedTypes.has('streak_7')) {
    results.push({ type: 'streak_7', shouldUnlock: true })
  }
  if (stats.maxStreak >= 30 && !unlockedTypes.has('streak_30')) {
    results.push({ type: 'streak_30', shouldUnlock: true })
  }
  if (stats.maxStreak >= 100 && !unlockedTypes.has('streak_100')) {
    results.push({ type: 'streak_100', shouldUnlock: true })
  }

  // Completion milestones
  if (stats.totalCompletions >= 100 && !unlockedTypes.has('completions_100')) {
    results.push({ type: 'completions_100', shouldUnlock: true })
  }
  if (stats.totalCompletions >= 500 && !unlockedTypes.has('completions_500')) {
    results.push({ type: 'completions_500', shouldUnlock: true })
  }
  if (stats.totalCompletions >= 1000 && !unlockedTypes.has('completions_1000')) {
    results.push({ type: 'completions_1000', shouldUnlock: true })
  }

  return results
}

/**
 * Calculate points for a completion
 */
export function calculatePoints(currentStreak: number): { base: number; bonus: number; total: number } {
  const base = 10
  // Bonus at every 7-day streak milestone
  const bonus = currentStreak > 0 && currentStreak % 7 === 0 ? 5 : 0
  return { base, bonus, total: base + bonus }
}
