'use client'

import { useEffect, useState } from 'react'
import { ACHIEVEMENTS } from '@/lib/constants'

interface Stats {
  totalHours: number
  streak: number
}

export default function AchievementBadges() {
  const [stats, setStats] = useState<Stats>({ totalHours: 0, streak: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats({ totalHours: data.totalHours || 0, streak: data.streak || 0 })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const isUnlocked = (achievement: typeof ACHIEVEMENTS[number]) => {
    if (achievement.type === 'streak') {
      return stats.streak >= achievement.requirement
    }
    return stats.totalHours >= achievement.requirement
  }

  const getProgress = (achievement: typeof ACHIEVEMENTS[number]) => {
    if (achievement.type === 'streak') {
      return Math.min((stats.streak / achievement.requirement) * 100, 100)
    }
    return Math.min((stats.totalHours / achievement.requirement) * 100, 100)
  }

  const unlockedCount = ACHIEVEMENTS.filter(a => isUnlocked(a)).length

  return (
    <div className="glass-card" style={{ padding: '32px' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ marginBottom: '32px' }}>
          <div className="w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <h2 className="text-xl font-semibold">Achievements</h2>
        </div>
        <div className="text-sm text-white/50">
          {unlockedCount}/{ACHIEVEMENTS.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-5" style={{ gap: '20px' }}>
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = isUnlocked(achievement)
          const progress = getProgress(achievement)

          return (
            <div
              key={achievement.id}
              className="relative group"
            >
              <div
                className={`achievement-badge ${unlocked ? 'unlocked' : 'locked'}`}
                title={`${achievement.name}: ${achievement.description}`}
              >
                <span className="text-2xl">{achievement.icon}</span>

                {/* Progress ring for locked achievements */}
                {!unlocked && progress > 0 && (
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 60 60"
                  >
                    <circle
                      cx="30"
                      cy="30"
                      r="28"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="28"
                      fill="none"
                      stroke="url(#achieveGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(progress / 100) * 175.9} 175.9`}
                    />
                    <defs>
                      <linearGradient id="achieveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="font-semibold">{achievement.name}</div>
                <div className="text-white/60">{achievement.description}</div>
                {!unlocked && (
                  <div className="text-indigo-400 mt-1">{progress.toFixed(0)}%</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
