import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentUserId } from '../queries/habits'
import type { Category, CreateCategoryInput } from '../lib/types'

const PRESET_CATEGORIES = [
  'Health',
  'Fitness',
  'Productivity',
  'Learning',
  'Mindfulness',
  'Social',
]

export function useCategories() {
  const queryClient = useQueryClient()
  const [mutationError, setMutationError] = useState<string | null>(null)

  const userIdQuery = useQuery({
    queryKey: ['auth', 'user-id'],
    queryFn: getCurrentUserId,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const userId = userIdQuery.data

  const categoriesQuery = useQuery({
    queryKey: userId ? ['categories', userId] : ['categories'],
    queryFn: async (): Promise<Category[]> => {
      if (!userId) return []

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('is_preset', { ascending: false })
        .order('name')

      if (fetchError) throw fetchError
      if (data && data.length > 0) return data as Category[]

      const presets = PRESET_CATEGORIES.map(name => ({
        user_id: userId,
        name,
        is_preset: true,
      }))

      const { error: insertError } = await supabase
        .from('categories')
        .insert(presets)

      if (insertError) throw insertError

      const { data: refreshedData, error: refreshError } = await supabase
        .from('categories')
        .select('*')
        .order('is_preset', { ascending: false })
        .order('name')

      if (refreshError) throw refreshError
      return (refreshedData || []) as Category[]
    },
    enabled: Boolean(userId),
  })

  const createCategoryMutation = useMutation({
    mutationFn: async (input: CreateCategoryInput): Promise<Category> => {
      const currentUserId = userId ?? await getCurrentUserId()

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: currentUserId,
          name: input.name,
          is_preset: false,
        })
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onMutate: () => {
      setMutationError(null)
    },
    onError: () => {
      setMutationError('Failed to create category')
    },
    onSuccess: async () => {
      const currentUserId = userId ?? await getCurrentUserId()
      await queryClient.invalidateQueries({ queryKey: ['categories', currentUserId] })
    },
  })

  const createCategory = async (input: CreateCategoryInput): Promise<Category | null> => {
    try {
      return await createCategoryMutation.mutateAsync(input)
    } catch {
      return null
    }
  }

  const refetch = async (): Promise<void> => {
    if (!userId) return
    await queryClient.invalidateQueries({ queryKey: ['categories', userId] })
  }

  return {
    categories: categoriesQuery.data ?? [],
    loading: userIdQuery.isPending || categoriesQuery.isPending,
    error: mutationError
      ?? (categoriesQuery.error instanceof Error ? categoriesQuery.error.message : null)
      ?? (userIdQuery.error instanceof Error ? userIdQuery.error.message : null),
    createCategory,
    refetch,
  }
}
