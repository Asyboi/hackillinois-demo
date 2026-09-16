import type { Ref } from 'react'
import type { HackEvent } from '../api/types'
import { durationMinutes, formatTime, toRoman, typeLabel } from '../lib/format'
import styles from './EventCard.module.css'

interface EventCardProps {
  event: HackEvent
  /** 1-based position in the day, shown as a roman numeral stop badge. */
  stop: number
  active: boolean
  onHoverChange: (eventId: string | null) => void
  ref?: Ref<HTMLLIElement>
}

export function EventCard({ event, stop, active, onHoverChange, ref }: EventCardProps) {
  const type = typeLabel(event.eventType)
  const location = event.locations[0]?.description?.trim()

  return (
    <li
      ref={ref}
      className={styles.card}
      data-active={active}
      onMouseEnter={() => onHoverChange(event.eventId)}
      onMouseLeave={() => onHoverChange(null)}
    >
      <span className={styles.badge}>{toRoman(stop)}</span>
      <div className={styles.time}>
        <span className={styles.start}>{formatTime(event.startTime)}</span>
        <span className={styles.duration}>{durationMinutes(event.startTime, event.endTime)} min</span>
      </div>
      <div className={styles.text}>
        <h3 className={styles.title}>{event.name}</h3>
        <p className={styles.location}>{location || 'Location to be announced'}</p>
      </div>
      <div className={styles.chips}>
        {type && <span className={styles.chip}>{type}</span>}
        {event.points > 0 && <span className={`${styles.chip} ${styles.points}`}>+{event.points}</span>}
      </div>
    </li>
  )
}
