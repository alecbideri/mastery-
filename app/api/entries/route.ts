import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/entries - Get all entries or filter by date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')

    const entries = await prisma.entry.findMany({
      where: date ? { date } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Entries GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

// POST /api/entries - Create a new entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hours, category, description, date } = body

    if (!hours || !category) {
      return NextResponse.json(
        { error: 'Hours and category are required' },
        { status: 400 }
      )
    }

    const entry = await prisma.entry.create({
      data: {
        hours: parseFloat(hours),
        category,
        description: description || `${category} session`,
        date: date || new Date().toISOString().split('T')[0]
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Entries POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}

// DELETE /api/entries?id=xxx - Delete an entry
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    await prisma.entry.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Entries DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    )
  }
}
