'use client'

import { useEffect, useState } from 'react'
import { MASTERY_GOAL } from '@/lib/constants'

interface Stats {
  streak: number
  dailyAverage: number
  todayHours: number
  yesterdayHours: number
  totalHours: number
}

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats>({
    streak: 0,
    dailyAverage: 0,
    todayHours: 0,
    yesterdayHours: 0,
    totalHours: 0
  })

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

  const remaining = Math.max(0, MASTERY_GOAL - stats.totalHours)
  const avgHoursPerDay = stats.dailyAverage || 3
  const daysToMastery = Math.ceil(remaining / avgHoursPerDay)
  const yearsToMastery = (daysToMastery / 365).toFixed(1)
  const todayVsYesterday = stats.todayHours - stats.yesterdayHours

  const statCards = [
    {
      icon: '🔥',
      label: 'Current Streak',
      value: `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`,
    },
    {
      icon: '📊',
      label: 'Daily Average',
      value: `${stats.dailyAverage.toFixed(1)}h`,
    },
    {
      icon: '⏳',
      label: 'Time to Mastery',
      value: `~${yearsToMastery} years`,
      subtext: `at ${avgHoursPerDay.toFixed(1)}h/day`,
    },
    {
      icon: '📈',
      label: 'Today vs Yesterday',
      value: todayVsYesterday >= 0 ? `+${todayVsYesterday.toFixed(1)}h` : `${todayVsYesterday.toFixed(1)}h`,
      subtext: `${stats.todayHours.toFixed(1)}h today · ${stats.yesterdayHours.toFixed(1)}h yesterday`,
    }
  ]

  return (
    <div className="glass-card">
      <div className="flex items-center gap-3 mb-10 mt-10" style={{ marginBottom: '32px' }}>
        <div className="w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center">
          <span className="text-xl">📈</span>
        </div>
        <h2 className="text-xl font-semibold">Your Stats</h2>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '32px' }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px' }}
            className="rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-base text-white/50">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {stat.value}
            </div>
            {stat.subtext && (
              <div className="text-sm text-white/40">{stat.subtext}</div>
            )}
          </div>
        ))}
      </div>

      {/* Pace Calculator */}
      <div className="bg-[#2A2A2A] border border-[#3A3A3A]" style={{ padding: '32px', marginTop: '32px' }}>
        <div className="flex items-center justify-between">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="text-base text-white/50">To reach mastery in 5 years</div>
            <div className="text-2xl font-bold">
              {(remaining / (5 * 365)).toFixed(1)} hours/day
            </div>
          </div>
          <div className="text-5xl opacity-50">🎯</div>
        </div>
      </div>
    </div>
  )
}
