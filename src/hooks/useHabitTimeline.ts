import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentUserId } from '../queries/habits'
import type { CreateHabitTimelineEntryInput, HabitTimelineEntry } from '../lib/types'

interface TimelineUpsertContext {
  previousEntries?: HabitTimelineEntry[]
  queryKey?: readonly unknown[]
}

interface TimelineDeleteContext {
  previousEntries?: HabitTimelineEntry[]
  queryKey?: readonly unknown[]
}

export function useHabitTimeline() {
  const queryClient = useQueryClient()
  const [currentHabitId, setCurrentHabitId] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const timelineQuery = useQuery({
    queryKey: currentHabitId ? ['habit-timeline', currentHabitId] : ['habit-timeline'],
    queryFn: async (): Promise<HabitTimelineEntry[]> => {
      if (!currentHabitId) return []

      const { data, error: fetchError } = await supabase
        .from('habit_timeline_entries')
        .select('*')
        .eq('habit_id', currentHabitId)
        .order('entry_date', { ascending: false })
        .limit(60)

      if (fetchError) throw fetchError
      return (data || []) as HabitTimelineEntry[]
    },
    enabled: Boolean(currentHabitId),
  })

  const fetchEntries = async (habitId: string): Promise<void> => {
    setMutationError(null)
    setCurrentHabitId(habitId)
    await queryClient.invalidateQueries({ queryKey: ['habit-timeline', habitId] })
  }

  const upsertEntryMutation = useMutation<HabitTimelineEntry, unknown, CreateHabitTimelineEntryInput, TimelineUpsertContext>({
    mutationFn: async (input) => {
      const note = input.note?.trim() || null
      const userId = await getCurrentUserId()

      const { data, error: upsertError } = await supabase
        .from('habit_timeline_entries')
        .upsert({
          habit_id: input.habit_id,
          user_id: userId,
          entry_date: input.entry_date,
          rating: input.rating,
          note,
        }, { onConflict: 'habit_id,entry_date' })
        .select()
        .single()

      if (upsertError) throw upsertError
      return data as HabitTimelineEntry
    },
    onMutate: async (input) => {
      setMutationError(null)
      const queryKey = ['habit-timeline', input.habit_id] as const
      await queryClient.cancelQueries({ queryKey })

      const previousEntries = queryClient.getQueryData<HabitTimelineEntry[]>(queryKey)
      const note = input.note?.trim() || null
      const userId = await getCurrentUserId()
      const tempEntry: HabitTimelineEntry = {
        id: `temp-${Date.now()}`,
        habit_id: input.habit_id,
        user_id: userId,
        entry_date: input.entry_date,
        rating: input.rating,
        note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const baseEntries = previousEntries || []
      const withoutSameDate = baseEntries.filter(entry => entry.entry_date !== input.entry_date)
      const optimisticEntries = [tempEntry, ...withoutSameDate].sort((a, b) => b.entry_date.localeCompare(a.entry_date))
      queryClient.setQueryData(queryKey, optimisticEntries)

      return { previousEntries, queryKey }
    },
    onError: (error, _input, context) => {
      if (context?.previousEntries && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousEntries)
      }

      setMutationError(error instanceof Error ? error.message : 'Failed to save timeline entry')
    },
    onSuccess: (savedEntry, input) => {
      const queryKey = ['habit-timeline', input.habit_id] as const
      const currentEntries = queryClient.getQueryData<HabitTimelineEntry[]>(queryKey) || []
      const filtered = currentEntries.filter(entry => entry.entry_date !== savedEntry.entry_date)
      queryClient.setQueryData(queryKey, [savedEntry, ...filtered].sort((a, b) => b.entry_date.localeCompare(a.entry_date)))
    },
    onSettled: async (_result, _error, input) => {
      await queryClient.invalidateQueries({ queryKey: ['habit-timeline', input.habit_id] })
    },
  })

  const deleteEntryMutation = useMutation<void, unknown, { entryId: string; habitId: string }, TimelineDeleteContext>({
    mutationFn: async ({ entryId }) => {
      const { error: deleteError } = await supabase
        .from('habit_timeline_entries')
        .delete()
        .eq('id', entryId)

      if (deleteError) throw deleteError
    },
    onMutate: async ({ entryId, habitId }) => {
      setMutationError(null)
      const queryKey = ['habit-timeline', habitId] as const
      await queryClient.cancelQueries({ queryKey })

      const previousEntries = queryClient.getQueryData<HabitTimelineEntry[]>(queryKey)
      if (previousEntries) {
        queryClient.setQueryData(
          queryKey,
          previousEntries.filter(entry => entry.id !== entryId)
        )
      }

      return { previousEntries, queryKey }
    },
    onError: (error, _variables, context) => {
      if (context?.previousEntries && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousEntries)
      }

      setMutationError(error instanceof Error ? error.message : 'Failed to delete timeline entry')
    },
    onSettled: async (_result, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['habit-timeline', variables.habitId] })
    },
  })

  const upsertEntry = async (input: CreateHabitTimelineEntryInput): Promise<boolean> => {
    try {
      await upsertEntryMutation.mutateAsync(input)
      return true
    } catch {
      return false
    }
  }

  const deleteEntry = async (entryId: string): Promise<boolean> => {
    const habitId = currentHabitId
    if (!habitId) return false

    try {
      await deleteEntryMutation.mutateAsync({ entryId, habitId })
      return true
    } catch {
      return false
    }
  }

  return {
    entries: timelineQuery.data ?? [],
    loading: Boolean(currentHabitId) && timelineQuery.isPending,
    error: mutationError ?? (timelineQuery.error instanceof Error ? timelineQuery.error.message : null),
    fetchEntries,
    upsertEntry,
    deleteEntry,
  }
}
