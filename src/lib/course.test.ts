import { describe, expect, it } from 'vitest'
import type { HackEvent } from '../api/types'
import { MIN_STOP_GAP_PX, plotCourse } from './course'

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

const sunday = [
  stub(chicago(3, 1, 6)),
  stub(chicago(3, 1, 9)),
  stub(chicago(3, 1, 11, 30)),
  stub(chicago(3, 1, 14, 15)),
]

// Friday's shape: four sunlit stops, nine bunched into the twilight zone,
// six midnight, one abyssal.
const friday = [
  [14, 0], [14, 30], [15, 0], [17, 0],
  [18, 0], [18, 0], [19, 30], [19, 30], [19, 30], [19, 30], [20, 30], [20, 30], [21, 0],
  [22, 0], [22, 0], [22, 30], [23, 0], [23, 0], [23, 0],
].map(([h, m]) => stub(chicago(2, 27, h, m)))
friday.push(stub(chicago(2, 28, 0, 30)))

const size = { width: 400, height: 600 }

describe('plotCourse', () => {
  it('plots one stop per event, in order', () => {
    const stops = plotCourse(friday, size)
    expect(stops).toHaveLength(20)
    expect(stops.map((s) => s.index)).toEqual(friday.map((_, i) => i))
  })

  it('descends on Friday and climbs on Sunday, because depth does', () => {
    const fri = plotCourse(friday, size)
    expect(fri[0].y).toBeLessThan(fri[fri.length - 1].y)

    const sun = plotCourse(sunday, size)
    expect(sun[0].y).toBeGreaterThan(sun[sun.length - 1].y)
  })

  it('keeps every pair of stops at least the minimum gap apart vertically', () => {
    const stops = plotCourse(friday, size)
    const ys = stops.map((s) => s.y).sort((a, b) => a - b)
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(MIN_STOP_GAP_PX - 1e-9)
    }
  })

  it('keeps the four 7:30 PM stops in their original order after separating them', () => {
    const stops = plotCourse(friday, size)
    const tracks = stops.slice(6, 10).map((s) => s.y)
    for (let i = 1; i < tracks.length; i++) expect(tracks[i]).toBeGreaterThan(tracks[i - 1])
  })

  it('stays inside the box even when there is not room for the full gap', () => {
    const cramped = { width: 300, height: 200 }
    for (const stop of plotCourse(friday, cramped)) {
      expect(stop.x).toBeGreaterThanOrEqual(0)
      expect(stop.x).toBeLessThanOrEqual(cramped.width)
      expect(stop.y).toBeGreaterThanOrEqual(0)
      expect(stop.y).toBeLessThanOrEqual(cramped.height)
    }
  })

  it('spends the empty water above the first stop before shrinking the gap', () => {
    // Friday's first stop sits at about 11% depth. With exactly enough
    // height for nineteen full gaps, that slack has to be used up.
    const exact = { width: 400, height: 19 * MIN_STOP_GAP_PX }
    const ys = plotCourse(friday, exact)
      .map((s) => s.y)
      .sort((a, b) => a - b)
    expect(ys[0]).toBeCloseTo(0, 6)
    expect(ys[ys.length - 1]).toBeCloseTo(exact.height, 6)
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(MIN_STOP_GAP_PX - 1e-6)
    }
  })

  it('spreads consecutive stops horizontally so the route reads as a journey', () => {
    const stops = plotCourse(friday, size)
    for (let i = 1; i < stops.length; i++) {
      expect(Math.abs(stops[i].x - stops[i - 1].x)).toBeGreaterThan(20)
    }
  })

  it('returns nothing for an empty day', () => {
    expect(plotCourse([], size)).toEqual([])
  })
})
