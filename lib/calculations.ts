import { LEVELS } from './constants'

// Get current level based on total hours
export function getCurrentLevel(totalHours: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalHours >= LEVELS[i].minHours) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

// Get progress to next level
export function getLevelProgress(totalHours: number) {
  const currentLevel = getCurrentLevel(totalHours)
  const currentIndex = LEVELS.findIndex(l => l.name === currentLevel.name)

  if (currentIndex === LEVELS.length - 1) {
    return { progress: 100, hoursToNext: 0, nextLevel: null }
  }

  const nextLevel = LEVELS[currentIndex + 1]
  const hoursInLevel = totalHours - currentLevel.minHours
  const hoursNeeded = nextLevel.minHours - currentLevel.minHours
  const progress = (hoursInLevel / hoursNeeded) * 100

  return {
    progress: Math.min(progress, 100),
    hoursToNext: nextLevel.minHours - totalHours,
    nextLevel
  }
}

// Format date for display
export function formatDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'

  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Format timestamp for display
export function formatTime(timestamp: string | Date): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
