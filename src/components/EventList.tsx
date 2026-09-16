import { useCallback, useImperativeHandle, useLayoutEffect, useMemo, useRef, type Ref } from 'react'
import type { HackEvent } from '../api/types'
import { formatMeters, formatTime } from '../lib/format'
import { SEAFLOOR_METERS, ZONES, zoneRuns } from '../lib/zones'
import { EventCard } from './EventCard'
import styles from './EventList.module.css'

/**
 * How far below the top edge of the list the "reading line" sits. The card
 * whose top has most recently crossed this line is the one the page is about.
 */
const READING_LINE_PX = 80

/** What the cockpit can ask the list to do. */
export interface EventListHandle {
  /** Scroll so this event's card lands on the reading line and becomes active. */
  scrollToEvent(eventId: string): void
}

interface EventListProps {
  events: HackEvent[]
  activeId: string | null
  dayLabel: string
  nextDayLabel: string
  onReadingChange: (eventId: string) => void
  onHoverChange: (eventId: string | null) => void
  onSurface: () => void
  ref?: Ref<EventListHandle>
}

/**
 * The only thing on the page that scrolls. Reports which card is at the
 * reading line as the user scrolls, and which card is hovered. It does not
 * decide which of the two wins; the page does.
 *
 * Exposes one imperative method, scrollToEvent, for the cockpit's course
 * plot. An imperative handle rather than a "scrollToEventId" prop because
 * clicking the same stop twice has to scroll twice, and a prop would need a
 * nonce alongside it to re-fire.
 */
export function EventList({
  events,
  activeId,
  dayLabel,
  nextDayLabel,
  onReadingChange,
  onHoverChange,
  onSurface,
  ref,
}: EventListProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardNodes = useRef(new Map<string, HTMLLIElement>())
  const pendingFrame = useRef(0)

  const runs = useMemo(() => zoneRuns(events), [events])

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

  useImperativeHandle(
    ref,
    () => ({
      scrollToEvent(eventId) {
        const scroller = scrollerRef.current
        const node = cardNodes.current.get(eventId)
        if (!scroller || !node) return
        // One extra pixel so the card's top is past the line, not on it,
        // which is what measure() treats as "crossed". Smoothness comes from
        // the scroller's CSS scroll-behavior so reduced-motion can turn it off.
        scroller.scrollTo({ top: node.offsetTop - READING_LINE_PX + 1 })
      },
    }),
    [],
  )

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
        const first = run.events[0]
        const last = run.events[run.events.length - 1]
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
                {run.events.length} {run.events.length === 1 ? 'stop' : 'stops'}
              </span>
            </header>
            <ol className={styles.cards}>
              {run.events.map((event) => (
                <EventCard
                  key={event.eventId}
                  ref={registerCard(event.eventId)}
                  event={event}
                  active={event.eventId === activeId}
                  onHoverChange={onHoverChange}
                />
              ))}
            </ol>
          </section>
        )
      })}

      <footer className={styles.seafloor}>
        <p className={`mono label ${styles.seafloorMeta}`}>
          {formatMeters(SEAFLOOR_METERS)} · End of {dayLabel}
        </p>
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
