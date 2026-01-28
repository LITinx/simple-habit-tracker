import { useState } from 'react'
import { CategoryPicker } from './CategoryPicker'
import { FrequencyPicker } from './FrequencyPicker'
import type { CreateHabitInput, Category, FrequencyType } from '../../lib/types'

interface AddHabitFormProps {
  onSubmit: (input: CreateHabitInput) => Promise<unknown>
  categories: Category[]
  onCreateCategory?: (name: string) => Promise<Category | null>
}

export function AddHabitForm({ onSubmit, categories, onCreateCategory }: AddHabitFormProps) {
  const [isOpen, setIsOpen] = useState(false)
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

      resetForm()
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        + Add new habit
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white border border-gray-200 rounded-xl space-y-4"
    >
      {error && (
        <div className="p-2 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Habit name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Exercise 30 minutes"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details"
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Motivation note
        </label>
        <textarea
          value={motivationNote}
          onChange={(e) => setMotivationNote(e.target.value)}
          placeholder="Why is this habit important to you?"
          maxLength={200}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add habit'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            resetForm()
          }}
          className="py-2.5 px-4 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
