import { supabase } from '../lib/supabase'
import type { Completion, Habit } from '../lib/types'

export interface HabitWithStatsLike extends Habit {
  completedToday: boolean
  currentStreak: number
  longestStreak: number
  completions: Completion[]
}

type ComputeHabitStats = (
  habit: HabitWithStatsLike,
  completions: Completion[]
) => HabitWithStatsLike

let cachedUserId: string | null = null
let authListenerInitialized = false

function ensureAuthCacheSync() {
  if (authListenerInitialized) return

  authListenerInitialized = true
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedUserId = session?.user?.id ?? null
  })
}

export const habitsKeys = {
  all: ['habits'] as const,
  list: (userId: string) => ['habits', userId] as const,
}

export async function getCurrentUserId(): Promise<string> {
  ensureAuthCacheSync()

  if (cachedUserId) return cachedUserId

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('Not authenticated')

  cachedUserId = user.id
  return user.id
}

export async function fetchHabitsWithCompletions(
  userId: string,
  withComputedStats: ComputeHabitStats
): Promise<HabitWithStatsLike[]> {
  const { data: habitsData, error: habitsError } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (habitsError) throw habitsError

  const habitIds = (habitsData || []).map((habit) => habit.id)
  let completionsData: Completion[] = []

  if (habitIds.length > 0) {
    const { data, error: completionsError } = await supabase
      .from('completions')
      .select('*')
      .in('habit_id', habitIds)
      .order('completed_date', { ascending: false })

    if (completionsError) throw completionsError
    completionsData = data || []
  }

  const completionsByHabit = new Map<string, Completion[]>()
  for (const completion of completionsData) {
    const existing = completionsByHabit.get(completion.habit_id) || []
    existing.push(completion)
    completionsByHabit.set(completion.habit_id, existing)
  }

  return (habitsData || []).map((habit) => {
    const habitCompletions = completionsByHabit.get(habit.id) || []

    return withComputedStats(
      {
        ...habit,
        completedToday: false,
        currentStreak: 0,
        longestStreak: 0,
        completions: [],
      },
      habitCompletions
    )
  })
}
