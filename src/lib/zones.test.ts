import { describe, expect, it } from 'vitest'
import type { HackEvent } from '../api/types'
import { depthForTime, layerOpacities, runContaining, zoneForTime, zoneRuns } from './zones'

const chicago = (month: number, day: number, hour: number, minute = 0) =>
  Date.UTC(2026, month - 1, day, hour + 6, minute) / 1000

const event = (eventId: string, startTime: number) => ({ eventId, startTime }) as HackEvent

describe('runContaining', () => {
  // Sunday's shape: the pre-dawn deadline in twilight, then daylight.
  const sunday = [
    event('deadline', chicago(3, 1, 6)),
    event('showcase', chicago(3, 1, 10)),
    event('closing', chicago(3, 1, 14)),
  ]
  const runs = zoneRuns(sunday)

  it('finds the run of same-zone neighbours around an event', () => {
    expect(runContaining(runs, 'closing')?.events.map((e) => e.eventId)).toEqual([
      'showcase',
      'closing',
    ])
  })

  it('keeps a lone event in a run of its own', () => {
    expect(runContaining(runs, 'deadline')?.zone).toBe('twilight')
    expect(runContaining(runs, 'deadline')?.events).toHaveLength(1)
  })

  it('is null for no event or an unknown one', () => {
    expect(runContaining(runs, null)).toBeNull()
    expect(runContaining(runs, 'nope')).toBeNull()
  })
})

describe('zoneForTime', () => {
  it('is sunlit through the afternoon', () => {
    expect(zoneForTime(chicago(2, 27, 14))).toBe('sunlit')
    expect(zoneForTime(chicago(2, 27, 17))).toBe('sunlit')
  })

  it('turns to twilight at 5:30 PM, so Dinner at 6 is the first twilight stop', () => {
    expect(zoneForTime(chicago(2, 27, 17, 30))).toBe('twilight')
    expect(zoneForTime(chicago(2, 27, 18))).toBe('twilight')
  })

  it('turns to midnight at 9:30 PM', () => {
    expect(zoneForTime(chicago(2, 27, 21))).toBe('twilight')
    expect(zoneForTime(chicago(2, 27, 21, 30))).toBe('midnight')
    expect(zoneForTime(chicago(2, 27, 23))).toBe('midnight')
  })

  it('is abyssal after midnight and before 5 AM', () => {
    expect(zoneForTime(chicago(2, 28, 0, 30))).toBe('abyssal')
  })

  it('is twilight before sunrise, so the 6 AM deadline starts Sunday in the dark', () => {
    expect(zoneForTime(chicago(3, 1, 6))).toBe('twilight')
    expect(zoneForTime(chicago(3, 1, 9))).toBe('sunlit')
  })
})

describe('depthForTime', () => {
  it('only gets deeper from noon to 5 AM', () => {
    const samples = [12, 14, 17, 18, 21, 22, 23].map((h) => depthForTime(chicago(2, 27, h)))
    samples.push(depthForTime(chicago(2, 28, 0, 30)), depthForTime(chicago(2, 28, 4, 59)))
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThan(samples[i - 1])
    }
  })

  it('stays within 0 and 1', () => {
    for (let h = 0; h < 24; h++) {
      const d = depthForTime(chicago(2, 27, h))
      expect(d).toBeGreaterThanOrEqual(0)
      expect(d).toBeLessThanOrEqual(1)
    }
  })

  it('is a single unbroken curve from midnight to 5 AM', () => {
    expect(depthForTime(chicago(2, 28, 0))).toBeCloseTo(0.8, 5)
    expect(depthForTime(chicago(2, 28, 2, 30))).toBeCloseTo(0.9, 5)
  })

  it('surfaces between 5 AM and noon on Sunday', () => {
    expect(depthForTime(chicago(3, 1, 6))).toBeGreaterThan(depthForTime(chicago(3, 1, 9)))
    expect(depthForTime(chicago(3, 1, 9))).toBeGreaterThan(depthForTime(chicago(3, 1, 12)))
  })
})

describe('layerOpacities', () => {
  it('shows only sunlit water at the surface', () => {
    expect(layerOpacities(0)).toEqual({ twilight: 0, midnight: 0, abyssal: 0 })
  })

  it('shows every layer fully at the trench', () => {
    expect(layerOpacities(1)).toEqual({ twilight: 1, midnight: 1, abyssal: 1 })
  })

  it('fades layers in one after another as depth grows', () => {
    const mid = layerOpacities(0.5)
    expect(mid.twilight).toBe(1)
    expect(mid.midnight).toBeGreaterThan(0)
    expect(mid.midnight).toBeLessThan(1)
    expect(mid.abyssal).toBe(0)
  })
})
