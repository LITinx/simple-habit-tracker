/**
 * Get today's date as a YYYY-MM-DD string in local timezone
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if a date string (YYYY-MM-DD) is today in local timezone
 */
export function isToday(dateString: string): boolean {
  return dateString === getLocalDateString()
}

/**
 * Format a date string for display (e.g., "Jan 15")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Get a date string for N days ago
 */
export function getDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return getLocalDateString(date)
}

/**
 * Check if a date is within the past N days
 */
export function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString + 'T00:00:00')
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)
  return date >= cutoff
}

/**
 * Calculate current streak from a list of completion dates
 * Dates should be in YYYY-MM-DD format, sorted doesn't matter
 */
export function calculateStreak(completionDates: string[]): number {
  if (completionDates.length === 0) return 0

  const today = getLocalDateString()
  const sortedDates = [...new Set(completionDates)].sort().reverse()

  // Start from today or yesterday
  let expectedDate = today
  let streak = 0

  // If today isn't completed, start from yesterday
  if (sortedDates[0] !== today) {
    const yesterday = getDaysAgo(1)
    if (sortedDates[0] !== yesterday) {
      return 0 // Streak broken
    }
    expectedDate = yesterday
  }

  for (const date of sortedDates) {
    if (date === expectedDate) {
      streak++
      // Move to previous day
      const prevDate = new Date(expectedDate + 'T00:00:00')
      prevDate.setDate(prevDate.getDate() - 1)
      expectedDate = getLocalDateString(prevDate)
    } else if (date < expectedDate) {
      // Gap found, streak broken
      break
    }
  }

  return streak
}

/**
 * Calculate longest streak from a list of completion dates
 */
export function calculateLongestStreak(completionDates: string[]): number {
  if (completionDates.length === 0) return 0

  const sortedDates = [...new Set(completionDates)].sort()
  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1] + 'T00:00:00')
    const currDate = new Date(sortedDates[i] + 'T00:00:00')

    // Check if dates are consecutive
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}

/**
 * Get an array of the past N days as date strings
 */
export function getPastDays(count: number): string[] {
  const days: string[] = []
  for (let i = 0; i < count; i++) {
    days.push(getDaysAgo(i))
  }
  return days
}

/**
 * Get the start of the current week (Monday) as a date string
 */
export function getWeekStart(): string {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday is start of week
  const monday = new Date(today)
  monday.setDate(today.getDate() - diff)
  return getLocalDateString(monday)
}

/**
 * Count completions in the current week from a list of completions
 */
export function getWeekCompletions(completions: { completed_date: string }[]): number {
  const weekStart = getWeekStart()
  return completions.filter(c => c.completed_date >= weekStart).length
}
