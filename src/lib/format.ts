import { EVENT_TIME_ZONE } from './clock'

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: EVENT_TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
})

/** "6:00 PM" in the event time zone. */
export function formatTime(unixSeconds: number): string {
  return timeFormatter.format(new Date(unixSeconds * 1000))
}

/** "6:00 PM - 7:30 PM" */
export function formatRange(startSeconds: number, endSeconds: number): string {
  return `${formatTime(startSeconds)} - ${formatTime(endSeconds)}`
}

/** Whole minutes between two Unix-seconds timestamps. */
export function durationMinutes(startSeconds: number, endSeconds: number): number {
  return Math.max(0, Math.round((endSeconds - startSeconds) / 60))
}

/** "4,000 m": a depth, with thousands separators. */
export function formatMeters(meters: number): string {
  return `${Math.round(meters).toLocaleString('en-US')} m`
}

/** "390 m" or "1.5 km", the precision a walk between buildings deserves. */
export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters / 10) * 10} m`
}

const TYPE_LABELS: Record<string, string> = {
  MEAL: 'Meal',
  WORKSHOP: 'Workshop',
  MINIEVENT: 'Mini event',
  SPEAKER: 'Speaker',
}

/** Chip text for an event type, or null for OTHER, which says nothing useful. */
export function typeLabel(eventType: string): string | null {
  return TYPE_LABELS[eventType] ?? null
}

const ROMAN: [number, string][] = [
  [10, 'x'],
  [9, 'ix'],
  [5, 'v'],
  [4, 'iv'],
  [1, 'i'],
]

/** Lowercase roman numeral for a 1-based stop number. Only needs to reach 20. */
export function toRoman(n: number): string {
  let remaining = Math.max(1, Math.floor(n))
  let out = ''
  for (const [value, glyph] of ROMAN) {
    while (remaining >= value) {
      out += glyph
      remaining -= value
    }
  }
  return out
}
