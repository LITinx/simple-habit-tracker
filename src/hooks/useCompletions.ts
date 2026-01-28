import { supabase } from '../lib/supabase'
import { isWithinDays, getLocalDateString } from '../lib/utils'

export function useCompletions() {
  const togglePastCompletion = async (
    habitId: string,
    date: string,
    currentlyCompleted: boolean
  ): Promise<boolean> => {
    // Validate date is within past 7 days
    if (!isWithinDays(date, 7) || date === getLocalDateString()) {
      throw new Error('Can only edit completions from the past 7 days')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    if (currentlyCompleted) {
      // Delete the completion
      const { error } = await supabase
        .from('completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_date', date)

      if (error) throw error
    } else {
      // Create the completion
      const { error } = await supabase
        .from('completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completed_date: date,
          completed_at: new Date().toISOString(),
        })

      if (error) throw error
    }

    return true
  }

  return {
    togglePastCompletion,
  }
}
