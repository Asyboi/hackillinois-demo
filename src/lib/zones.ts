import type { HackEvent } from '../api/types'
import { minutesOfDay } from './clock'
import { formatMeters } from './format'

/**
 * The four ocean light zones, keyed to the clock. Sunset in Urbana on Feb 27
 * is about 5:40 PM and sunrise about 6:35 AM, so the sunlit zone runs 6:30 AM
 * to 5:30 PM. Everything else is darkness in three shades.
 */
export type ZoneKey = 'sunlit' | 'twilight' | 'midnight' | 'abyssal'

export interface ZoneInfo {
  key: ZoneKey
  /** "Sunlit": the bare name, for the cockpit's ZONE readout. */
  name: string
  /** "Sunlit Zone": the hero's headline while an event in this zone is active. */
  label: string
  /** Real ocean depth where this zone begins. */
  depthMeters: number
  /** The same, formatted for the cockpit's ZONE readout. */
  depthLabel: string
}

const zone = (key: ZoneKey, name: string, depthMeters: number): ZoneInfo => ({
  key,
  name,
  label: `${name} Zone`,
  depthMeters,
  depthLabel: formatMeters(depthMeters),
})

export const ZONE_ORDER: ZoneKey[] = ['sunlit', 'twilight', 'midnight', 'abyssal']

export const ZONES: Record<ZoneKey, ZoneInfo> = {
  sunlit: zone('sunlit', 'Sunlit', 0),
  twilight: zone('twilight', 'Twilight', 200),
  midnight: zone('midnight', 'Midnight', 1_000),
  abyssal: zone('abyssal', 'Abyssal', 4_000),
}

/** Where a day ends: the seafloor below the abyssal zone. */
export const SEAFLOOR_METERS = 6_000

/** A run of consecutive events in the same zone. */
export interface ZoneRun {
  zone: ZoneKey
  events: HackEvent[]
}

export function zoneRuns(events: HackEvent[]): ZoneRun[] {
  const runs: ZoneRun[] = []
  for (const event of events) {
    const zone = zoneForTime(event.startTime)
    const last = runs[runs.length - 1]
    if (last && last.zone === zone) last.events.push(event)
    else runs.push({ zone, events: [event] })
  }
  return runs
}

/** The run that holds this event, or null if no run does. */
export function runContaining(runs: ZoneRun[], eventId: string | null): ZoneRun | null {
  if (eventId === null) return null
  return runs.find((run) => run.events.some((e) => e.eventId === eventId)) ?? null
}

const minutes = (h: number, m = 0) => h * 60 + m

const SUNRISE = minutes(6, 30)
const SUNSET = minutes(17, 30)
const LATE_NIGHT = minutes(21, 30)

/**
 * Zone for a clock time. Pre-dawn (5:00 to 6:30 AM) is twilight, which is why
 * Sunday opens in twilight for the 6 AM deadline and rises into sunlight.
 */
export function zoneForTime(unixSeconds: number): ZoneKey {
  const t = minutesOfDay(unixSeconds)
  if (t >= SUNRISE && t < SUNSET) return 'sunlit'
  if (t >= SUNSET && t < LATE_NIGHT) return 'twilight'
  if (t >= LATE_NIGHT) return 'midnight'
  if (t < minutes(5)) return 'abyssal'
  return 'twilight'
}

/**
 * Continuous depth, 0 at the surface to 1 at the trench, so the backdrop can
 * darken a little with every card instead of stepping at zone boundaries.
 * Keyframes are (minutes since local midnight, depth); the curve is piecewise
 * linear between them. Depth bottoms out at noon and is deepest just before
 * the 5 AM day boundary.
 */
const DEPTH_KEYFRAMES: [number, number][] = [
  [minutes(0), 0.8],
  [minutes(5), 1.0],
  [minutes(5, 0.001), 0.5],
  [SUNRISE, 0.25],
  [minutes(12), 0.02],
  [SUNSET, 0.25],
  [LATE_NIGHT, 0.55],
  [minutes(24), 0.8],
]

/**
 * How much of each darker water layer to show for a given depth. The sunlit
 * layer is always fully painted underneath; twilight, midnight and abyssal
 * are stacked on top and fade in over successive depth ranges. Crossfading
 * opacities is cheap for the browser; interpolating gradient colors is not.
 */
export interface LayerOpacities {
  twilight: number
  midnight: number
  abyssal: number
}

const ramp = (depth: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (depth - from) / (to - from)))

export function layerOpacities(depth: number): LayerOpacities {
  return {
    twilight: ramp(depth, 0.05, 0.4),
    midnight: ramp(depth, 0.4, 0.7),
    abyssal: ramp(depth, 0.7, 1.0),
  }
}

export function depthForTime(unixSeconds: number): number {
  const t = minutesOfDay(unixSeconds)
  for (let i = 1; i < DEPTH_KEYFRAMES.length; i++) {
    const [t0, d0] = DEPTH_KEYFRAMES[i - 1]
    const [t1, d1] = DEPTH_KEYFRAMES[i]
    if (t >= t0 && t <= t1) {
      const span = t1 - t0
      const progress = span === 0 ? 0 : (t - t0) / span
      return d0 + (d1 - d0) * progress
    }
  }
  return 0.8
}
