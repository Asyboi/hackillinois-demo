import { useCallback, useImperativeHandle, useLayoutEffect, useRef, type Ref } from 'react'
import type { HackEvent } from '../api/types'
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
  onReadingChange: (eventId: string) => void
  onHoverChange: (eventId: string | null) => void
  ref?: Ref<EventListHandle>
}

/**
 * The only thing on the page that scrolls. Reports which card is at the
 * reading line as the user scrolls, and which card is hovered. It does not
 * decide which of the two wins; the page does.
 *
 * The list is one unbroken run of cards. It carries no zone headers: the hero
 * above it names the zone of the active card, so the moment you cross into
 * twilight is announced there, on the page, rather than inside the scroller.
 *
 * Exposes one imperative method, scrollToEvent, for the cockpit's course
 * plot. An imperative handle rather than a "scrollToEventId" prop because
 * clicking the same stop twice has to scroll twice, and a prop would need a
 * nonce alongside it to re-fire.
 */
export function EventList({
  events,
  activeId,
  onReadingChange,
  onHoverChange,
  ref,
}: EventListProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardNodes = useRef(new Map<string, HTMLLIElement>())
  const pendingFrame = useRef(0)

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
      {events.length === 0 && (
        <div className={styles.empty} role="status">
          <p className={styles.emptyTitle}>Empty water</p>
          <p className={styles.emptyBody}>
            No events on this day match the filter. Loosen it, or pick another day.
          </p>
        </div>
      )}
      <ol className={styles.cards}>
        {events.map((event) => (
          <EventCard
            key={event.eventId}
            ref={registerCard(event.eventId)}
            event={event}
            active={event.eventId === activeId}
            onHoverChange={onHoverChange}
          />
        ))}
      </ol>

      {/* Empty water below the last card. It carries no content; its height
          is what lets the final cards reach the reading line, see the CSS. */}
      <div className={styles.tail} aria-hidden="true" />
    </div>
  )
}
