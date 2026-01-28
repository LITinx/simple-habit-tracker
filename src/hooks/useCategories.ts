import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
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
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('is_preset', { ascending: false })
        .order('name')

      if (fetchError) throw fetchError

      // If no categories, create presets
      if (!data || data.length === 0) {
        await createPresetCategories(user.id)
        return
      }

      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  const createPresetCategories = async (userId: string) => {
    try {
      const presets = PRESET_CATEGORIES.map(name => ({
        user_id: userId,
        name,
        is_preset: true,
      }))

      const { data, error } = await supabase
        .from('categories')
        .insert(presets)
        .select()

      if (error) throw error
      if (data) setCategories(data)
    } catch (err) {
      console.error('Failed to create preset categories:', err)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = async (input: CreateCategoryInput): Promise<Category | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: input.name,
          is_preset: false,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCategories(prev => [...prev, data])
      }

      return data
    } catch (err) {
      console.error('Failed to create category:', err)
      setError('Failed to create category')
      return null
    }
  }

  return {
    categories,
    loading,
    error,
    createCategory,
    refetch: fetchCategories,
  }
}
