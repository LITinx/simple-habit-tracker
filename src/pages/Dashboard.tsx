import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHabits } from '../hooks/useHabits'
import { useCompletions } from '../hooks/useCompletions'
import { useGamification } from '../hooks/useGamification'
import { useCategories } from '../hooks/useCategories'
import { HabitList } from '../components/habits/HabitList'
import { AddHabitForm } from '../components/habits/AddHabitForm'
import { HabitDetailModal } from '../components/habits/HabitDetailModal'
import { EditHabitModal } from '../components/habits/EditHabitModal'
import { PointsDisplay } from '../components/gamification/PointsDisplay'
import { AchievementsList } from '../components/gamification/AchievementsList'
import { AchievementNotification } from '../components/gamification/AchievementNotification'
import { calculatePoints } from '../lib/achievements'
import type { CreateHabitInput } from '../lib/types'

export function Dashboard() {
  const { habits, loading, error, createHabit, updateHabit, toggleCompletion, deleteHabit, refetch } = useHabits()
  const { togglePastCompletion } = useCompletions()
  const {
    totalPoints,
    achievements,
    newAchievement,
    awardPoints,
    checkAndUnlockAchievements,
    dismissAchievementNotification,
    refetch: refetchGamification,
  } = useGamification()
  const { categories, createCategory } = useCategories()

  const handleCreateCategory = async (name: string) => {
    return createCategory({ name })
  }

  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)
  const addFormRef = useRef<HTMLDivElement>(null)

  const selectedHabit = habits.find(h => h.id === selectedHabitId)
  const editingHabit = habits.find(h => h.id === editingHabitId)

  const scrollToAddForm = () => {
    addFormRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Calculate stats for achievement checking
  const getStats = () => {
    const totalHabits = habits.length
    const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0)
    const maxStreak = Math.max(...habits.map(h => h.currentStreak), 0)
    return { totalHabits, totalCompletions, maxStreak }
  }

  const handleToggleCompletion = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const wasCompleted = habit.completedToday
    const success = await toggleCompletion(habitId)

    if (success && !wasCompleted) {
      // Award points for new completion
      const { total } = calculatePoints(habit.currentStreak + 1)
      await awardPoints(total)

      // Check for new achievements
      const stats = getStats()
      stats.totalCompletions += 1
      stats.maxStreak = Math.max(stats.maxStreak, habit.currentStreak + 1)
      await checkAndUnlockAchievements(stats)
    }
  }

  const handleCreateHabit = async (input: CreateHabitInput) => {
    const result = await createHabit(input)

    if (result) {
      // Check for first_habit and habits_10 achievements
      const stats = getStats()
      stats.totalHabits += 1
      await checkAndUnlockAchievements(stats)
    }

    return result
  }

  const handleTogglePastCompletion = async (date: string) => {
    if (!selectedHabit) return

    const isCompleted = selectedHabit.completions.some(c => c.completed_date === date)

    try {
      await togglePastCompletion(selectedHabit.id, date, isCompleted)

      // Award/remove points for past completion
      if (!isCompleted) {
        await awardPoints(10) // Base points only for retroactive
      }

      // Refetch to update streaks and completions
      await refetch()
      await refetchGamification()

      // Check achievements with updated stats
      const stats = getStats()
      await checkAndUnlockAchievements(stats)
    } catch (err) {
      console.error('Failed to toggle past completion:', err)
    }
  }

  const handleHabitClick = (habitId: string) => {
    setSelectedHabitId(habitId)
  }

  const handleEditClick = () => {
    if (selectedHabitId) {
      setEditingHabitId(selectedHabitId)
      setSelectedHabitId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Achievement Notification */}
      {newAchievement && (
        <AchievementNotification
          icon={newAchievement.icon}
          name={newAchievement.name}
          onDismiss={dismissAchievementNotification}
        />
      )}

      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
          <div className="flex items-center gap-3">
            <PointsDisplay points={totalPoints} />
            <Link
              to="/settings"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading habits...</div>
        ) : (
          <>
            <HabitList
              habits={habits}
              categories={categories}
              onToggle={handleToggleCompletion}
              onHabitClick={handleHabitClick}
              onAddClick={scrollToAddForm}
            />

            <div ref={addFormRef} className="mt-6">
              <AddHabitForm
                onSubmit={handleCreateHabit}
                categories={categories}
                onCreateCategory={handleCreateCategory}
              />
            </div>

            {/* Achievements Section */}
            <div className="mt-8">
              <button
                onClick={() => setShowAchievements(!showAchievements)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <span className="font-medium text-gray-900">Achievements</span>
                  <span className="text-sm text-gray-500">
                    ({achievements.length}/{8} unlocked)
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showAchievements ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAchievements && (
                <div className="mt-3">
                  <AchievementsList achievements={achievements} />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Habit Detail Modal */}
      {selectedHabit && (
        <HabitDetailModal
          habit={selectedHabit}
          onClose={() => setSelectedHabitId(null)}
          onTogglePastCompletion={handleTogglePastCompletion}
          onEdit={handleEditClick}
        />
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          categories={categories}
          onClose={() => setEditingHabitId(null)}
          onSave={updateHabit}
          onDelete={deleteHabit}
          onCreateCategory={handleCreateCategory}
        />
      )}
    </div>
  )
}
