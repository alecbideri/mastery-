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

    return NextResponse.json({
      totalHours,
      categoryBreakdown,
      todayHours,
      yesterdayHours,
      streak,
      dailyAverage,
      activeDays,
      totalEntries: entries.length
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
