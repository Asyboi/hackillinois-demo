import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import type { HackEvent } from '../api/types'
import { formatTime } from '../lib/format'
import { ZONES, zoneForTime, type ZoneKey } from '../lib/zones'
import { EventCard } from './EventCard'
import styles from './EventList.module.css'

/**
 * How far below the top edge of the list the "reading line" sits. The card
 * whose top has most recently crossed this line is the one the page is about.
 */
const READING_LINE_PX = 80

interface EventListProps {
  events: HackEvent[]
  activeId: string | null
  dayLabel: string
  nextDayLabel: string
  onReadingChange: (eventId: string) => void
  onHoverChange: (eventId: string | null) => void
  onSurface: () => void
}

/** A run of consecutive events in the same zone, with their 1-based stop numbers. */
interface ZoneRun {
  zone: ZoneKey
  stops: { event: HackEvent; stop: number }[]
}

function groupIntoZoneRuns(events: HackEvent[]): ZoneRun[] {
  const runs: ZoneRun[] = []
  events.forEach((event, i) => {
    const zone = zoneForTime(event.startTime)
    const last = runs[runs.length - 1]
    if (last && last.zone === zone) last.stops.push({ event, stop: i + 1 })
    else runs.push({ zone, stops: [{ event, stop: i + 1 }] })
  })
  return runs
}

/**
 * The only thing on the page that scrolls. Reports which card is at the
 * reading line as the user scrolls, and which card is hovered. It does not
 * decide which of the two wins; the page does.
 */
export function EventList({
  events,
  activeId,
  dayLabel,
  nextDayLabel,
  onReadingChange,
  onHoverChange,
  onSurface,
}: EventListProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardNodes = useRef(new Map<string, HTMLLIElement>())
  const pendingFrame = useRef(0)

  const runs = useMemo(() => groupIntoZoneRuns(events), [events])

  const measure = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller || events.length === 0) return
    const line = scroller.scrollTop + READING_LINE_PX
    let current = events[0].eventId
    for (const event of events) {
      const node = cardNodes.current.get(event.eventId)
      if (!node || node.offsetTop > line) break
      current = event.eventId
    }
    onReadingChange(current)
  }, [events, onReadingChange])

  // Measure once the cards exist, and again if the event list changes.
  useLayoutEffect(() => {
    measure()
  }, [measure])

  const handleScroll = () => {
    cancelAnimationFrame(pendingFrame.current)
    pendingFrame.current = requestAnimationFrame(measure)
  }

  const registerCard = (eventId: string) => (node: HTMLLIElement | null) => {
    if (node) cardNodes.current.set(eventId, node)
    else cardNodes.current.delete(eventId)
  }

  return (
    <div ref={scrollerRef} className={styles.scroller} onScroll={handleScroll}>
      {runs.map((run) => {
        const first = run.stops[0].event
        const last = run.stops[run.stops.length - 1].event
        return (
          // Each zone is its own section so its sticky header is confined to
          // it and gets pushed out by the next zone instead of stacking up.
          <section key={first.eventId} className={styles.zone}>
            <header className={styles.zoneHeader}>
              <span className={`mono label ${styles.depth}`}>{ZONES[run.zone].depthLabel}</span>
              <h2 className={styles.zoneName}>{ZONES[run.zone].label}</h2>
              <span className={`mono label ${styles.range}`}>
                {first === last
                  ? formatTime(first.startTime)
                  : `${formatTime(first.startTime)} - ${formatTime(last.startTime)}`}
                {' · '}
                {run.stops.length} {run.stops.length === 1 ? 'stop' : 'stops'}
              </span>
            </header>
            <ol className={styles.cards}>
              {run.stops.map(({ event, stop }) => (
                <EventCard
                  key={event.eventId}
                  ref={registerCard(event.eventId)}
                  event={event}
                  stop={stop}
                  active={event.eventId === activeId}
                  onHoverChange={onHoverChange}
                />
              ))}
            </ol>
          </section>
        )
      })}

      <footer className={styles.seafloor}>
        <p className={`mono label ${styles.seafloorMeta}`}>6,000 m · End of {dayLabel}</p>
        <h2 className={styles.seafloorTitle}>You have reached the bottom.</h2>
        <button className={styles.surface} onClick={onSurface}>
          Surface for {nextDayLabel}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 13 L8 3 M3 8 L8 3 L13 8"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </footer>
    </div>
  )
}
