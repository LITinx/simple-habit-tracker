import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getLocalDateString, calculateStreak, calculateLongestStreak } from '../lib/utils'
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

  const today = getLocalDateString()

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

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
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

  const toggleCompletion = async (habitId: string): Promise<boolean> => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return false

    try {
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (habit.completedToday) {
        // Delete completion
        const { error } = await supabase
          .from('completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_date', today)

        if (error) throw error

        // Update local state
        setHabits(prev =>
          prev.map(h => {
            if (h.id !== habitId) return h
            const newCompletions = h.completions.filter(c => c.completed_date !== today)
            const newDates = newCompletions.map(c => c.completed_date)
            return {
              ...h,
              completedToday: false,
              currentStreak: calculateStreak(newDates),
              completions: newCompletions,
            }
          })
        )
      } else {
        // Create completion
        const { data, error } = await supabase
          .from('completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            completed_date: today,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error

        // Update local state
        setHabits(prev =>
          prev.map(h => {
            if (h.id !== habitId) return h
            const newCompletions = [data, ...h.completions]
            const newDates = newCompletions.map(c => c.completed_date)
            return {
              ...h,
              completedToday: true,
              currentStreak: calculateStreak(newDates),
              longestStreak: Math.max(h.longestStreak, calculateStreak(newDates)),
              completions: newCompletions,
            }
          })
        )
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle completion')
      return false
    }
  }

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
    deleteHabit,
    refetch: fetchHabits,
  }
}
