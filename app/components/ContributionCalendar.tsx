'use client'

import { useEffect, useState, useRef } from 'react'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    fetchCalendarData()
  }, [selectedYear])

  // Measure container width for responsive sizing
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [loading])

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

  // Generate all days of the year organized by weeks
  function generateYearGrid(): (string | null)[][] {
    const weeks: (string | null)[][] = []

    const jan1 = new Date(selectedYear, 0, 1)
    const dec31 = new Date(selectedYear, 11, 31)

    const jan1DayOfWeek = jan1.getDay()
    const startDate = new Date(jan1)
    startDate.setDate(startDate.getDate() - jan1DayOfWeek)

    const dec31DayOfWeek = dec31.getDay()
    const endDate = new Date(dec31)
    endDate.setDate(endDate.getDate() + (6 - dec31DayOfWeek))

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const week: (string | null)[] = []

      for (let d = 0; d < 7; d++) {
        if (currentDate.getFullYear() === selectedYear) {
          const year = currentDate.getFullYear()
          const month = String(currentDate.getMonth() + 1).padStart(2, '0')
          const day = String(currentDate.getDate()).padStart(2, '0')
          week.push(`${year}-${month}-${day}`)
        } else {
          week.push(null)
        }
        currentDate.setDate(currentDate.getDate() + 1)
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
  const today = new Date().toISOString().split('T')[0]
  const totalWeeks = yearGrid.length

  // Fixed cell size for consistency
  const cellSize = 11
  const cellGap = 3
  const dayLabelWidth = 28

  // Calculate if we need to scroll (for small screens)
  const minGridWidth = totalWeeks * (cellSize + cellGap) + dayLabelWidth
  const needsScroll = containerWidth > 0 && containerWidth < minGridWidth

  // Calculate total stats
  const totalEntries = Object.values(calendarData).reduce((sum, d) => sum + d.count, 0)
  const totalHours = Object.values(calendarData).reduce((sum, d) => sum + d.hours, 0)
  const activeDays = Object.keys(calendarData).length

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
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
          <span style={{ fontWeight: 600, minWidth: '3rem', textAlign: 'center' }}>{selectedYear}</span>
          <button
            onClick={() => setSelectedYear(y => y + 1)}
            style={{ background: '#333', border: '1px solid #3A3A3A', color: 'white', padding: '4px 8px', cursor: 'pointer' }}
            disabled={selectedYear >= new Date().getFullYear()}
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid - scrollable container */}
      <div
        ref={containerRef}
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '8px'
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: 'rgba(255,255,255,0.6)' }}>
            Loading...
          </div>
        ) : (
          <div style={{
            minWidth: `${minGridWidth}px`,
            width: needsScroll ? `${minGridWidth}px` : '100%'
          }}>
            {/* Month labels */}
            <div style={{
              display: 'flex',
              marginBottom: '4px',
              marginLeft: `${dayLabelWidth}px`
            }}>
              {months.map((month) => (
                <span
                  key={month}
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.5)',
                    flex: 1,
                    textAlign: 'left'
                  }}
                >
                  {month}
                </span>
              ))}
            </div>

            {/* Grid with day labels */}
            <div style={{ display: 'flex' }}>
              {/* Day labels column */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: `${dayLabelWidth}px`,
                flexShrink: 0
              }}>
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${cellSize}px`,
                      marginBottom: `${cellGap}px`,
                      fontSize: '0.55rem',
                      color: 'rgba(255,255,255,0.4)',
                      lineHeight: `${cellSize}px`
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Weeks grid */}
              <div style={{
                display: 'flex',
                gap: `${cellGap}px`,
                flex: 1,
                justifyContent: needsScroll ? 'flex-start' : 'space-between'
              }}>
                {yearGrid.map((week, weekIdx) => (
                  <div
                    key={weekIdx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: `${cellGap}px`,
                      flexShrink: 0
                    }}
                  >
                    {week.map((date, dayIdx) => {
                      if (!date) {
                        return (
                          <div
                            key={dayIdx}
                            style={{
                              width: `${cellSize}px`,
                              height: `${cellSize}px`,
                              backgroundColor: 'transparent'
                            }}
                          />
                        )
                      }

                      const data = calendarData[date] || { count: 0, hours: 0 }
                      const level = getIntensityLevel(data.count)
                      const color = INTENSITY_COLORS[level]
                      const isToday = date === today

                      return (
                        <div
                          key={date}
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                            backgroundColor: color,
                            cursor: 'pointer',
                            outline: isToday ? '2px solid #667eea' : 'none',
                            outlineOffset: '1px'
                          }}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '12px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: INTENSITY_COLORS[level] }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
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
            background: '#222',
            border: '1px solid #3A3A3A',
            padding: '8px 12px',
            fontSize: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
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
