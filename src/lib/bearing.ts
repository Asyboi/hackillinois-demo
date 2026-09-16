import type { HackEvent } from '../api/types'

/**
 * The compass. Every location in the API carries a lat/long, but there are
 * only three distinct pairs in the whole schedule because the coordinates
 * resolve buildings, not rooms. A compass is exactly a building-resolution
 * instrument, so this is the one honest use of that field: the needle sits
 * on station nearly all day and swings only when an event is in a different
 * building, which is precisely when an attendee has to go outside. That is
 * the feature, not a bug.
 */
export interface Coordinate {
  latitude: number
  longitude: number
}

/** Closer than this to home counts as home. Wider than any GPS jitter. */
export const ON_STATION_METERS = 25

const EARTH_RADIUS_METERS = 6_371_000
const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const toDegrees = (radians: number) => (radians * 180) / Math.PI

/**
 * Where the hackathon lives: the most common coordinate pair across every
 * located event. Computed from the data rather than hardcoded so the
 * instrument keeps working if the venue moves. Null if nothing has a location.
 */
export function homeCoordinate(events: HackEvent[]): Coordinate | null {
  const tally = new Map<string, { coordinate: Coordinate; count: number }>()
  for (const event of events) {
    for (const { latitude, longitude } of event.locations) {
      const key = `${latitude},${longitude}`
      const entry = tally.get(key) ?? { coordinate: { latitude, longitude }, count: 0 }
      entry.count += 1
      tally.set(key, entry)
    }
  }
  let best: { coordinate: Coordinate; count: number } | null = null
  for (const entry of tally.values()) {
    if (!best || entry.count > best.count) best = entry
  }
  return best?.coordinate ?? null
}

/** Initial great-circle bearing from one point to another, 0 to 360 clockwise from north. */
export function bearingDegrees(from: Coordinate, to: Coordinate): number {
  const lat1 = toRadians(from.latitude)
  const lat2 = toRadians(to.latitude)
  const deltaLng = toRadians(to.longitude - from.longitude)
  const y = Math.sin(deltaLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng)
  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

/** Great-circle distance by the haversine formula. */
export function distanceMeters(from: Coordinate, to: Coordinate): number {
  const lat1 = toRadians(from.latitude)
  const lat2 = toRadians(to.latitude)
  const deltaLat = lat2 - lat1
  const deltaLng = toRadians(to.longitude - from.longitude)
  const a =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a))
}

export type Heading = { kind: 'on-station' } | { kind: 'bearing'; degrees: number; meters: number }

/**
 * What the compass shows for an event. On station when the event has no
 * location, when there is no home to steer from, or when it is within the
 * threshold of home. Otherwise the bearing and distance to walk.
 */
export function headingFor(event: HackEvent, home: Coordinate | null): Heading {
  const target = event.locations[0]
  if (!target || !home) return { kind: 'on-station' }
  const meters = distanceMeters(home, target)
  if (meters < ON_STATION_METERS) return { kind: 'on-station' }
  return { kind: 'bearing', degrees: bearingDegrees(home, target), meters }
}
