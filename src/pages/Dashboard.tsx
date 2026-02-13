import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHabits } from '../hooks/useHabits'
import { useGamification } from '../hooks/useGamification'
import { useCategories } from '../hooks/useCategories'
import { HabitList } from '../components/habits/HabitList'
import { AddHabitForm } from '../components/habits/AddHabitForm'
import { HabitDetailModal } from '../components/habits/HabitDetailModal'
import { EditHabitModal } from '../components/habits/EditHabitModal'
import { AchievementNotification } from '../components/gamification/AchievementNotification'
import { calculatePoints } from '../lib/achievements'
import { getLocalDateString } from '../lib/utils'
import type { CreateHabitInput } from '../lib/types'

export function Dashboard() {
  const { habits, loading, error, createHabit, updateHabit, toggleCompletion, toggleCompletionForDate, deleteHabit } = useHabits()
  const {
    newAchievement,
    awardPoints,
    checkAndUnlockAchievements,
    dismissAchievementNotification,
  } = useGamification()
  const { categories, createCategory } = useCategories()

  const handleCreateCategory = async (name: string) => {
    return createCategory({ name })
  }

  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false)

  const selectedHabit = habits.find(h => h.id === selectedHabitId)
  const editingHabit = habits.find(h => h.id === editingHabitId)

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
      const { total } = calculatePoints(habit.currentStreak + 1)
      await awardPoints(total)

      const stats = getStats()
      stats.totalCompletions += 1
      stats.maxStreak = Math.max(stats.maxStreak, habit.currentStreak + 1)
      await checkAndUnlockAchievements(stats)
    }
  }

  const handleCreateHabit = async (input: CreateHabitInput) => {
    const result = await createHabit(input)

    if (result) {
      const stats = getStats()
      stats.totalHabits += 1
      await checkAndUnlockAchievements(stats)
    }

    return result
  }

  const handleTogglePastCompletion = async (date: string) => {
    if (!selectedHabit) return
    await handleToggleDateCompletion(selectedHabit.id, date)
  }

  const handleToggleDateCompletion = async (habitId: string, date: string) => {
    const today = getLocalDateString()

    if (date === today) {
      await handleToggleCompletion(habitId)
      return
    }

    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const isCompleted = habit.completions.some(c => c.completed_date === date)

    try {
      const success = await toggleCompletionForDate(habitId, date)
      if (!success) return

      if (!isCompleted) {
        await awardPoints(10)
      }

      const stats = getStats()
      stats.totalCompletions += isCompleted ? -1 : 1
      await checkAndUnlockAchievements(stats)
    } catch (err) {
      console.error('Failed to toggle date completion:', err)
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
    <div className="min-h-screen habit-scene">
      {newAchievement && (
        <AchievementNotification
          icon={newAchievement.icon}
          name={newAchievement.name}
          onDismiss={dismissAchievementNotification}
        />
      )}

      <main className="max-w-[430px] md:max-w-3xl mx-auto px-3 sm:px-4 py-3 md:py-8 pb-32">
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <section>
          <div className="sticky top-0 z-10 py-3 bg-[#f3f4f7]/95 backdrop-blur-sm border-b border-black/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#9da2ac]">today</p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#101114] tracking-tight">habits</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddHabitOpen(true)}
                  className="w-11 h-11 rounded-full bg-white border border-black/10 text-[#111319] text-2xl leading-none hover:bg-[#111319] hover:text-white"
                  aria-label="Add habit"
                >
                  +
                </button>
                <Link
                  to="/settings"
                  className="w-11 h-11 rounded-full bg-white border border-black/10 text-[#666a73] hover:text-[#111319] flex items-center justify-center"
                  aria-label="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-5">
            {loading ? (
              <div className="text-center py-12 text-[#8f939c]">Loading habits...</div>
            ) : (
              <HabitList
                habits={habits}
                categories={categories}
                onToggle={handleToggleCompletion}
                onDateToggle={handleToggleDateCompletion}
                onHabitClick={handleHabitClick}
                onAddClick={() => setIsAddHabitOpen(true)}
              />
            )}
          </div>
        </section>
      </main>

      <AddHabitForm
        isOpen={isAddHabitOpen}
        onOpenChange={setIsAddHabitOpen}
        onSubmit={handleCreateHabit}
        categories={categories}
        onCreateCategory={handleCreateCategory}
      />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-white/95 backdrop-blur-sm px-8 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="max-w-[430px] mx-auto flex items-center justify-around text-[#a2a6af]">
          <button className="text-[#111319]" aria-label="Home">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-10.5z" />
            </svg>
          </button>
          <Link to="/settings" className="hover:text-[#111319]" aria-label="Settings">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19a3 3 0 00-6 0m9 0a6 6 0 10-12 0m9-9a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </nav>

      {selectedHabit && (
        <HabitDetailModal
          habit={selectedHabit}
          onClose={() => setSelectedHabitId(null)}
          onTogglePastCompletion={handleTogglePastCompletion}
          onEdit={handleEditClick}
        />
      )}

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
