import type { EventsResponse, HackEvent } from './types'

/**
 * Where the browser asks for events. Not the API itself: adonix only sends
 * CORS headers to hackillinois.org, its own workers.dev hosts and localhost,
 * so a page served from anywhere else is refused by the browser. This path
 * is same-origin and the host forwards it to
 * https://adonix.hackillinois.org/event/ server-to-server, where no CORS
 * applies: vercel.json rewrites it in production, vite.config.ts proxies it
 * in development.
 */
const EVENTS_URL = '/api/events'

/**
 * Fetch every event. The endpoint has no query parameters for filtering,
 * sorting, or pagination, so the whole collection arrives at once and all
 * grouping happens client-side. Events come back sorted by start time so
 * callers never have to think about order.
 */
export async function fetchEvents(signal?: AbortSignal): Promise<HackEvent[]> {
  const response = await fetch(EVENTS_URL, { signal })
  if (!response.ok) {
    throw new Error(`Event request failed with status ${response.status}`)
  }
  const body = (await response.json()) as EventsResponse
  return [...body.events].sort((a, b) => a.startTime - b.startTime)
}
