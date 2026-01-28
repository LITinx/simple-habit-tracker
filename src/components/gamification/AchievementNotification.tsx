import { useEffect } from 'react'

interface AchievementNotificationProps {
  icon: string
  name: string
  onDismiss: () => void
}

export function AchievementNotification({
  icon,
  name,
  onDismiss,
}: AchievementNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div
        onClick={onDismiss}
        className="flex items-center gap-3 bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-50"
      >
        <div className="text-3xl animate-bounce">{icon}</div>
        <div>
          <div className="text-xs text-amber-600 font-medium">Achievement Unlocked!</div>
          <div className="font-semibold text-gray-900">{name}</div>
        </div>
      </div>
    </div>
  )
}
