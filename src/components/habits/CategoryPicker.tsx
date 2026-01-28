import { useState } from 'react'
import type { Category } from '../../lib/types'

interface CategoryPickerProps {
  categories: Category[]
  value: string | null
  onChange: (categoryId: string | null) => void
  onCreateCategory?: (name: string) => Promise<Category | null>
}

export function CategoryPicker({
  categories,
  value,
  onChange,
  onCreateCategory,
}: CategoryPickerProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateCustom = async () => {
    if (!customName.trim() || !onCreateCategory) return

    setCreating(true)
    const newCategory = await onCreateCategory(customName.trim())
    setCreating(false)

    if (newCategory) {
      onChange(newCategory.id)
      setCustomName('')
      setShowCustomInput(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Category
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            value === null
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          None
        </button>

        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              value === category.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}

        {onCreateCategory && !showCustomInput && (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          >
            + Custom
          </button>
        )}
      </div>

      {showCustomInput && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Category name"
            maxLength={50}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateCustom}
            disabled={!customName.trim() || creating}
            className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg disabled:opacity-50"
          >
            {creating ? '...' : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false)
              setCustomName('')
            }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
