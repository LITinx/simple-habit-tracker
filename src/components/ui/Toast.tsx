import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, type = 'error', onDismiss, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [onDismiss, duration])

  const bgColor = {
    error: 'bg-red-600',
    success: 'bg-green-600',
    info: 'bg-gray-800',
  }[type]

  const icon = {
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }[type]

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center animate-slide-up">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}
        onClick={onDismiss}
      >
        {icon}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}
