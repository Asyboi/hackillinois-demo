import type { Ref } from 'react'
import type { HackEvent } from '../api/types'
import { buildingMapUrl } from '../lib/buildings'
import { formatRange, formatTime } from '../lib/format'
import styles from './EventCard.module.css'

interface EventCardProps {
  event: HackEvent
  active: boolean
  onHoverChange: (eventId: string | null) => void
  ref?: Ref<HTMLLIElement>
}

/**
 * One event, laid out like the reference schedule: title row with a points
 * pill, a time-and-place row, then the description.
 */
export function EventCard({ event, active, onHoverChange, ref }: EventCardProps) {
  const location = event.locations[0]?.description?.trim()
  const mapUrl = location ? buildingMapUrl(location) : null
  const description = event.description.trim()
  // The submission deadline is a moment, not a span. "6:00 AM - 6:00 AM" reads wrong.
  const when =
    event.startTime === event.endTime
      ? formatTime(event.startTime)
      : formatRange(event.startTime, event.endTime)

  return (
    <li
      ref={ref}
      className={styles.card}
      data-active={active}
      onMouseEnter={() => onHoverChange(event.eventId)}
      onMouseLeave={() => onHoverChange(null)}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>
          <CalendarIcon />
          {event.name}
        </h3>
        <span className={styles.points}>{event.points} pts</span>
      </div>
      <p className={styles.meta}>
        <span className={styles.metaItem}>
          <ClockIcon />
          {when}
        </span>
        {mapUrl ? (
          <a
            className={`${styles.metaItem} ${styles.mapLink}`}
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open the building in Google Maps"
          >
            <PinIcon />
            {location}
          </a>
        ) : (
          <span className={styles.metaItem}>
            <PinIcon />
            {location || 'Location to be announced'}
          </span>
        )}
      </p>
      {description && <p className={styles.description}>{description}</p>}
    </li>
  )
}

function CalendarIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
