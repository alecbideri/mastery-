'use client'

import { useEffect, useState } from 'react'
import { getCurrentLevel, getLevelProgress } from '@/lib/calculations'
import { MASTERY_GOAL } from '@/lib/constants'

export default function ProgressRing() {
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setTotalHours(data.totalHours || 0)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const level = getCurrentLevel(totalHours)
  const { progress: levelProgress, hoursToNext, nextLevel } = getLevelProgress(totalHours)

  const progressPercent = (totalHours / MASTERY_GOAL) * 100
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  const remaining = Math.max(0, MASTERY_GOAL - totalHours)

  return (
    <div className="glass-card glow-border flex flex-col items-center" style={{ padding: '32px', gap: '32px' }}>
      {/* Main Progress Ring */}
      <div className="progress-ring" style={{ marginBottom: '0' }}>
        <svg viewBox="0 0 256 256">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="50%" stopColor="#764ba2" />
              <stop offset="100%" stopColor="#f093fb" />
            </linearGradient>
          </defs>
          <circle
            cx="128"
            cy="128"
            r="120"
            className="progress-ring-circle-bg"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            className="progress-ring-circle"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="progress-ring-content">
          <div className="text-5xl font-bold glow-text">
            {totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <div className="text-white/50 text-lg">of {MASTERY_GOAL.toLocaleString()} hours</div>
          <div className="text-3xl mt-2">{level.icon}</div>
        </div>
      </div>

      {/* Stats Below Ring */}
      <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Remaining Hours */}
        <div className="text-center">
          <div className="text-white/50 text-sm uppercase tracking-wider">Remaining</div>
          <div className="text-2xl font-semibold text-white">
            {remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} hours
          </div>
        </div>

        {/* Level Progress Bar */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Level Progress</span>
              <span className="text-white/70">{hoursToNext.toFixed(0)}h to {nextLevel.name} {nextLevel.icon}</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#667eea] transition-all duration-1000"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Mastery Progress Percentage */}
        <div className="text-center" style={{ paddingTop: '16px' }}>
          <div className="inline-flex items-center gap-3 bg-[#2A2A2A] border border-[#3A3A3A]" style={{ padding: '16px 24px' }}>
            <span className="text-white/50">Mastery Progress:</span>
            <span className="text-lg font-semibold text-white">
              {progressPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
