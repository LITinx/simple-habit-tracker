import { getPastDays, isWithinDays, formatDate, getLocalDateString } from '../../lib/utils'
import type { Completion } from '../../lib/types'

interface CompletionCalendarProps {
  completions: Completion[]
  onToggle: (date: string) => void
}

export function CompletionCalendar({ completions, onToggle }: CompletionCalendarProps) {
  const today = getLocalDateString()
  const days = getPastDays(28) // 4 weeks
  const completedDates = new Set(completions.map(c => c.completed_date))

  const handleToggle = (date: string) => {
    // Only allow toggling past 7 days (excluding today which is toggled from main view)
    if (date !== today && isWithinDays(date, 7)) {
      onToggle(date)
    }
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day labels */}
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
        <div key={i} className="text-center text-xs text-gray-400 py-1">
          {day}
        </div>
      ))}

      {/* Calendar days - reverse to show newest first, then pad to start on correct day */}
      {(() => {
        const reversedDays = [...days].reverse()
        const firstDate = new Date(reversedDays[0] + 'T00:00:00')
        const startDayOfWeek = firstDate.getDay()

        // Pad with empty cells to align with day of week
        const paddedDays = [
          ...Array(startDayOfWeek).fill(null),
          ...reversedDays,
        ]

        return paddedDays.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="w-8 h-8" />
          }

          const isCompleted = completedDates.has(date)
          const isEditable = date !== today && isWithinDays(date, 7)
          const isToday = date === today

          return (
            <button
              key={date}
              onClick={() => handleToggle(date)}
              disabled={!isEditable}
              title={formatDate(date)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs
                transition-all
                ${isToday
                  ? 'ring-2 ring-blue-400 ring-offset-1'
                  : ''
                }
                ${isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-400'
                }
                ${isEditable
                  ? 'hover:ring-2 hover:ring-blue-300 cursor-pointer'
                  : 'cursor-default'
                }
              `}
            >
              {new Date(date + 'T00:00:00').getDate()}
            </button>
          )
        })
      })()}
    </div>
  )
}
