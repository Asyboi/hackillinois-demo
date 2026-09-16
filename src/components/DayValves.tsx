import { useRef, type KeyboardEvent } from 'react'
import { DAYS, type DayKey } from '../lib/days'
import styles from './DayValves.module.css'

interface DayValvesProps {
  day: DayKey
  /** "2/27" per day, or null for a day with no events. */
  dates: Record<DayKey, string | null>
  onSelectDay: (day: DayKey) => void
}

/**
 * The day selector as a ballast manifold: three brass handwheels, one per day,
 * and only one open at a time. Selecting a day turns its valve a quarter turn
 * open (counterclockwise, as real valves go) while the previous one turns
 * shut. The turn is the state change, not decoration. Holds no state: it reads
 * `day` and reports clicks and arrow keys upward. Each wheel is stamped with
 * the day and its date, "FRI 2/27", on a plate beneath it. The plate's
 * baseline is the hero's baseline: it sits level with the zone name.
 */
export function DayValves({ day, dates, onSelectDay }: DayValvesProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  // The tablist pattern: only the open tab is in the tab order, Left and Right
  // move the selection and the focus together.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const current = DAYS.findIndex((d) => d.key === day)
    const next = (current + step + DAYS.length) % DAYS.length
    onSelectDay(DAYS[next].key)
    buttons.current[next]?.focus()
  }

  return (
    <div className={styles.manifold} role="tablist" aria-label="Day" onKeyDown={onKeyDown}>
      {DAYS.map((d, i) => {
        const open = d.key === day
        return (
          <button
            key={d.key}
            ref={(el) => {
              buttons.current[i] = el
            }}
            role="tab"
            // The plate says "FRI", which a screen reader would spell out.
            aria-label={dates[d.key] ? `${d.label} ${dates[d.key]}` : d.label}
            aria-selected={open}
            tabIndex={open ? 0 : -1}
            data-active={open}
            className={styles.valve}
            onClick={() => onSelectDay(d.key)}
          >
            {/* The wheel is a raster: a generated brass handwheel, cut out on
                transparency and cropped square on its center so the rotation
                pivots on the hub. Rim, five spokes, hub, hex nut, as the
                inline SVG it replaced drew them. Five spokes so a quarter
                turn reads as a turn. */}
            <img className={styles.wheel} src="/wheel.png" alt="" draggable={false} />
            <span className={`label ${styles.plate}`}>
              {d.short}
              {dates[d.key] && ` ${dates[d.key]}`}
            </span>
          </button>
        )
      })}
    </div>
  )
}
