'use client'

import { useEffect, useState } from 'react'
import { CATEGORIES } from '@/lib/constants'
import { formatDate, formatTime } from '@/lib/calculations'

interface Entry {
  id: string
  date: string
  hours: number
  category: string
  description: string | null
  createdAt: string
}

interface RecentActivityProps {
  onEntryDeleted?: () => void
}

export default function RecentActivity({ onEntryDeleted }: RecentActivityProps) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    try {
      const res = await fetch('/api/entries?limit=10')
      const data = await res.json()
      setEntries(data)
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this entry?')) return

    try {
      const res = await fetch(`/api/entries?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setEntries(entries.filter(e => e.id !== id))
        if (onEntryDeleted) onEntryDeleted()
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '32px' }}>
        <div className="text-center py-12 text-white/50">Loading...</div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="glass-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center">
            <span className="text-xl">📝</span>
          </div>
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>

        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-white/50">No entries yet</p>
          <p className="text-white/30 text-sm">Log your first hours to begin your journey!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ padding: '32px' }}>
      <div className="flex items-center gap-3" style={{ marginBottom: '32px' }}>
        <div className="w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center">
          <span className="text-xl">📝</span>
        </div>
        <h2 className="text-xl font-semibold">Recent Activity</h2>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {entries.map((entry, index) => {
          const cat = CATEGORIES[entry.category as keyof typeof CATEGORIES]

          return (
            <div
              key={entry.id}
              className="activity-item group rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              style={{ animationDelay: `${index * 50}ms`, display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px' }}
            >
              {/* Category Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${cat?.color}30, ${cat?.color}10)` }}
              >
                <span className="text-2xl">{cat?.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg">{entry.hours}h</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60 text-sm">{cat?.name}</span>
                </div>
                <p className="text-white/50 text-sm truncate">{entry.description}</p>
                <div className="text-white/30 text-xs mt-1">
                  {formatDate(entry.date)} at {formatTime(entry.createdAt)}
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(entry.id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                title="Delete entry"
              >
                🗑️
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
