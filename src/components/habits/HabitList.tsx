import { useState } from 'react'
import { HabitCard } from './HabitCard'
import { EmptyState } from './EmptyState'
import { getWeekCompletions } from '../../lib/utils'
import type { HabitWithStats } from '../../hooks/useHabits'
import type { Category, WeeklyStreakMode } from '../../lib/types'

interface HabitListProps {
  habits: HabitWithStats[]
  categories: Category[]
  onToggle: (habitId: string) => void
  onWeeklyStreakModeChange: (habitId: string, mode: WeeklyStreakMode) => void
  onDateToggle?: (habitId: string, date: string) => void
  onHabitClick?: (habitId: string) => void
  onAddClick: () => void
}

export function HabitList({
  habits,
  categories,
  onToggle,
  onWeeklyStreakModeChange,
  onDateToggle,
  onHabitClick,
  onAddClick,
}: HabitListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  if (habits.length === 0) {
    return <EmptyState onAddClick={onAddClick} />
  }

  const habitCategoryIds = new Set(habits.map(h => h.category_id).filter(Boolean))
  const usedCategories = categories.filter(c => habitCategoryIds.has(c.id))

  const filteredHabits = selectedCategory
    ? habits.filter(h => h.category_id === selectedCategory)
    : habits

  const completedCount = filteredHabits.filter(h => h.completedToday).length
  const totalCount = filteredHabits.length

  const categoryMap = new Map(categories.map(c => [c.id, c.name]))

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-lg font-semibold text-[#121317] tracking-tight">Your habits</h2>
        <span className="text-sm text-[#858892]">
          {completedCount}/{totalCount}
        </span>
      </div>

      {usedCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs tracking-[0.08em] uppercase transition-colors ${
              selectedCategory === null
                ? 'bg-[#111319] text-white'
                : 'bg-[#f1f2f5] text-[#676b74] hover:bg-[#e8eaf0]'
            }`}
          >
            All
          </button>
          {usedCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs tracking-[0.08em] uppercase transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#111319] text-white'
                  : 'bg-[#f1f2f5] text-[#676b74] hover:bg-[#e8eaf0]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {filteredHabits.map((habit) => (
          <HabitCard
            key={habit.id}
            id={habit.id}
            name={habit.name}
            description={habit.description}
            completedToday={habit.completedToday}
            currentStreak={habit.currentStreak}
            motivationNote={habit.motivation_note}
            categoryName={habit.category_id ? categoryMap.get(habit.category_id) : null}
            frequencyType={habit.frequency_type}
            frequencyValue={habit.frequency_value}
            weeklyStreakMode={habit.weekly_streak_mode}
            weeklyCompletions={getWeekCompletions(habit.completions)}
            completionDates={habit.completions.map(c => c.completed_date)}
            onToggle={() => onToggle(habit.id)}
            onWeeklyStreakModeChange={(mode) => onWeeklyStreakModeChange(habit.id, mode)}
            onDateToggle={onDateToggle ? (date) => onDateToggle(habit.id, date) : undefined}
            onClick={onHabitClick ? () => onHabitClick(habit.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
