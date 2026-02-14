import { CompletionCalendar } from './CompletionCalendar'
import type { HabitWithStats } from '../../hooks/useHabits'

interface HabitDetailModalProps {
  habit: HabitWithStats
  onClose: () => void
  onTogglePastCompletion: (date: string) => void
  onEdit?: () => void
}

export function HabitDetailModal({ habit, onClose, onTogglePastCompletion, onEdit }: HabitDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black/10 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#101114] truncate pr-4">
            {habit.name}
          </h2>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-[#8f9298] hover:text-[#111319] rounded-full hover:bg-[#f1f2f5]"
                aria-label="Edit habit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#8f9298] hover:text-[#111319] rounded-full hover:bg-[#f1f2f5]"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f1f2f5] border border-black/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[#111319]">
                {habit.currentStreak}
              </div>
              <div className="text-xs text-[#7c8087]">Current Streak</div>
            </div>
            <div className="bg-[#f1f2f5] border border-black/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[#111319]">
                {habit.longestStreak}
              </div>
              <div className="text-xs text-[#7c8087]">Longest Streak</div>
            </div>
          </div>

          {habit.description && (
            <div>
              <h3 className="text-sm font-medium text-[#1d1f24] mb-1">Description</h3>
              <p className="text-[#7c8087] text-sm">{habit.description}</p>
            </div>
          )}

          {habit.motivation_note && (
            <div>
              <h3 className="text-sm font-medium text-[#1d1f24] mb-1">Motivation</h3>
              <p className="text-[#7c8087] text-sm italic">"{habit.motivation_note}"</p>
            </div>
          )}

          {/* Calendar */}
          <div>
            <h3 className="text-sm font-medium text-[#1d1f24] mb-2">History (last 4 weeks)</h3>
            <CompletionCalendar
              completions={habit.completions}
              onToggle={onTogglePastCompletion}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
