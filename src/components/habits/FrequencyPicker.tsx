import type { FrequencyType } from '../../lib/types'

interface FrequencyPickerProps {
  frequencyType: FrequencyType
  frequencyValue: number
  onTypeChange: (type: FrequencyType) => void
  onValueChange: (value: number) => void
}

export function FrequencyPicker({
  frequencyType,
  frequencyValue,
  onTypeChange,
  onValueChange,
}: FrequencyPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Frequency
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onTypeChange('daily')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            frequencyType === 'daily'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Daily
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('weekly')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            frequencyType === 'weekly'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Weekly
        </button>
      </div>

      {frequencyType === 'weekly' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Times per week</span>
            <span className="font-medium text-gray-900">{frequencyValue}x</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => onValueChange(num)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  frequencyValue === num
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
