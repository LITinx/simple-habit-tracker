import { useCallback, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CreateHabitTimelineEntryInput, HabitTimelineEntry } from '../lib/types'

export function useHabitTimeline() {
  const [entries, setEntries] = useState<HabitTimelineEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentHabitIdRef = useRef<string | null>(null)

  const fetchEntries = useCallback(async (habitId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      currentHabitIdRef.current = habitId

      const { data, error: fetchError } = await supabase
        .from('habit_timeline_entries')
        .select('*')
        .eq('habit_id', habitId)
        .order('entry_date', { ascending: false })
        .limit(60)

      if (fetchError) throw fetchError
      setEntries((data || []) as HabitTimelineEntry[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline entries')
    } finally {
      setLoading(false)
    }
  }, [])

  const upsertEntry = useCallback(async (input: CreateHabitTimelineEntryInput): Promise<boolean> => {
    const note = input.note?.trim() || null

    try {
      setError(null)

      const { data: authData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!authData.user) throw new Error('Not authenticated')

      const tempEntry: HabitTimelineEntry = {
        id: `temp-${Date.now()}`,
        habit_id: input.habit_id,
        user_id: authData.user.id,
        entry_date: input.entry_date,
        rating: input.rating,
        note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const previousEntries = entries
      const withoutSameDate = previousEntries.filter(entry => entry.entry_date !== input.entry_date)
      const optimisticEntries = [tempEntry, ...withoutSameDate].sort((a, b) => b.entry_date.localeCompare(a.entry_date))
      setEntries(optimisticEntries)

      const { data, error: upsertError } = await supabase
        .from('habit_timeline_entries')
        .upsert({
          habit_id: input.habit_id,
          user_id: authData.user.id,
          entry_date: input.entry_date,
          rating: input.rating,
          note,
        }, { onConflict: 'habit_id,entry_date' })
        .select()
        .single()

      if (upsertError) throw upsertError

      setEntries(prev => {
        const filtered = prev.filter(entry => entry.entry_date !== data.entry_date)
        return [data as HabitTimelineEntry, ...filtered].sort((a, b) => b.entry_date.localeCompare(a.entry_date))
      })

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save timeline entry')
      if (currentHabitIdRef.current === input.habit_id) {
        await fetchEntries(input.habit_id)
      }
      return false
    }
  }, [entries, fetchEntries])

  const deleteEntry = useCallback(async (entryId: string): Promise<boolean> => {
    const previousEntries = entries
    const entryToDelete = previousEntries.find(entry => entry.id === entryId)
    if (!entryToDelete) return false

    try {
      setError(null)
      setEntries(previousEntries.filter(entry => entry.id !== entryId))

      const { error: deleteError } = await supabase
        .from('habit_timeline_entries')
        .delete()
        .eq('id', entryId)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      setEntries(previousEntries)
      setError(err instanceof Error ? err.message : 'Failed to delete timeline entry')
      return false
    }
  }, [entries])

  return {
    entries,
    loading,
    error,
    fetchEntries,
    upsertEntry,
    deleteEntry,
  }
}
