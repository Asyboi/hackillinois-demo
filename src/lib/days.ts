import type { HackEvent } from '../api/types'
import { localClock } from './clock'

/**
 * A hackathon "day" runs 5 AM to 5 AM, not midnight to midnight. The 12:30 AM
 * "Transition to Overnight Hacking Space" belongs to the night before, not the
 * next morning. Nobody at 12:30 AM thinks it is tomorrow.
 */
export const DAY_BOUNDARY_HOUR = 5

export type DayKey = 'friday' | 'saturday' | 'sunday'

export interface DayInfo {
  key: DayKey
  label: string
}

export const DAYS: DayInfo[] = [
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

const keyByWeekday: Partial<Record<number, DayKey>> = {
  5: 'friday',
  6: 'saturday',
  0: 'sunday',
}

/**
 * Which hackathon day an event belongs to. Anything before the 5 AM boundary
 * counts as the previous calendar day. Returns null for an event outside
 * Friday to Sunday, which the live data never produces but the type allows.
 */
export function hackathonDay(unixSeconds: number): DayKey | null {
  const { weekday, hour } = localClock(unixSeconds)
  const effectiveWeekday = hour < DAY_BOUNDARY_HOUR ? (weekday + 6) % 7 : weekday
  return keyByWeekday[effectiveWeekday] ?? null
}

/** Split a sorted event list into one sorted list per day. */
export function groupByDay(events: HackEvent[]): Record<DayKey, HackEvent[]> {
  const groups: Record<DayKey, HackEvent[]> = { friday: [], saturday: [], sunday: [] }
  for (const event of events) {
    const day = hackathonDay(event.startTime)
    if (day) groups[day].push(event)
  }
  return groups
}
