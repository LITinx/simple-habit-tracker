interface HabitCardProps {
  id: string
  name: string
  description?: string | null
  completedToday: boolean
  currentStreak: number
  motivationNote?: string | null
  categoryName?: string | null
  frequencyType?: 'daily' | 'weekly'
  frequencyValue?: number
  weeklyCompletions?: number
  onToggle: () => void
  onClick?: () => void
}

export function HabitCard({
  name,
  description,
  completedToday,
  currentStreak,
  motivationNote,
  categoryName,
  frequencyType = 'daily',
  frequencyValue = 1,
  weeklyCompletions = 0,
  onToggle,
  onClick,
}: HabitCardProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle()
  }

  const isWeekly = frequencyType === 'weekly'
  const weeklyProgress = isWeekly ? `${weeklyCompletions}/${frequencyValue}` : null

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-xl border transition-all cursor-pointer
        ${completedToday
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className={`
            flex-shrink-0 w-7 h-7 mt-0.5 rounded-full border-2 flex items-center justify-center
            transition-all
            ${completedToday
              ? 'bg-green-500 border-green-500 text-white habit-complete'
              : 'border-gray-300 hover:border-green-400'
            }
          `}
          aria-label={completedToday ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {completedToday && (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-medium ${
                completedToday ? 'text-green-800' : 'text-gray-900'
              }`}
            >
              {name}
            </h3>
            {currentStreak > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                <span>🔥</span>
                <span>{currentStreak}</span>
              </span>
            )}
            {weeklyProgress && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                {weeklyProgress}/wk
              </span>
            )}
          </div>

          {categoryName && (
            <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {categoryName}
            </span>
          )}

          {description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{description}</p>
          )}

          {motivationNote && (
            <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">
              "{motivationNote}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
