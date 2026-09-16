/**
 * Shape of one event as returned by GET https://adonix.hackillinois.org/event/
 * Only the fields this app reads are typed. See CLAUDE.md for which fields are
 * populated in the live data and which are always empty.
 */
export type EventType = 'MEAL' | 'SPEAKER' | 'WORKSHOP' | 'MINIEVENT' | 'OTHER'

export interface EventLocation {
  description: string
  latitude: number
  longitude: number
}

export interface HackEvent {
  eventId: string
  name: string
  description: string
  /** Unix seconds, not milliseconds. */
  startTime: number
  /** Unix seconds, not milliseconds. */
  endTime: number
  eventType: EventType
  locations: EventLocation[]
  sponsor?: string
  points: number
  mapImageUrl?: string
}

export interface EventsResponse {
  events: HackEvent[]
}
