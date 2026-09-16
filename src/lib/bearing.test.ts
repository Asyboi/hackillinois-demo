import { describe, expect, it } from 'vitest'
import type { HackEvent } from '../api/types'
import { bearingDegrees, distanceMeters, headingFor, homeCoordinate } from './bearing'

// The three coordinate pairs that exist in the live data.
const SIEBEL_CS = { latitude: 40.113812, longitude: -88.224937 }
const SIEBEL_DESIGN = { latitude: 40.1026852, longitude: -88.235361 }
const SIDNEY_LU = { latitude: 40.1107766, longitude: -88.2273495 }

const stub = (locations: HackEvent['locations']): HackEvent => ({
  eventId: String(Math.random()),
  name: 'stub',
  description: '',
  startTime: 0,
  endTime: 3600,
  eventType: 'OTHER',
  locations,
  points: 0,
})

const at = (coord: { latitude: number; longitude: number }) => stub([{ description: 'x', ...coord }])

describe('homeCoordinate', () => {
  it('is the most common coordinate pair across all events', () => {
    const events = [at(SIEBEL_CS), at(SIEBEL_DESIGN), at(SIEBEL_CS), at(SIDNEY_LU), at(SIEBEL_CS)]
    expect(homeCoordinate(events)).toEqual(SIEBEL_CS)
  })

  it('ignores events with no location', () => {
    expect(homeCoordinate([stub([]), at(SIDNEY_LU)])).toEqual(SIDNEY_LU)
  })

  it('is null when nothing has a location', () => {
    expect(homeCoordinate([stub([]), stub([])])).toBeNull()
  })
})

describe('bearingDegrees', () => {
  const origin = { latitude: 0, longitude: 0 }

  it('reads the compass points', () => {
    expect(bearingDegrees(origin, { latitude: 1, longitude: 0 })).toBeCloseTo(0, 5)
    expect(bearingDegrees(origin, { latitude: 0, longitude: 1 })).toBeCloseTo(90, 5)
    expect(bearingDegrees(origin, { latitude: -1, longitude: 0 })).toBeCloseTo(180, 5)
    expect(bearingDegrees(origin, { latitude: 0, longitude: -1 })).toBeCloseTo(270, 5)
  })

  it('points south-south-west from Siebel CS to Sidney Lu', () => {
    const degrees = bearingDegrees(SIEBEL_CS, SIDNEY_LU)
    expect(degrees).toBeGreaterThan(200)
    expect(degrees).toBeLessThan(220)
  })
})

describe('distanceMeters', () => {
  it('knows a degree of latitude is about 111 km', () => {
    const d = distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 })
    expect(d).toBeGreaterThan(111_000)
    expect(d).toBeLessThan(111_500)
  })

  it('puts Sidney Lu a few hundred metres from Siebel CS', () => {
    const d = distanceMeters(SIEBEL_CS, SIDNEY_LU)
    expect(d).toBeGreaterThan(350)
    expect(d).toBeLessThan(450)
  })

  it('puts Siebel Center for Design about a mile and a half away', () => {
    const d = distanceMeters(SIEBEL_CS, SIEBEL_DESIGN)
    expect(d).toBeGreaterThan(1400)
    expect(d).toBeLessThan(1650)
  })
})

describe('headingFor', () => {
  it('is on station for an event at home', () => {
    expect(headingFor(at(SIEBEL_CS), SIEBEL_CS)).toEqual({ kind: 'on-station' })
  })

  it('is on station within the 25 m threshold, so GPS jitter never swings the needle', () => {
    const nearby = { latitude: SIEBEL_CS.latitude + 0.0001, longitude: SIEBEL_CS.longitude }
    expect(headingFor(at(nearby), SIEBEL_CS)).toEqual({ kind: 'on-station' })
  })

  it('is on station for an event with no location', () => {
    expect(headingFor(stub([]), SIEBEL_CS)).toEqual({ kind: 'on-station' })
  })

  it('is on station when there is no home to steer from', () => {
    expect(headingFor(at(SIDNEY_LU), null)).toEqual({ kind: 'on-station' })
  })

  it('gives a bearing and distance for an event in another building', () => {
    const heading = headingFor(at(SIDNEY_LU), SIEBEL_CS)
    expect(heading.kind).toBe('bearing')
    if (heading.kind !== 'bearing') return
    expect(Math.round(heading.degrees)).toBeGreaterThan(200)
    expect(heading.meters).toBeGreaterThan(350)
  })
})
