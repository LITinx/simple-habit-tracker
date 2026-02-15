import { CategoryPicker } from './CategoryPicker'
import { FrequencyPicker } from './FrequencyPicker'
import { useState } from 'react'
import type { CreateHabitInput, Category, FrequencyType } from '../../lib/types'

interface AddHabitFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateHabitInput) => Promise<unknown>
  categories: Category[]
  onCreateCategory?: (name: string) => Promise<Category | null>
}

export function AddHabitForm({
  isOpen,
  onOpenChange,
  onSubmit,
  categories,
  onCreateCategory,
}: AddHabitFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily')
  const [frequencyValue, setFrequencyValue] = useState(1)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [motivationNote, setMotivationNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setName('')
    setDescription('')
    setFrequencyType('daily')
    setFrequencyValue(1)
    setCategoryId(null)
    setMotivationNote('')
    setError('')
  }

  const closeModal = () => {
    onOpenChange(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Habit name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        frequency_type: frequencyType,
        frequency_value: frequencyType === 'weekly' ? frequencyValue : 1,
        category_id: categoryId || undefined,
        motivation_note: motivationNote.trim() || undefined,
      })

      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 animate-modal-backdrop"
        onClick={closeModal}
        aria-label="Close add habit dialog"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full sm:max-w-xl max-h-[88vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-5 bg-white border border-black/5 rounded-t-3xl sm:rounded-3xl space-y-4 shadow-[0_30px_90px_rgba(9,11,16,0.35)] animate-modal-panel"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111319]">Add new habit</h2>
          <button
            type="button"
            onClick={closeModal}
            className="w-9 h-9 rounded-full border border-[#d8dbe2] text-[#666a73] hover:text-[#111319]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="p-2 text-sm text-red-600 bg-red-50 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#3a3d45] mb-1">
            Habit name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Sleep 8 hours"
            maxLength={100}
            className="w-full px-3 py-2 border border-[#d8dbe2] rounded-xl focus:ring-2 focus:ring-[#111319] focus:border-[#111319]"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#3a3d45] mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details"
            maxLength={500}
            className="w-full px-3 py-2 border border-[#d8dbe2] rounded-xl focus:ring-2 focus:ring-[#111319] focus:border-[#111319]"
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
          <label className="block text-sm font-medium text-[#3a3d45] mb-1">
            Motivation note
          </label>
          <textarea
            value={motivationNote}
            onChange={(e) => setMotivationNote(e.target.value)}
            placeholder="Why this matters to you"
            maxLength={200}
            rows={2}
            className="w-full px-3 py-2 border border-[#d8dbe2] rounded-xl focus:ring-2 focus:ring-[#111319] focus:border-[#111319] resize-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-[#111319] text-white font-medium rounded-full hover:bg-black disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add habit'}
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="py-2.5 px-4 text-[#666a73] hover:text-[#111319]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
