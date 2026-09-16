import { useCallback, useMemo, useRef, useState } from 'react'
import type { HackEvent } from '../api/types'
import { homeCoordinate } from '../lib/bearing'
import { groupByDay, type DayKey } from '../lib/days'
import { EMPTY_FILTER, filterEvents, type EventFilter as Filter } from '../lib/filter'
import { formatMonthDay } from '../lib/format'
import { depthForTime, runContaining, zoneForTime, zoneRuns } from '../lib/zones'
import { Backdrop } from './Backdrop'
import { Chrome } from './Chrome'
import { Cockpit } from './Cockpit'
import { EventFilter } from './EventFilter'
import { EventList, type EventListHandle } from './EventList'
import styles from './SchedulePage.module.css'

/**
 * The page. Holds the one piece of state everything else derives from: which
 * event is active. Active is whichever the user touched last: the most recently
 * hovered card or stop, or the card at the list's reading line if they have
 * scrolled since. From the active event's start time come the zone (discrete:
 * labels, chrome color) and the depth (continuous: water). The cockpit is
 * downstream of the same value and adds no state of its own.
 *
 * Two smaller pieces of state pick which events are in play: the day, and
 * the filter. The filter is applied here, before anything derives from the
 * list, so the cockpit plots the same course the list shows: a filtered
 * Friday has fewer stops, and they renumber.
 */
export function SchedulePage({ events }: { events: HackEvent[] }) {
  const byDay = useMemo(() => groupByDay(events), [events])
  const home = useMemo(() => homeCoordinate(events), [events])
  const [day, setDay] = useState<DayKey>('friday')
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [readingId, setReadingId] = useState<string | null>(null)
  const listRef = useRef<EventListHandle>(null)

  // Hover sticks. Moving the pointer off a card leaves it active rather than
  // snapping back to the reading line, which at the top of the list is always
  // the first event. So a leave (null) is ignored, and only a new hover
  // replaces the stuck one.
  const hover = useCallback((eventId: string | null) => {
    if (eventId !== null) setHoveredId(eventId)
  }, [])

  // Scrolling takes over again, but only once the card at the reading line
  // actually changes. The list reports on every scroll frame, and a few pixels
  // of drift while the reading card stays put should not undo the hover.
  // The last report lives in a ref so this callback never changes identity:
  // the list re-measures whenever it does.
  const lastReading = useRef<string | null>(null)
  const reading = useCallback((eventId: string) => {
    if (eventId === lastReading.current) return
    // The first report after a day switch is where the list starts, not a
    // scroll, so it leaves the hover alone.
    if (lastReading.current !== null) setHoveredId(null)
    lastReading.current = eventId
    setReadingId(eventId)
  }, [])

  // Memoised so an unchanged day keeps its array identity across renders:
  // the list re-measures its reading line whenever `events` changes.
  const list = useMemo(() => filterEvents(byDay[day], filter), [byDay, day, filter])
  const activeId = hoveredId ?? readingId ?? list[0]?.eventId ?? null
  const activeIndex = Math.max(0, list.findIndex((e) => e.eventId === activeId))
  const active = list[activeIndex] ?? null
  const zone = active ? zoneForTime(active.startTime) : 'sunlit'
  const depth = active ? depthForTime(active.startTime) : 0
  // The cockpit's ZONE readout spans the active card's run of same-zone
  // neighbours, so it is the run and not the zone that is looked up: Sunday
  // opens in twilight and could in principle return to it after dark.
  const activeRun = runContaining(zoneRuns(list), activeId)

  // Each valve plate carries the day's calendar date, read from the day's first
  // event rather than hardcoded, so the plates stay right if the event moves.
  // The first event of a day is always past the 5 AM boundary, so its calendar
  // date is the day's date. A day with no events gets no date.
  const dateOf = (list: HackEvent[]) => (list[0] ? formatMonthDay(list[0].startTime) : null)
  const dates = {
    friday: dateOf(byDay.friday),
    saturday: dateOf(byDay.saturday),
    sunday: dateOf(byDay.sunday),
  }
  // Changing the day or the filter changes which cards exist, so whatever was
  // active is forgotten and the list starts over from its first card.
  const forgetActive = () => {
    setHoveredId(null)
    setReadingId(null)
    lastReading.current = null
  }
  const selectDay = (next: DayKey) => {
    setDay(next)
    forgetActive()
  }
  const changeFilter = (next: Filter) => {
    setFilter(next)
    forgetActive()
  }
  // The list remounts, scrolled to the top, whenever its set of cards changes.
  const listKey = `${day}:${filter.zones.join(',')}:${filter.types.join(',')}`

  return (
    <div className={styles.page} data-zone={zone}>
      <Backdrop depth={depth} zone={zone} />
      <Chrome
        day={day}
        dates={dates}
        zone={zone}
        filter={<EventFilter filter={filter} onChange={changeFilter} />}
        onSelectDay={selectDay}
      />
      <div className={styles.body}>
        <EventList
          key={listKey}
          ref={listRef}
          events={list}
          activeId={activeId}
          onReadingChange={reading}
          onHoverChange={hover}
        />
        <Cockpit
          events={list}
          activeIndex={activeIndex}
          zone={zone}
          run={activeRun}
          depth={depth}
          home={home}
          onHoverChange={hover}
          onSelectStop={(eventId) => listRef.current?.scrollToEvent(eventId)}
        />
      </div>
    </div>
  )
}
