import type { HackEvent } from '../api/types'

/**
 * Whether two events share any moment. Intervals are half-open, [start, end),
 * so an event ending at 7:30 does not overlap one starting at 7:30. A
 * zero-duration event (the submission deadline) is an instant, and an instant
 * overlaps anything whose interval contains it.
 */
function overlaps(a: HackEvent, b: HackEvent): boolean {
  const aInstant = a.startTime === a.endTime
  const bInstant = b.startTime === b.endTime
  if (aInstant && bInstant) return a.startTime === b.startTime
  if (aInstant) return b.startTime <= a.startTime && a.startTime < b.endTime
  if (bInstant) return a.startTime <= b.startTime && b.startTime < a.endTime
  return a.startTime < b.endTime && b.startTime < a.endTime
}

/**
 * How many other events in the list are running at the same time as this
 * one. The only place on the page that says "you have to choose": it spikes
 * to 3 at the four 7:30 PM track introductions and is 0 or 1 nearly
 * everywhere else.
 */
export function concurrentWith(event: HackEvent, events: HackEvent[]): number {
  let count = 0
  for (const other of events) {
    if (other.eventId !== event.eventId && overlaps(event, other)) count += 1
  }
  return count
}
