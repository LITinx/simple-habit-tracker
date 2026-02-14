import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getLocalDateString, calculateStreak, calculateLongestStreak, isWithinDays } from '../lib/utils'
import { buildOptimisticCompletion, insertCompletion, deleteCompletion } from '../lib/completionsService'
import type { Habit, CreateHabitInput, UpdateHabitInput, Completion } from '../lib/types'

export interface HabitWithStats extends Habit {
  completedToday: boolean
  currentStreak: number
  longestStreak: number
  completions: Completion[]
}

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userIdRef = useRef<string | null>(null)

  const today = getLocalDateString()

  const withComputedStats = useCallback((habit: HabitWithStats, completions: Completion[]): HabitWithStats => {
    const completionDates = completions.map(c => c.completed_date)
    return {
      ...habit,
      completedToday: completionDates.includes(today),
      currentStreak: calculateStreak(completionDates),
      longestStreak: calculateLongestStreak(completionDates),
      completions,
    }
  }, [today])

  const getCurrentUserId = useCallback(async (): Promise<string> => {
    if (userIdRef.current) return userIdRef.current

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    userIdRef.current = user.id
    return user.id
  }, [])

  const fetchHabits = useCallback(async () => {
    try {
      setError(null)

      // Fetch active habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (habitsError) throw habitsError

      // Fetch all completions for streak calculation
      const { data: completionsData, error: completionsError } = await supabase
        .from('completions')
        .select('*')
        .order('completed_date', { ascending: false })

      if (completionsError) throw completionsError

      // Group completions by habit_id
      const completionsByHabit = new Map<string, Completion[]>()
      for (const completion of completionsData || []) {
        const existing = completionsByHabit.get(completion.habit_id) || []
        existing.push(completion)
        completionsByHabit.set(completion.habit_id, existing)
      }

      const habitsWithStats: HabitWithStats[] = (habitsData || []).map(habit => {
        const habitCompletions = completionsByHabit.get(habit.id) || []
        const completionDates = habitCompletions.map(c => c.completed_date)

        return {
          ...habit,
          completedToday: completionDates.includes(today),
          currentStreak: calculateStreak(completionDates),
          longestStreak: calculateLongestStreak(completionDates),
          completions: habitCompletions,
        }
      })

      setHabits(habitsWithStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch habits')
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const createHabit = async (input: CreateHabitInput): Promise<Habit | null> => {
    try {
      setError(null)

      const userId = await getCurrentUserId()

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: input.name.trim(),
          description: input.description?.trim() || null,
          frequency_type: input.frequency_type || 'daily',
          frequency_value: input.frequency_value || 1,
          category_id: input.category_id || null,
          motivation_note: input.motivation_note?.trim() || null,
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state with initial stats
      setHabits(prev => [...prev, {
        ...data,
        completedToday: false,
        currentStreak: 0,
        longestStreak: 0,
        completions: [],
      }])

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit')
      return null
    }
  }

  const toggleCompletionAtDate = async (habitId: string, date: string): Promise<boolean> => {
    if (date > today || !isWithinDays(date, 7)) {
      setError('Can only edit completions from the past 7 days')
      return false
    }

    const habit = habits.find(h => h.id === habitId)
    if (!habit) return false

    const wasCompleted = habit.completions.some(c => c.completed_date === date)
    const previousHabit = habit

    try {
      setError(null)

      if (wasCompleted) {
        const optimisticCompletions = habit.completions.filter(c => c.completed_date !== date)
        setHabits(prev => prev.map(h => (h.id === habitId ? withComputedStats(h, optimisticCompletions) : h)))
        await deleteCompletion({ habitId, completedDate: date })
      } else {
        const tempCompletion = buildOptimisticCompletion(habitId, habit.user_id, date)
        const optimisticCompletions = [tempCompletion, ...habit.completions]
        setHabits(prev => prev.map(h => (h.id === habitId ? withComputedStats(h, optimisticCompletions) : h)))

        const userId = await getCurrentUserId()
        await insertCompletion({ habitId, userId, completedDate: date })
      }

      return true
    } catch (err) {
      setHabits(prev => prev.map(h => (h.id === habitId ? previousHabit : h)))
      setError(err instanceof Error ? err.message : 'Failed to toggle completion')
      return false
    }
  }

  const toggleCompletion = async (habitId: string): Promise<boolean> => toggleCompletionAtDate(habitId, today)

  const toggleCompletionForDate = async (habitId: string, date: string): Promise<boolean> =>
    toggleCompletionAtDate(habitId, date)

  const updateHabit = async (habitId: string, input: UpdateHabitInput): Promise<boolean> => {
    try {
      setError(null)

      const { error } = await supabase
        .from('habits')
        .update({
          ...(input.name !== undefined && { name: input.name.trim() }),
          ...(input.description !== undefined && { description: input.description?.trim() || null }),
          ...(input.frequency_type !== undefined && { frequency_type: input.frequency_type }),
          ...(input.frequency_value !== undefined && { frequency_value: input.frequency_value }),
          ...(input.category_id !== undefined && { category_id: input.category_id }),
          ...(input.motivation_note !== undefined && { motivation_note: input.motivation_note?.trim() || null }),
          ...(input.is_active !== undefined && { is_active: input.is_active }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', habitId)

      if (error) throw error

      // Update local state
      setHabits(prev =>
        prev.map(h => {
          if (h.id !== habitId) return h
          return {
            ...h,
            ...(input.name !== undefined && { name: input.name.trim() }),
            ...(input.description !== undefined && { description: input.description?.trim() || null }),
            ...(input.frequency_type !== undefined && { frequency_type: input.frequency_type }),
            ...(input.frequency_value !== undefined && { frequency_value: input.frequency_value }),
            ...(input.category_id !== undefined && { category_id: input.category_id }),
            ...(input.motivation_note !== undefined && { motivation_note: input.motivation_note?.trim() || null }),
          }
        })
      )

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habit')
      return false
    }
  }

  const deleteHabit = async (habitId: string): Promise<boolean> => {
    try {
      setError(null)

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId)

      if (error) throw error

      // Remove from local state
      setHabits(prev => prev.filter(h => h.id !== habitId))

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete habit')
      return false
    }
  }

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    toggleCompletion,
    toggleCompletionForDate,
    deleteHabit,
    refetch: fetchHabits,
  }
}
