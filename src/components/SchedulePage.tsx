import { useMemo, useState } from 'react'
import type { HackEvent } from '../api/types'
import { DAYS, groupByDay, type DayKey } from '../lib/days'
import { depthForTime, zoneForTime } from '../lib/zones'
import { Backdrop } from './Backdrop'
import { Chrome } from './Chrome'
import { EventList } from './EventList'
import styles from './SchedulePage.module.css'

/**
 * The page. Holds the one piece of state everything else derives from: which
 * event is active. Active is the hovered card if there is one, otherwise the
 * card at the list's reading line. From the active event's start time come
 * the zone (discrete: labels, chrome color) and the depth (continuous: water).
 */
export function SchedulePage({ events }: { events: HackEvent[] }) {
  const byDay = useMemo(() => groupByDay(events), [events])
  const [day, setDay] = useState<DayKey>('friday')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [readingId, setReadingId] = useState<string | null>(null)

  const list = byDay[day]
  const activeId = hoveredId ?? readingId ?? list[0]?.eventId ?? null
  const active = list.find((e) => e.eventId === activeId) ?? list[0] ?? null
  const zone = active ? zoneForTime(active.startTime) : 'sunlit'
  const depth = active ? depthForTime(active.startTime) : 0

  const counts = {
    friday: byDay.friday.length,
    saturday: byDay.saturday.length,
    sunday: byDay.sunday.length,
  }
  const dayIndex = DAYS.findIndex((d) => d.key === day)
  const nextDay = DAYS[(dayIndex + 1) % DAYS.length]

  const selectDay = (next: DayKey) => {
    setDay(next)
    setHoveredId(null)
    setReadingId(null)
  }

  return (
    <div className={styles.page} data-zone={zone}>
      <Backdrop depth={depth} />
      <Chrome day={day} counts={counts} onSelectDay={selectDay} />
      <div className={styles.body}>
        {/* Keyed by day so switching days remounts the list scrolled to the top. */}
        <EventList
          key={day}
          events={list}
          activeId={activeId}
          dayLabel={DAYS[dayIndex].label}
          nextDayLabel={nextDay.label}
          onReadingChange={setReadingId}
          onHoverChange={setHoveredId}
          onSurface={() => selectDay(nextDay.key)}
        />
        <aside className={styles.panel} aria-hidden="true" />
      </div>
    </div>
  )
}
