import type { EventType, HackEvent } from '../api/types'
import { zoneForTime, type ZoneKey } from './zones'

/**
 * What the list is narrowed to. Each group is a set of selected values, and
 * an empty group means "no constraint": nothing selected shows everything,
 * which is also why there is no "All" chip. Within a group a selection is
 * an OR (Meal or Workshop); across groups it is an AND (a meal in the
 * twilight zone). Plain arrays rather than Sets so the state is a value
 * React can compare and the JSX can map over.
 */
export interface EventFilter {
  zones: ZoneKey[]
  types: EventType[]
}

export const EMPTY_FILTER: EventFilter = { zones: [], types: [] }

/** The event types the API uses, in the order the chips show them. */
export const EVENT_TYPES: EventType[] = ['MEAL', 'SPEAKER', 'WORKSHOP', 'MINIEVENT', 'OTHER']

export function isFiltering(filter: EventFilter): boolean {
  return filter.zones.length > 0 || filter.types.length > 0
}

/** The list with `value` added if absent or removed if present. Never mutates. */
export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/**
 * The events that pass the filter, in their original order. Returns the
 * same array when nothing is selected, so an unfiltered day keeps its
 * identity and nothing downstream re-measures.
 */
export function filterEvents(events: HackEvent[], filter: EventFilter): HackEvent[] {
  if (!isFiltering(filter)) return events
  return events.filter(
    (event) =>
      (filter.zones.length === 0 || filter.zones.includes(zoneForTime(event.startTime))) &&
      (filter.types.length === 0 || filter.types.includes(event.eventType)),
  )
}
