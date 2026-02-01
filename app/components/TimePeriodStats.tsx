'use client'

import { useEffect, useState } from 'react'

interface TimePeriodStatsData {
  weeklyHours: number
  monthlyHours: number
  yearlyHours: number
  currentYear: number
}

// Goals for each time period (adjust as desired)
const WEEKLY_GOAL = 40 // 40 hours per week
const MONTHLY_GOAL = 160 // ~40 hours per week
const YEARLY_GOAL = 2000 // ~2000 hours per year (target for one category)

export default function TimePeriodStats() {
  const [stats, setStats] = useState<TimePeriodStatsData>({
    weeklyHours: 0,
    monthlyHours: 0,
    yearlyHours: 0,
    currentYear: new Date().getFullYear()
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats({
        weeklyHours: data.weeklyHours || 0,
        monthlyHours: data.monthlyHours || 0,
        yearlyHours: data.yearlyHours || 0,
        currentYear: data.currentYear || new Date().getFullYear()
      })
    } catch (error) {
      console.error('Failed to fetch time period stats:', error)
    }
  }

  const periods = [
    {
      icon: '📅',
      label: 'This Week',
      hours: stats.weeklyHours,
      goal: WEEKLY_GOAL,
      gradient: 'from-blue-500 to-cyan-400',
      bgColor: 'rgba(59, 130, 246, 0.2)'
    },
    {
      icon: '🗓️',
      label: 'This Month',
      hours: stats.monthlyHours,
      goal: MONTHLY_GOAL,
      gradient: 'from-purple-500 to-pink-400',
      bgColor: 'rgba(168, 85, 247, 0.2)'
    },
    {
      icon: '🎯',
      label: `Year ${stats.currentYear}`,
      hours: stats.yearlyHours,
      goal: YEARLY_GOAL,
      gradient: 'from-orange-500 to-amber-400',
      bgColor: 'rgba(249, 115, 22, 0.2)'
    }
  ]

  return (
    <div className="glass-card" style={{ padding: '32px' }}>
      <div className="flex items-center gap-3" style={{ marginBottom: '32px' }}>
        <div className="w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center">
          <span className="text-xl">⏱️</span>
        </div>
        <h2 className="text-xl font-semibold">Time Period Progress</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {periods.map((period) => {
          const progress = Math.min((period.hours / period.goal) * 100, 100)

          return (
            <div
              key={period.label}
              className="rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              style={{ padding: '24px 28px' }}
            >
              {/* Header */}
              <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
                <span className="text-2xl">{period.icon}</span>
                <span className="text-base text-white/60 font-medium">{period.label}</span>
              </div>

              {/* Hours Display */}
              <div className="text-4xl font-bold text-white" style={{ marginBottom: '16px' }}>
                {period.hours.toFixed(1)}
                <span className="text-xl text-white/40 font-normal ml-2">hrs</span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden" style={{ marginBottom: '12px' }}>
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${period.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Progress Text */}
              <div className="flex justify-between text-sm text-white/40">
                <span>{progress.toFixed(0)}% of goal</span>
                <span>{period.goal}h target</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reset Notice */}
      <div className="mt-6 text-center text-sm text-white/30">
        <span>📌 Year counter resets on Jan 1st each year (started 2026)</span>
      </div>
    </div>
  )
}
