import { useState } from 'react'
import { HabitCard } from './HabitCard'
import { EmptyState } from './EmptyState'
import { getWeekCompletions } from '../../lib/utils'
import type { HabitWithStats } from '../../hooks/useHabits'
import type { Category } from '../../lib/types'

interface HabitListProps {
  habits: HabitWithStats[]
  categories: Category[]
  onToggle: (habitId: string) => void
  onHabitClick?: (habitId: string) => void
  onAddClick: () => void
}

export function HabitList({
  habits,
  categories,
  onToggle,
  onHabitClick,
  onAddClick,
}: HabitListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  if (habits.length === 0) {
    return <EmptyState onAddClick={onAddClick} />
  }

  // Get unique categories that have habits
  const habitCategoryIds = new Set(habits.map(h => h.category_id).filter(Boolean))
  const usedCategories = categories.filter(c => habitCategoryIds.has(c.id))

  // Filter habits by selected category
  const filteredHabits = selectedCategory
    ? habits.filter(h => h.category_id === selectedCategory)
    : habits

  const completedCount = filteredHabits.filter(h => h.completedToday).length
  const totalCount = filteredHabits.length

  // Create a map of category names for quick lookup
  const categoryMap = new Map(categories.map(c => [c.id, c.name]))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Today's Habits</h2>
        <span className="text-sm text-gray-500">
          {completedCount}/{totalCount} done
        </span>
      </div>

      {usedCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {usedCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
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
            weeklyCompletions={getWeekCompletions(habit.completions)}
            onToggle={() => onToggle(habit.id)}
            onClick={onHabitClick ? () => onHabitClick(habit.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
