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
 * Shift a date string by N days
 */
function shiftDate(dateString: string, days: number): string {
  const date = new Date(dateString + 'T00:00:00')
  date.setDate(date.getDate() + days)
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
  return getWeekStartForDate(getLocalDateString())
}

/**
 * Get the start of the week (Monday) for a specific date string
 */
export function getWeekStartForDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  const dayOfWeek = date.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday is start of week
  const monday = new Date(date)
  monday.setDate(date.getDate() - diff)
  return getLocalDateString(monday)
}

/**
 * Count completions in the current week from a list of completions
 */
export function getWeekCompletions(completions: { completed_date: string }[]): number {
  const weekStart = getWeekStart()
  return completions.filter(c => c.completed_date >= weekStart).length
}

/**
 * Calculate current streak for weekly habits.
 * A week counts only when completions in that week >= targetPerWeek.
 */
export function calculateWeeklyStreak(completionDates: string[], targetPerWeek: number): number {
  if (completionDates.length === 0 || targetPerWeek < 1) return 0

  const uniqueDates = [...new Set(completionDates)]
  const completionsByWeek = new Map<string, number>()

  for (const date of uniqueDates) {
    const weekStart = getWeekStartForDate(date)
    completionsByWeek.set(weekStart, (completionsByWeek.get(weekStart) ?? 0) + 1)
  }

  const currentWeekStart = getWeekStart()
  const currentWeekCount = completionsByWeek.get(currentWeekStart) ?? 0

  let expectedWeekStart = currentWeekStart
  let streak = 0

  if (currentWeekCount < targetPerWeek) {
    const previousWeekStart = shiftDate(currentWeekStart, -7)
    const previousWeekCount = completionsByWeek.get(previousWeekStart) ?? 0
    if (previousWeekCount < targetPerWeek) return 0
    expectedWeekStart = previousWeekStart
  }

  while ((completionsByWeek.get(expectedWeekStart) ?? 0) >= targetPerWeek) {
    streak++
    expectedWeekStart = shiftDate(expectedWeekStart, -7)
  }

  return streak
}

/**
 * Calculate longest streak for weekly habits.
 * A week contributes only if it meets targetPerWeek.
 */
export function calculateLongestWeeklyStreak(completionDates: string[], targetPerWeek: number): number {
  if (completionDates.length === 0 || targetPerWeek < 1) return 0

  const uniqueDates = [...new Set(completionDates)]
  const completionsByWeek = new Map<string, number>()

  for (const date of uniqueDates) {
    const weekStart = getWeekStartForDate(date)
    completionsByWeek.set(weekStart, (completionsByWeek.get(weekStart) ?? 0) + 1)
  }

  const successfulWeeks = Array.from(completionsByWeek.entries())
    .filter(([, count]) => count >= targetPerWeek)
    .map(([weekStart]) => weekStart)
    .sort()

  if (successfulWeeks.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < successfulWeeks.length; i++) {
    const previous = successfulWeeks[i - 1]
    const expectedNext = shiftDate(previous, 7)

    if (successfulWeeks[i] === expectedNext) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
}

/**
 * Calculate current weekly streak measured by total completions (days),
 * while still requiring each included week to meet targetPerWeek.
 */
export function calculateWeeklyStreakCompletions(completionDates: string[], targetPerWeek: number): number {
  if (completionDates.length === 0 || targetPerWeek < 1) return 0

  const uniqueDates = [...new Set(completionDates)]
  const completionsByWeek = new Map<string, number>()

  for (const date of uniqueDates) {
    const weekStart = getWeekStartForDate(date)
    completionsByWeek.set(weekStart, (completionsByWeek.get(weekStart) ?? 0) + 1)
  }

  const isSuccessfulWeek = (weekStart: string) => (completionsByWeek.get(weekStart) ?? 0) >= targetPerWeek

  const currentWeekStart = getWeekStart()
  let expectedWeekStart = currentWeekStart

  if (!isSuccessfulWeek(currentWeekStart)) {
    const previousWeekStart = shiftDate(currentWeekStart, -7)
    if (!isSuccessfulWeek(previousWeekStart)) return 0
    expectedWeekStart = previousWeekStart
  }

  let streakCompletions = 0
  while (isSuccessfulWeek(expectedWeekStart)) {
    streakCompletions += completionsByWeek.get(expectedWeekStart) ?? 0
    expectedWeekStart = shiftDate(expectedWeekStart, -7)
  }

  return streakCompletions
}

/**
 * Calculate longest weekly streak measured by total completions (days),
 * while still requiring each included week to meet targetPerWeek.
 */
export function calculateLongestWeeklyStreakCompletions(completionDates: string[], targetPerWeek: number): number {
  if (completionDates.length === 0 || targetPerWeek < 1) return 0

  const uniqueDates = [...new Set(completionDates)]
  const completionsByWeek = new Map<string, number>()

  for (const date of uniqueDates) {
    const weekStart = getWeekStartForDate(date)
    completionsByWeek.set(weekStart, (completionsByWeek.get(weekStart) ?? 0) + 1)
  }

  const successfulWeeks = Array.from(completionsByWeek.entries())
    .filter(([, count]) => count >= targetPerWeek)
    .sort(([a], [b]) => a.localeCompare(b))

  if (successfulWeeks.length === 0) return 0

  let longestCompletions = successfulWeeks[0][1]
  let currentCompletions = successfulWeeks[0][1]

  for (let i = 1; i < successfulWeeks.length; i++) {
    const [previousWeek] = successfulWeeks[i - 1]
    const [currentWeek, currentCount] = successfulWeeks[i]
    const expectedNextWeek = shiftDate(previousWeek, 7)

    if (currentWeek === expectedNextWeek) {
      currentCompletions += currentCount
    } else {
      currentCompletions = currentCount
    }

    longestCompletions = Math.max(longestCompletions, currentCompletions)
  }

  return longestCompletions
}
