'use client'

import { useEffect, useState } from 'react'

// GitHub contribution green color scale
const INTENSITY_COLORS: Record<number, string> = {
  0: '#3A3A3A',  // Empty - slightly visible
  1: '#0e4429',  // Low (1 entry)
  2: '#006d32',  // Medium (2 entries)
  3: '#26a641',  // Medium-high (3 entries)
  4: '#39d353',  // High (4+ entries)
}

type CalendarData = Record<string, { count: number; hours: number }>

export default function ContributionCalendar() {
  const [calendarData, setCalendarData] = useState<CalendarData>({})
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; hours: number; x: number; y: number } | null>(null)

  useEffect(() => {
    fetchCalendarData()
  }, [selectedYear])

  async function fetchCalendarData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/calendar?year=${selectedYear}`)
      const json = await res.json()
      setCalendarData(json.data || {})
    } catch (error) {
      console.error('Failed to fetch calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate all weeks for the year - FIXED to cover entire year
  function generateYearGrid(): (string | null)[][] {
    const weeks: (string | null)[][] = []

    // Start from Jan 1
    const yearStart = new Date(selectedYear, 0, 1)
    // Adjust to the Sunday before or on Jan 1
    const startDay = yearStart.getDay()
    const gridStart = new Date(yearStart)
    gridStart.setDate(gridStart.getDate() - startDay)

    // We need 53 weeks to cover the full year
    for (let w = 0; w < 53; w++) {
      const week: (string | null)[] = []

      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(gridStart)
        currentDate.setDate(gridStart.getDate() + (w * 7) + d)

        if (currentDate.getFullYear() === selectedYear) {
          const month = String(currentDate.getMonth() + 1).padStart(2, '0')
          const day = String(currentDate.getDate()).padStart(2, '0')
          const dateStr = `${selectedYear}-${month}-${day}`
          week.push(dateStr)
        } else {
          week.push(null)
        }
      }

      weeks.push(week)
    }

    return weeks
  }

  function getIntensityLevel(count: number): number {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count === 2) return 2
    if (count === 3) return 3
    return 4
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const yearGrid = generateYearGrid()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Calculate total stats
  const totalEntries = Object.values(calendarData).reduce((sum, d) => sum + d.count, 0)
  const totalHours = Object.values(calendarData).reduce((sum, d) => sum + d.hours, 0)
  const activeDays = Object.keys(calendarData).length

  // Debug: log calendar data
  console.log('Calendar data keys:', Object.keys(calendarData))

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Contribution Calendar</h3>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            <span>{totalEntries} entries</span>
            <span>•</span>
            <span>{totalHours.toFixed(1)} hours</span>
            <span>•</span>
            <span>{activeDays} active days</span>
          </div>
        </div>

        {/* Year selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setSelectedYear(y => y - 1)}
            style={{ background: '#333', border: '1px solid #3A3A3A', color: 'white', padding: '4px 8px', cursor: 'pointer' }}
          >
            ←
          </button>
          <span style={{ fontWeight: 600, minWidth: '4rem', textAlign: 'center' }}>{selectedYear}</span>
          <button
            onClick={() => setSelectedYear(y => y + 1)}
            style={{ background: '#333', border: '1px solid #3A3A3A', color: 'white', padding: '4px 8px', cursor: 'pointer' }}
            disabled={selectedYear >= new Date().getFullYear()}
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: 'rgba(255,255,255,0.6)' }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Month labels */}
            <div style={{ display: 'flex', marginBottom: '4px', paddingLeft: '28px' }}>
              {months.map((month) => (
                <span
                  key={month}
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.6)',
                    width: `${100 / 12}%`,
                    minWidth: '40px'
                  }}
                >
                  {month}
                </span>
              ))}
            </div>

            {/* Main grid */}
            <div style={{ display: 'flex', gap: '2px' }}>
              {/* Day labels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: '4px', width: '24px' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', height: '11px' }}></span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', height: '11px' }}>Mon</span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', height: '11px' }}></span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', height: '11px' }}>Wed</span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', height: '11px' }}></span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', height: '11px' }}>Fri</span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', height: '11px' }}></span>
              </div>

              {/* Weeks */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {yearGrid.map((week, weekIdx) => (
                  <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {week.map((date, dayIdx) => {
                      if (!date) {
                        return <div key={dayIdx} style={{ width: '11px', height: '11px', backgroundColor: 'transparent' }} />
                      }

                      const data = calendarData[date] || { count: 0, hours: 0 }
                      const level = getIntensityLevel(data.count)
                      const color = INTENSITY_COLORS[level]
                      const isToday = date === new Date().toISOString().split('T')[0]

                      return (
                        <div
                          key={date}
                          style={{
                            width: '11px',
                            height: '11px',
                            backgroundColor: color,
                            cursor: 'pointer',
                            outline: isToday ? '2px solid #667eea' : 'none',
                            outlineOffset: '1px'
                          }}
                          title={`${date}: ${data.count} entries, ${data.hours}h`}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            setHoveredDay({
                              date,
                              count: data.count,
                              hours: data.hours,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 10
                            })
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '12px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  style={{ width: '11px', height: '11px', backgroundColor: INTENSITY_COLORS[level] }}
                />
              ))}
              <span>More</span>
            </div>
          </>
        )}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          style={{
            position: 'fixed',
            left: hoveredDay.x,
            top: hoveredDay.y,
            transform: 'translate(-50%, -100%)',
            background: '#333',
            border: '1px solid #3A3A3A',
            padding: '8px 12px',
            fontSize: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}
        >
          <strong style={{ color: 'white' }}>{formatDate(hoveredDay.date)}</strong>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>
            {hoveredDay.count === 0
              ? 'No entries'
              : `${hoveredDay.count} ${hoveredDay.count === 1 ? 'entry' : 'entries'} • ${hoveredDay.hours.toFixed(1)}h`
            }
          </span>
        </div>
      )}
    </div>
  )
}
