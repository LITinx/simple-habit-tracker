import { supabase } from './supabase'
import type { Completion } from './types'

interface InsertCompletionInput {
  habitId: string
  userId: string
  completedDate: string
}

interface DeleteCompletionInput {
  habitId: string
  completedDate: string
}

export function buildOptimisticCompletion(
  habitId: string,
  userId: string,
  completedDate: string
): Completion {
  const now = new Date().toISOString()

  return {
    id: `temp-${habitId}-${completedDate}`,
    habit_id: habitId,
    user_id: userId,
    completed_date: completedDate,
    completed_at: now,
    created_at: now,
  }
}

export async function insertCompletion({
  habitId,
  userId,
  completedDate,
}: InsertCompletionInput): Promise<void> {
  const { error } = await supabase
    .from('completions')
    .insert({
      habit_id: habitId,
      user_id: userId,
      completed_date: completedDate,
      completed_at: new Date().toISOString(),
    })

  if (error) throw error
}

export async function deleteCompletion({
  habitId,
  completedDate,
}: DeleteCompletionInput): Promise<void> {
  const { error } = await supabase
    .from('completions')
    .delete()
    .eq('habit_id', habitId)
    .eq('completed_date', completedDate)

  if (error) throw error
}
