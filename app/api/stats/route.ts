import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stats - Get all statistics
export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: { date: 'desc' }
    })

    // Total hours
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0)

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {}
    entries.forEach(entry => {
      if (!categoryBreakdown[entry.category]) {
        categoryBreakdown[entry.category] = 0
      }
      categoryBreakdown[entry.category] += entry.hours
    })

    // Today's hours
    const today = new Date().toISOString().split('T')[0]
    const todayHours = entries
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.hours, 0)

    // Yesterday's hours
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const yesterdayHours = entries
      .filter(e => e.date === yesterday)
      .reduce((sum, e) => sum + e.hours, 0)

    // Calculate streak
    const uniqueDates = [...new Set(entries.map(e => e.date))].sort().reverse()
    let streak = 0

    if (uniqueDates.length > 0) {
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1
        let currentDate = new Date(uniqueDates[0])

        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(currentDate.getTime() - 86400000)
          const entryDate = new Date(uniqueDates[i])

          if (entryDate.toISOString().split('T')[0] === prevDate.toISOString().split('T')[0]) {
            streak++
            currentDate = entryDate
          } else {
            break
          }
        }
      }
    }

    // Daily average
    const activeDays = uniqueDates.length
    const dailyAverage = activeDays > 0 ? totalHours / activeDays : 0

    // Time period calculations (week, month, year)
    const now = new Date()
    const currentYear = now.getFullYear()

    // Get start of current week (Monday)
    const startOfWeek = new Date(now)
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Adjust for Monday start
    startOfWeek.setDate(now.getDate() - diff)
    startOfWeek.setHours(0, 0, 0, 0)
    const weekStartStr = startOfWeek.toISOString().split('T')[0]

    // Get start of current month
    const startOfMonth = new Date(currentYear, now.getMonth(), 1)
    const monthStartStr = startOfMonth.toISOString().split('T')[0]

    // Get start of current year (resets each year, starting from 2026)
    const yearStartStr = `${currentYear}-01-01`

    // Calculate hours for each period
    const weeklyHours = entries
      .filter(e => e.date >= weekStartStr)
      .reduce((sum, e) => sum + e.hours, 0)

    const monthlyHours = entries
      .filter(e => e.date >= monthStartStr)
      .reduce((sum, e) => sum + e.hours, 0)

    const yearlyHours = entries
      .filter(e => e.date >= yearStartStr && e.date.startsWith(String(currentYear)))
      .reduce((sum, e) => sum + e.hours, 0)

    return NextResponse.json({
      totalHours,
      categoryBreakdown,
      todayHours,
      yesterdayHours,
      streak,
      dailyAverage,
      activeDays,
      totalEntries: entries.length,
      // Time period stats
      weeklyHours,
      monthlyHours,
      yearlyHours,
      currentYear,
      currentWeekStart: weekStartStr,
      currentMonthStart: monthStartStr
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
