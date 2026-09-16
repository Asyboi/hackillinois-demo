import { describe, expect, it } from 'vitest'
import { hackathonDay, groupByDay } from './days'
import type { HackEvent } from '../api/types'

// Helper: Unix seconds for a Chicago local time in Feb/Mar 2026 (CST, UTC-6).
const chicago = (month: number, day: number, hour: number, minute = 0) =>
  Date.UTC(2026, month - 1, day, hour + 6, minute) / 1000

const stub = (startTime: number): HackEvent => ({
  eventId: String(startTime),
  name: 'stub',
  description: '',
  startTime,
  endTime: startTime + 3600,
  eventType: 'OTHER',
  locations: [],
  points: 0,
})

describe('hackathonDay', () => {
  it('puts Friday afternoon on Friday', () => {
    expect(hackathonDay(chicago(2, 27, 14))).toBe('friday')
  })

  it('puts 12:30 AM Saturday on Friday, because the day boundary is 5 AM', () => {
    expect(hackathonDay(chicago(2, 28, 0, 30))).toBe('friday')
  })

  it('puts 12:30 AM Sunday on Saturday', () => {
    expect(hackathonDay(chicago(3, 1, 0, 30))).toBe('saturday')
  })

  it('puts the 6 AM Sunday deadline on Sunday', () => {
    expect(hackathonDay(chicago(3, 1, 6))).toBe('sunday')
  })

  it('treats exactly 5 AM as the new day', () => {
    expect(hackathonDay(chicago(2, 28, 5))).toBe('saturday')
  })
})

describe('groupByDay', () => {
  it('gives Friday 20, Saturday 17 and Sunday 4 for the live-data shape', () => {
    const events = [
      ...Array.from({ length: 19 }, (_, i) => stub(chicago(2, 27, 14) + i * 60)),
      stub(chicago(2, 28, 0, 30)),
      ...Array.from({ length: 16 }, (_, i) => stub(chicago(2, 28, 10) + i * 60)),
      stub(chicago(3, 1, 0, 30)),
      ...Array.from({ length: 4 }, (_, i) => stub(chicago(3, 1, 6) + i * 60)),
    ]
    const groups = groupByDay(events)
    expect(groups.friday).toHaveLength(20)
    expect(groups.saturday).toHaveLength(17)
    expect(groups.sunday).toHaveLength(4)
  })
})
