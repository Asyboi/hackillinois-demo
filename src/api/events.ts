import type { EventsResponse, HackEvent } from './types'

const API_BASE = 'https://adonix.hackillinois.org'

/**
 * Fetch every event. The endpoint has no query parameters for filtering,
 * sorting, or pagination, so the whole collection arrives at once and all
 * grouping happens client-side. Events come back sorted by start time so
 * callers never have to think about order.
 */
export async function fetchEvents(signal?: AbortSignal): Promise<HackEvent[]> {
  const response = await fetch(`${API_BASE}/event/`, { signal })
  if (!response.ok) {
    throw new Error(`Event request failed with status ${response.status}`)
  }
  const body = (await response.json()) as EventsResponse
  return [...body.events].sort((a, b) => a.startTime - b.startTime)
}
