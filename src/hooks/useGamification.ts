import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { checkAchievements, getAchievementDefinition } from '../lib/achievements'
import type { Achievement, AchievementType } from '../lib/types'

export interface NewAchievement {
  type: AchievementType
  name: string
  icon: string
}

export function useGamification() {
  const [totalPoints, setTotalPoints] = useState(0)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [newAchievement, setNewAchievement] = useState<NewAchievement | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchGamificationData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile for points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .single()

      if (profile) {
        setTotalPoints(profile.total_points)
      }

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('unlocked_at', { ascending: false })

      if (achievementsData) {
        setAchievements(achievementsData)
      }
    } catch (err) {
      console.error('Failed to fetch gamification data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGamificationData()
  }, [fetchGamificationData])

  const awardPoints = async (points: number): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const newTotal = totalPoints + points

      const { error } = await supabase
        .from('profiles')
        .update({ total_points: newTotal })
        .eq('id', user.id)

      if (error) throw error

      setTotalPoints(newTotal)
      return true
    } catch (err) {
      console.error('Failed to award points:', err)
      return false
    }
  }

  const checkAndUnlockAchievements = async (stats: {
    totalHabits: number
    totalCompletions: number
    maxStreak: number
  }): Promise<NewAchievement[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const unlockedTypes = new Set(achievements.map(a => a.achievement_type))
      const toUnlock = checkAchievements(stats, unlockedTypes)

      const newlyUnlocked: NewAchievement[] = []

      for (const { type, shouldUnlock } of toUnlock) {
        if (shouldUnlock) {
          const { error } = await supabase
            .from('achievements')
            .insert({
              user_id: user.id,
              achievement_type: type,
              unlocked_at: new Date().toISOString(),
            })

          if (!error) {
            const def = getAchievementDefinition(type)
            if (def) {
              const newAch: NewAchievement = {
                type,
                name: def.name,
                icon: def.icon,
              }
              newlyUnlocked.push(newAch)

              // Show notification for first new achievement
              if (newlyUnlocked.length === 1) {
                setNewAchievement(newAch)
              }
            }
          }
        }
      }

      if (newlyUnlocked.length > 0) {
        await fetchGamificationData()
      }

      return newlyUnlocked
    } catch (err) {
      console.error('Failed to check achievements:', err)
      return []
    }
  }

  const dismissAchievementNotification = () => {
    setNewAchievement(null)
  }

  return {
    totalPoints,
    achievements,
    newAchievement,
    loading,
    awardPoints,
    checkAndUnlockAchievements,
    dismissAchievementNotification,
    refetch: fetchGamificationData,
  }
}
