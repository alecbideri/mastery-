'use client'

import { useState, useCallback } from 'react'
import Header from './components/Header'
import ProgressRing from './components/ProgressRing'
import TimeRecorder from './components/TimeRecorder'
import CategoryBreakdown from './components/CategoryBreakdown'
import RecentActivity from './components/RecentActivity'
import StatsPanel from './components/StatsPanel'
import AchievementBadges from './components/AchievementBadges'
import ContributionCalendar from './components/ContributionCalendar'
import TimePeriodStats from './components/TimePeriodStats'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <div className="app-container" key={refreshKey}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section - Progress Ring + Time Recorder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <ProgressRing />
          <TimeRecorder onEntryAdded={handleRefresh} />
        </div>

        {/* Achievements */}
        <AchievementBadges />

        {/* Time Period Progress (Week/Month/Year) */}
        <TimePeriodStats />

        {/* Stats + Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <StatsPanel />
          <CategoryBreakdown />
        </div>

        {/* Contribution Calendar */}
        <ContributionCalendar />

        {/* Recent Activity */}
        <RecentActivity onEntryDeleted={handleRefresh} />

        {/* Footer */}
        <footer className="text-center py-8 text-white/30 text-sm">
          <p>Journey to 10,000 hours per category</p>
          <p className="mt-1">Inspired by Malcolm Gladwell&apos;s 10,000 hour rule</p>
        </footer>
      </main>
    </div>
  )
}
