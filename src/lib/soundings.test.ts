import { describe, expect, it } from 'vitest'
import type { HackEvent } from '../api/types'
import { stopDepthsMeters } from './soundings'

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

// Friday's shape: 4 sunlit, 9 twilight, 6 midnight, 1 abyssal.
const friday = [
  [14, 0], [14, 30], [15, 0], [17, 0],
  [18, 0], [18, 0], [19, 30], [19, 30], [19, 30], [19, 30], [20, 30], [20, 30], [21, 0],
  [22, 0], [22, 0], [22, 30], [23, 0], [23, 0], [23, 0],
].map(([h, m]) => stub(chicago(2, 27, h, m)))
friday.push(stub(chicago(2, 28, 0, 30)))

const sunday = [
  stub(chicago(3, 1, 6)),
  stub(chicago(3, 1, 9)),
  stub(chicago(3, 1, 11, 30)),
  stub(chicago(3, 1, 14, 15)),
]

describe('stopDepthsMeters', () => {
  it('steps the four sunlit stops evenly down to the twilight boundary', () => {
    expect(stopDepthsMeters(friday).slice(0, 4)).toEqual([50, 100, 150, 200])
  })

  it('reaches each zone boundary on the last stop of the zone', () => {
    const depths = stopDepthsMeters(friday)
    expect(depths[3]).toBe(200)
    expect(depths[12]).toBe(1_000)
    expect(depths[18]).toBe(4_000)
  })

  it('lands the last stop of an abyssal day on the seafloor', () => {
    const depths = stopDepthsMeters(friday)
    expect(depths[19]).toBe(6_000)
  })

  it('steps evenly within a crowded zone', () => {
    const twilight = stopDepthsMeters(friday).slice(4, 13)
    const gaps = twilight.slice(1).map((d, i) => d - twilight[i])
    for (const gap of gaps) expect(gap).toBeCloseTo(800 / 9, 6)
  })

  it('climbs on Sunday, surfacing at the closing ceremony', () => {
    const depths = stopDepthsMeters(sunday)
    expect(depths[0]).toBe(200)
    expect(depths[1]).toBeCloseTo(400 / 3, 6)
    expect(depths[2]).toBeCloseTo(200 / 3, 6)
    expect(depths[3]).toBe(0)
  })

  it('returns nothing for an empty day', () => {
    expect(stopDepthsMeters([])).toEqual([])
  })
})
