import { supabase } from '../lib/supabase'
import { isWithinDays, getLocalDateString } from '../lib/utils'
import { insertCompletion, deleteCompletion } from '../lib/completionsService'

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
      await deleteCompletion({ habitId, completedDate: date })
    } else {
      await insertCompletion({ habitId, userId: user.id, completedDate: date })
    }

    return true
  }

  return {
    togglePastCompletion,
  }
}
