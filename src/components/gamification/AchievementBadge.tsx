interface AchievementBadgeProps {
  icon: string
  name: string
  description: string
  unlocked: boolean
  unlockedAt?: string
}

export function AchievementBadge({
  icon,
  name,
  description,
  unlocked,
  unlockedAt,
}: AchievementBadgeProps) {
  return (
    <div
      className={`
        p-3 rounded-xl border transition-all
        ${unlocked
          ? 'bg-white border-gray-200'
          : 'bg-gray-50 border-gray-100 opacity-50'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            text-2xl w-10 h-10 flex items-center justify-center rounded-lg
            ${unlocked ? 'bg-amber-50' : 'bg-gray-100 grayscale'}
          `}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {name}
          </h3>
          <p className="text-sm text-gray-500">{description}</p>
          {unlocked && unlockedAt && (
            <p className="text-xs text-gray-400 mt-1">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {unlocked && (
          <div className="text-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
