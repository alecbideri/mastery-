'use client'

import { useEffect, useState } from 'react'
import { getCurrentLevel, getLevelProgress } from '@/lib/calculations'
import { MASTERY_GOAL } from '@/lib/constants'

interface Stats {
  totalHours: number
  streak: number
  todayHours: number
}

export default function Header() {
  const [stats, setStats] = useState<Stats>({ totalHours: 0, streak: 0, todayHours: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const level = getCurrentLevel(stats.totalHours)
  const progressPercent = ((stats.totalHours / MASTERY_GOAL) * 100).toFixed(1)

  return (
    <header className="w-full" style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center" style={{ gap: '24px' }}>
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center text-2xl">
              ⏱️
            </div>
            <div>
              <h1 className="text-2xl font-bold glow-text">10,000 Hours</h1>
              <p className="text-white/50 text-sm">Per Category Mastery</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center" style={{ gap: '12px' }}>
            {/* Streak Badge */}
            {stats.streak > 0 && (
              <div className="stat-badge">
                <span className="streak-fire">🔥</span>
                <span>{stats.streak} Day{stats.streak > 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Today's Hours */}
            <div className="stat-badge">
              <span>📊</span>
              <span>Today: {stats.todayHours.toFixed(1)}h</span>
            </div>

            {/* Progress Badge */}
            <div className="stat-badge bg-[#2A2A2A] border border-[#3A3A3A]">
              <span>📈</span>
              <span>{progressPercent}% Complete</span>
            </div>

            {/* Level Badge */}
            <div className="level-badge">
              <span className="text-xl">{level.icon}</span>
              <span>{level.name}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
