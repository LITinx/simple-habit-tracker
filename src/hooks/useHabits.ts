import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  getLocalDateString,
  calculateStreak,
  calculateLongestStreak,
  calculateWeeklyStreak,
  calculateLongestWeeklyStreak,
  calculateWeeklyStreakCompletions,
  calculateLongestWeeklyStreakCompletions,
  isWithinDays,
} from '../lib/utils'
import { buildOptimisticCompletion, insertCompletion, deleteCompletion } from '../lib/completionsService'
import { DEFAULT_PROGRESS_QUESTION } from '../lib/types'
import { fetchHabitsWithCompletions, getCurrentUserId, habitsKeys } from '../queries/habits'
import type { Habit, CreateHabitInput, UpdateHabitInput, Completion } from '../lib/types'

export interface HabitWithStats extends Habit {
  completedToday: boolean
  currentStreak: number
  longestStreak: number
  completions: Completion[]
}

interface ToggleCompletionVariables {
  habitId: string
  date: string
  wasCompleted: boolean
  habitUserId: string
}

interface ToggleCompletionContext {
  previousHabits?: HabitWithStats[]
  queryKey?: readonly unknown[]
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function useHabits() {
  const queryClient = useQueryClient()
  const [mutationError, setMutationError] = useState<string | null>(null)
  const today = getLocalDateString()

  const withComputedStats = useCallback((habit: HabitWithStats, completions: Completion[]): HabitWithStats => {
    const completionDates = completions.map(c => c.completed_date)
    const isWeekly = habit.frequency_type === 'weekly'
    const targetPerWeek = isWeekly ? habit.frequency_value : 1
    const weeklyMode = habit.weekly_streak_mode || 'days'

    return {
      ...habit,
      completedToday: completionDates.includes(today),
      currentStreak: isWeekly
        ? (weeklyMode === 'weeks'
          ? calculateWeeklyStreak(completionDates, targetPerWeek)
          : calculateWeeklyStreakCompletions(completionDates, targetPerWeek))
        : calculateStreak(completionDates),
      longestStreak: isWeekly
        ? (weeklyMode === 'weeks'
          ? calculateLongestWeeklyStreak(completionDates, targetPerWeek)
          : calculateLongestWeeklyStreakCompletions(completionDates, targetPerWeek))
        : calculateLongestStreak(completionDates),
      completions,
    }
  }, [today])

  const userIdQuery = useQuery({
    queryKey: ['auth', 'user-id'],
    queryFn: getCurrentUserId,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const userId = userIdQuery.data

  const habitsQuery = useQuery({
    queryKey: userId ? habitsKeys.list(userId) : habitsKeys.all,
    queryFn: async () => {
      if (!userId) throw new Error('Not authenticated')
      return fetchHabitsWithCompletions(userId, withComputedStats) as Promise<HabitWithStats[]>
    },
    enabled: Boolean(userId),
  })

  const habits = useMemo(() => habitsQuery.data ?? [], [habitsQuery.data])

  const createHabitMutation = useMutation({
    mutationFn: async (input: CreateHabitInput): Promise<Habit> => {
      const currentUserId = userId ?? await getCurrentUserId()
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: currentUserId,
          name: input.name.trim(),
          description: input.description?.trim() || null,
          frequency_type: input.frequency_type || 'daily',
          frequency_value: input.frequency_value || 1,
          weekly_streak_mode: input.weekly_streak_mode || 'days',
          category_id: input.category_id || null,
          motivation_note: input.motivation_note?.trim() || null,
          progress_question: input.progress_question?.trim() || DEFAULT_PROGRESS_QUESTION,
        })
        .select()
        .single()

      if (error) throw error
      return data as Habit
    },
    onMutate: () => {
      setMutationError(null)
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, 'Failed to create habit'))
    },
    onSuccess: async () => {
      const currentUserId = userId ?? await getCurrentUserId()
      await queryClient.invalidateQueries({ queryKey: habitsKeys.list(currentUserId) })
    },
  })

  const updateHabitMutation = useMutation({
    mutationFn: async ({ habitId, input }: { habitId: string; input: UpdateHabitInput }): Promise<void> => {
      const { error } = await supabase
        .from('habits')
        .update({
          ...(input.name !== undefined && { name: input.name.trim() }),
          ...(input.description !== undefined && { description: input.description?.trim() || null }),
          ...(input.frequency_type !== undefined && { frequency_type: input.frequency_type }),
          ...(input.frequency_value !== undefined && { frequency_value: input.frequency_value }),
          ...(input.weekly_streak_mode !== undefined && { weekly_streak_mode: input.weekly_streak_mode }),
          ...(input.category_id !== undefined && { category_id: input.category_id }),
          ...(input.motivation_note !== undefined && { motivation_note: input.motivation_note?.trim() || null }),
          ...(input.progress_question !== undefined && { progress_question: input.progress_question?.trim() || null }),
          ...(input.is_active !== undefined && { is_active: input.is_active }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', habitId)

      if (error) throw error
    },
    onMutate: () => {
      setMutationError(null)
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, 'Failed to update habit'))
    },
    onSuccess: async () => {
      const currentUserId = userId ?? await getCurrentUserId()
      await queryClient.invalidateQueries({ queryKey: habitsKeys.list(currentUserId) })
    },
  })

  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: string): Promise<void> => {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId)

      if (error) throw error
    },
    onMutate: () => {
      setMutationError(null)
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, 'Failed to delete habit'))
    },
    onSuccess: async () => {
      const currentUserId = userId ?? await getCurrentUserId()
      await queryClient.invalidateQueries({ queryKey: habitsKeys.list(currentUserId) })
    },
  })

  const toggleCompletionMutation = useMutation<void, unknown, ToggleCompletionVariables, ToggleCompletionContext>({
    mutationFn: async ({ habitId, date, wasCompleted }) => {
      if (wasCompleted) {
        await deleteCompletion({ habitId, completedDate: date })
        return
      }

      const currentUserId = userId ?? await getCurrentUserId()
      await insertCompletion({ habitId, userId: currentUserId, completedDate: date })
    },
    onMutate: async ({ habitId, date, wasCompleted, habitUserId }) => {
      setMutationError(null)
      const currentUserId = userId ?? await getCurrentUserId()
      const queryKey = habitsKeys.list(currentUserId)

      await queryClient.cancelQueries({ queryKey })
      const previousHabits = queryClient.getQueryData<HabitWithStats[]>(queryKey)
      if (!previousHabits) return { previousHabits, queryKey }

      const updatedHabits = previousHabits.map((habit) => {
        if (habit.id !== habitId) return habit

        const optimisticCompletions = wasCompleted
          ? habit.completions.filter((completion) => completion.completed_date !== date)
          : [buildOptimisticCompletion(habitId, habitUserId, date), ...habit.completions]

        return withComputedStats(habit, optimisticCompletions)
      })

      queryClient.setQueryData(queryKey, updatedHabits)
      return { previousHabits, queryKey }
    },
    onError: (error, _variables, context) => {
      if (context?.previousHabits && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousHabits)
      }

      setMutationError(getErrorMessage(error, 'Failed to toggle completion'))
    },
    onSettled: async () => {
      const currentUserId = userId ?? await getCurrentUserId()
      await queryClient.invalidateQueries({ queryKey: habitsKeys.list(currentUserId) })
    },
  })

  const createHabit = async (input: CreateHabitInput): Promise<Habit | null> => {
    try {
      return await createHabitMutation.mutateAsync(input)
    } catch {
      return null
    }
  }

  const updateHabit = async (habitId: string, input: UpdateHabitInput): Promise<boolean> => {
    try {
      await updateHabitMutation.mutateAsync({ habitId, input })
      return true
    } catch {
      return false
    }
  }

  const deleteHabit = async (habitId: string): Promise<boolean> => {
    try {
      await deleteHabitMutation.mutateAsync(habitId)
      return true
    } catch {
      return false
    }
  }

  const toggleCompletionAtDate = async (habitId: string, date: string): Promise<boolean> => {
    if (date > today || !isWithinDays(date, 7)) {
      setMutationError('Can only edit completions from the past 7 days')
      return false
    }

    const habit = habits.find((existingHabit) => existingHabit.id === habitId)
    if (!habit) return false

    const wasCompleted = habit.completions.some((completion) => completion.completed_date === date)

    try {
      await toggleCompletionMutation.mutateAsync({
        habitId,
        date,
        wasCompleted,
        habitUserId: habit.user_id,
      })
      return true
    } catch {
      return false
    }
  }

  const toggleCompletion = async (habitId: string): Promise<boolean> => toggleCompletionAtDate(habitId, today)

  const toggleCompletionForDate = async (habitId: string, date: string): Promise<boolean> =>
    toggleCompletionAtDate(habitId, date)

  const refetch = async (): Promise<void> => {
    if (!userId) return
    await queryClient.invalidateQueries({ queryKey: habitsKeys.list(userId) })
  }

  return {
    habits,
    loading: userIdQuery.isPending || habitsQuery.isPending,
    error: mutationError
      ?? (habitsQuery.error instanceof Error ? habitsQuery.error.message : null)
      ?? (userIdQuery.error instanceof Error ? userIdQuery.error.message : null),
    createHabit,
    updateHabit,
    toggleCompletion,
    toggleCompletionForDate,
    deleteHabit,
    refetch,
  }
}
