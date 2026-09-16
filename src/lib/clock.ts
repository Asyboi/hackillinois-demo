/**
 * Everything about "what time is it in Urbana" lives here. The API hands back
 * Unix seconds; the event happens in America/Chicago; the browser could be
 * anywhere. Every other module asks this one instead of touching Date directly.
 */
export const EVENT_TIME_ZONE = 'America/Chicago'

export interface LocalClock {
  /** Sunday = 0 ... Saturday = 6, in the event time zone. */
  weekday: number
  /** 0..23 in the event time zone. */
  hour: number
  /** 0..59 */
  minute: number
}

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: EVENT_TIME_ZONE,
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
})

/** Break a Unix-seconds timestamp into the local weekday, hour and minute. */
export function localClock(unixSeconds: number): LocalClock {
  const parts = partsFormatter.formatToParts(new Date(unixSeconds * 1000))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  // Intl reports midnight as "24" in some engines when hour12 is false.
  const hour = Number(get('hour')) % 24
  return {
    weekday: weekdayIndex[get('weekday')] ?? 0,
    hour,
    minute: Number(get('minute')),
  }
}

/** Minutes since local midnight, 0..1439. */
export function minutesOfDay(unixSeconds: number): number {
  const { hour, minute } = localClock(unixSeconds)
  return hour * 60 + minute
}
