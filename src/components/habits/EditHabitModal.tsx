import { useState } from 'react'
import { CategoryPicker } from './CategoryPicker'
import { FrequencyPicker } from './FrequencyPicker'
import type { Category, FrequencyType, UpdateHabitInput } from '../../lib/types'
import type { HabitWithStats } from '../../hooks/useHabits'

interface EditHabitModalProps {
  habit: HabitWithStats
  categories: Category[]
  onClose: () => void
  onSave: (habitId: string, input: UpdateHabitInput) => Promise<boolean>
  onDelete: (habitId: string) => Promise<boolean>
  onCreateCategory?: (name: string) => Promise<Category | null>
}

export function EditHabitModal({
  habit,
  categories,
  onClose,
  onSave,
  onDelete,
  onCreateCategory,
}: EditHabitModalProps) {
  const [name, setName] = useState(habit.name)
  const [description, setDescription] = useState(habit.description || '')
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(habit.frequency_type)
  const [frequencyValue, setFrequencyValue] = useState(habit.frequency_value)
  const [categoryId, setCategoryId] = useState<string | null>(habit.category_id)
  const [motivationNote, setMotivationNote] = useState(habit.motivation_note || '')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Habit name is required')
      return
    }

    setSaving(true)
    setError('')

    const success = await onSave(habit.id, {
      name: name.trim(),
      description: description.trim() || null,
      frequency_type: frequencyType,
      frequency_value: frequencyType === 'weekly' ? frequencyValue : 1,
      category_id: categoryId,
      motivation_note: motivationNote.trim() || null,
    })

    setSaving(false)

    if (success) {
      onClose()
    } else {
      setError('Failed to save changes')
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    const success = await onDelete(habit.id)
    setSaving(false)

    if (success) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-modal-backdrop"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl animate-modal-panel">
        <div className="sticky top-0 bg-white border-b border-black/10 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#101114]">Edit Habit</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#8f9298] hover:text-[#111319]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="p-2 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1d1f24] mb-1">
              Habit name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2 border border-black/10 bg-[#f1f2f5] text-[#101114] rounded-lg focus:ring-2 focus:ring-[#111319] focus:border-[#111319]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1f24] mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details"
              maxLength={500}
              className="w-full px-3 py-2 border border-black/10 bg-[#f1f2f5] text-[#101114] rounded-lg focus:ring-2 focus:ring-[#111319] focus:border-[#111319]"
            />
          </div>

          <FrequencyPicker
            frequencyType={frequencyType}
            frequencyValue={frequencyValue}
            onTypeChange={setFrequencyType}
            onValueChange={setFrequencyValue}
          />

          <CategoryPicker
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            onCreateCategory={onCreateCategory}
          />

          <div>
            <label className="block text-sm font-medium text-[#1d1f24] mb-1">
              Motivation note
            </label>
            <textarea
              value={motivationNote}
              onChange={e => setMotivationNote(e.target.value)}
              placeholder="Why is this habit important to you?"
              maxLength={200}
              rows={2}
              className="w-full px-3 py-2 border border-black/10 bg-[#f1f2f5] text-[#101114] rounded-lg focus:ring-2 focus:ring-[#111319] focus:border-[#111319] resize-none"
            />
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 px-4 bg-[#111319] text-white font-medium rounded-lg hover:bg-[#1d1f24] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 px-4 text-red-600 font-medium rounded-lg hover:bg-red-50"
              >
                Archive habit
              </button>
            ) : (
              <div className="p-3 bg-red-50 rounded-lg space-y-2">
                <p className="text-sm text-red-800">
                  Are you sure? This will hide the habit from your dashboard.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 py-2 px-4 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Yes, archive
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 px-4 text-[#7c8087] text-sm font-medium rounded-lg hover:bg-[#f1f2f5]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
