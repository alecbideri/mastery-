import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/calendar?year=2024
// Returns entries grouped by date for the contribution calendar
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year') || new Date().getFullYear().toString()

    // Get start and end dates for the year
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    // Fetch all entries for the year
    const entries = await prisma.entry.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        date: true,
        hours: true
      }
    })

    // Group entries by date and count
    const calendarData: Record<string, { count: number; hours: number }> = {}

    entries.forEach((entry: { date: string; hours: number }) => {
      if (!calendarData[entry.date]) {
        calendarData[entry.date] = { count: 0, hours: 0 }
      }
      calendarData[entry.date].count++
      calendarData[entry.date].hours += entry.hours
    })

    return NextResponse.json({
      year,
      data: calendarData
    })
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}
