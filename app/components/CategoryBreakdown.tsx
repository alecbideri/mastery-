'use client'

import { useEffect, useState } from 'react'
import { CATEGORIES, CATEGORY_MASTERY_GOAL } from '@/lib/constants'

export default function CategoryBreakdown() {
  const [breakdown, setBreakdown] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setBreakdown(data.categoryBreakdown || {})
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const masteredCount = Object.values(breakdown).filter(h => h >= CATEGORY_MASTERY_GOAL).length

  return (
    <div className="glass-card" style={{ padding: '32px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <h2 className="text-xl font-semibold">Category Mastery</h2>
        </div>
        <div className="text-sm text-white/50">
          {masteredCount}/4 Categories Mastered
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {Object.values(CATEGORIES).map((cat) => {
          const hours = breakdown[cat.id] || 0
          const percent = Math.min((hours / CATEGORY_MASTERY_GOAL) * 100, 100)
          const remaining = Math.max(CATEGORY_MASTERY_GOAL - hours, 0)
          const isMastered = hours >= CATEGORY_MASTERY_GOAL

          return (
            <div
              key={cat.id}
              className={`category-card category-${cat.id}`}
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-white/70">{cat.name}</span>
                </div>
                {isMastered && <span className="text-lg">🏆</span>}
              </div>

              <div className="text-3xl font-bold">
                {hours.toFixed(0)}
                <span className="text-lg text-white/50 font-normal ml-1">/ {CATEGORY_MASTERY_GOAL.toLocaleString()}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${isMastered ? 'bg-green-500' : 'bg-[#667eea]'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="text-xs text-white/40">
                {isMastered ? '✓ Mastered!' : `${remaining.toLocaleString()} hrs remaining`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
