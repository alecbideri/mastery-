'use client'

import { useState, useEffect, useRef } from 'react'
import { CATEGORIES } from '@/lib/constants'

interface TimeRecorderProps {
  onEntryAdded?: () => void
}

export default function TimeRecorder({ onEntryAdded }: TimeRecorderProps) {
  // Manual entry state
  const [hours, setHours] = useState('')
  const [category, setCategory] = useState('software')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Timer state
  const [isTimerMode, setIsTimerMode] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerDescription, setTimerDescription] = useState('')
  const [timerCategory, setTimerCategory] = useState('software')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - (elapsedSeconds * 1000)
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          setElapsedSeconds(elapsed)
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleStartTimer = () => {
    setIsRunning(true)
  }

  const handleStopTimer = async () => {
    // Capture current values BEFORE any state changes
    const currentElapsed = elapsedSeconds
    const currentCategory = timerCategory
    const currentDescription = timerDescription

    // Stop the timer
    setIsRunning(false)

    if (currentElapsed < 60) {
      alert('Timer must run for at least 1 minute to save.')
      return
    }

    // Convert seconds to hours (with 2 decimal precision)
    const hoursWorked = Math.round((currentElapsed / 3600) * 100) / 100

    console.log('Saving timer entry:', { hoursWorked, currentCategory, currentDescription, currentElapsed })

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours: hoursWorked,
          category: currentCategory,
          description: currentDescription.trim() || `${CATEGORIES[currentCategory as keyof typeof CATEGORIES].name} session`
        })
      })

      console.log('Save response:', res.status, res.ok)

      if (res.ok) {
        setShowSuccess(true)
        setElapsedSeconds(0)
        setTimerDescription('')
        setTimeout(() => setShowSuccess(false), 2000)
        if (onEntryAdded) onEntryAdded()
      } else {
        const errorData = await res.json()
        console.error('Save failed:', errorData)
        alert('Failed to save entry. Please try again.')
      }
    } catch (error) {
      console.error('Error saving timer entry:', error)
      alert('Error saving entry. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetTimer = () => {
    setIsRunning(false)
    setElapsedSeconds(0)
  }

  // Manual entry submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hours || parseFloat(hours) <= 0) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours: parseFloat(hours),
          category,
          description: description.trim() || `${CATEGORIES[category as keyof typeof CATEGORIES].name} session`
        })
      })

      if (res.ok) {
        setHours('')
        setDescription('')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
        if (onEntryAdded) onEntryAdded()
      }
    } catch (error) {
      console.error('Error adding entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass-card">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center">
            <span className="text-xl">{isTimerMode ? '⏱️' : '✏️'}</span>
          </div>
          <h2 className="text-xl font-semibold">{isTimerMode ? 'Timer Mode' : 'Log Your Hours'}</h2>
        </div>
        <button
          onClick={() => {
            if (!isRunning) {
              setIsTimerMode(!isTimerMode)
            }
          }}
          disabled={isRunning}
          className="text-sm px-3 py-1 border border-[#3A3A3A] hover:bg-[#333] transition-colors"
          style={{ color: isRunning ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)' }}
        >
          {isTimerMode ? 'Manual Entry' : 'Use Timer'}
        </button>
      </div>

      {isTimerMode ? (
        /* Timer Mode UI */
        <div className="space-y-6">
          {/* Timer Display */}
          <div className="text-center" style={{ padding: '24px 0' }}>
            <div
              className="font-mono font-bold"
              style={{
                fontSize: '3.5rem',
                color: isRunning ? '#39d353' : 'white',
                textShadow: isRunning ? '0 0 20px rgba(57, 211, 83, 0.5)' : 'none'
              }}
            >
              {formatTime(elapsedSeconds)}
            </div>
            {isRunning && (
              <div className="text-sm text-white/50 mt-2">
                Working on: {CATEGORIES[timerCategory as keyof typeof CATEGORIES].name}
              </div>
            )}
          </div>

          {/* Category Selection (disabled when running) */}
          {!isRunning && (
            <div style={{ marginBottom: '10px' }}>
              <label className="block text-sm text-white/50 mb-3" style={{ marginBottom: '10px' }}>Category</label>
              <div className="grid grid-cols-2 gap-5">
                {Object.values(CATEGORIES).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTimerCategory(cat.id)}
                    className={`p-5 rounded-xl border transition-all text-left ${timerCategory === cat.id
                      ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    style={{ padding: '10px' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description (editable when running) */}
          <div>
            <label className="block text-sm text-white/50 mb-3">What are you working on?</label>
            <textarea
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              placeholder="Describe your current task..."
              className="form-input resize-none min-h-[80px]"
            />
          </div>

          {/* Timer Controls */}
          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={handleStartTimer}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                style={{ background: '#22c55e' }}
              >
                <span>▶</span>
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={handleStopTimer}
                disabled={isSubmitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                style={{ background: '#ef4444' }}
              >
                <span>⏹</span>
                <span>{isSubmitting ? 'Saving...' : 'Stop & Save'}</span>
              </button>
            )}

            {elapsedSeconds > 0 && !isRunning && (
              <button
                onClick={handleResetTimer}
                className="px-4 py-2 border border-[#3A3A3A] hover:bg-[#333] transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {showSuccess && (
            <div className="text-center text-green-400 py-2">
              ✓ Entry saved successfully!
            </div>
          )}
        </div>
      ) : (
        /* Manual Entry Mode UI */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hours Input */}
          <div style={{ marginBottom: '10px' }}>
            <label className="block text-sm text-white/50 mb-3" style={{ marginBottom: '10px' }}>Hours Spent</label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="2.5"
              className="form-input"
              required
            />
          </div>

          {/* Category Selection */}
          <div style={{ marginBottom: '10px' }}>
            <label className="block text-sm text-white/50 mb-3" style={{ marginBottom: '10px' }}>Category</label>
            <div className="grid grid-cols-2 gap-5">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-5 rounded-xl border transition-all text-left ${category === cat.id
                    ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  style={{ padding: '10px' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '5px' }}>
            <label className="block text-sm text-white/50 mb-3">What did you work on?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Built a new feature, read research papers, designed UI..."
              className="form-input resize-none min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !hours}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              } ${showSuccess ? 'bg-green-600' : ''}`}
          >
            {showSuccess ? (
              <>
                <span>✓</span>
                <span>Logged Successfully!</span>
              </>
            ) : isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Logging...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Log Entry</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
