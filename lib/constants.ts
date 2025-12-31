// Category definitions
export const CATEGORIES = {
  software: {
    id: 'software',
    name: 'Software Engineering',
    icon: '💻',
    gradient: 'from-indigo-500 to-purple-600',
    color: '#667eea'
  },
  design: {
    id: 'design',
    name: 'Design',
    icon: '🎨',
    gradient: 'from-pink-400 to-rose-500',
    color: '#f093fb'
  },
  ai: {
    id: 'ai',
    name: 'AI Engineering',
    icon: '🤖',
    gradient: 'from-cyan-400 to-sky-500',
    color: '#4facfe'
  },
  cybersecurity: {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    icon: '🔒',
    gradient: 'from-emerald-400 to-green-500',
    color: '#11998e'
  }
} as const

export type CategoryId = keyof typeof CATEGORIES

// Level definitions (based on 10,000 hours per category)
export const LEVELS = [
  { name: 'Novice', minHours: 0, icon: '🌱', nextAt: 100 },
  { name: 'Apprentice', minHours: 100, icon: '🔧', nextAt: 500 },
  { name: 'Journeyman', minHours: 500, icon: '⚡', nextAt: 1500 },
  { name: 'Expert', minHours: 1500, icon: '🔥', nextAt: 3000 },
  { name: 'Specialist', minHours: 3000, icon: '💎', nextAt: 6000 },
  { name: 'Master', minHours: 6000, icon: '👑', nextAt: 10000 },
  { name: 'Legend', minHours: 10000, icon: '🏆', nextAt: Infinity }
] as const

// Achievement definitions
export const ACHIEVEMENTS = [
  { id: 'first-hour', name: 'First Hour', icon: '🎯', description: 'Log your first hour', requirement: 1 },
  { id: 'ten-hours', name: 'Getting Started', icon: '💪', description: 'Reach 10 hours', requirement: 10 },
  { id: 'hundred-hours', name: 'Centurion', icon: '🔥', description: 'Reach 100 hours', requirement: 100 },
  { id: 'five-hundred', name: 'Dedicated', icon: '⭐', description: 'Reach 500 hours', requirement: 500 },
  { id: 'thousand', name: 'Thousand Club', icon: '🌟', description: 'Reach 1,000 hours', requirement: 1000 },
  { id: 'three-thousand', name: 'Committed', icon: '🎖️', description: 'Reach 3,000 hours', requirement: 3000 },
  { id: 'six-thousand', name: 'Almost There', icon: '🏅', description: 'Reach 6,000 hours', requirement: 6000 },
  { id: 'mastery', name: '10K Master', icon: '🏆', description: 'Achieve 10,000 hours mastery', requirement: 10000 },
  { id: 'streak-7', name: 'Week Warrior', icon: '📅', description: '7-day streak', requirement: 7, type: 'streak' as const },
  { id: 'streak-30', name: 'Monthly Master', icon: '🗓️', description: '30-day streak', requirement: 30, type: 'streak' as const },
] as const

// Mastery goal per category
export const CATEGORY_MASTERY_GOAL = 10000

// Total mastery goal (all categories combined)
export const MASTERY_GOAL = CATEGORY_MASTERY_GOAL * Object.keys(CATEGORIES).length // 40,000 total
