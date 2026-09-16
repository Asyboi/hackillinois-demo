import { useLayoutEffect, useRef, useState } from 'react'
import type { HackEvent } from '../api/types'
import { plotCourse, type CourseStop } from '../lib/course'
import { formatTime, toRoman } from '../lib/format'
import styles from './CoursePlot.module.css'

interface CoursePlotProps {
  events: HackEvent[]
  activeIndex: number
  onHoverChange: (eventId: string | null) => void
  onSelectStop: (eventId: string) => void
}

/**
 * Margins inside the porthole that the course keeps clear of: the rim at the
 * top and sides, and the active-stop label along the bottom.
 */
const INSET = { top: 24, right: 30, bottom: 60, left: 30 }

/**
 * The day's course, etched on the porthole glass. One stop per event. The
 * SVG draws the marks and is decorative; the real stops are a list of
 * buttons positioned over the marks, so every stop is keyboard reachable and
 * announces its event name. Hovering or focusing a stop lights its card,
 * exactly as hovering a card lights its stop, and clicking scrolls the list
 * so that card lands on the reading line.
 */
export function CoursePlot({ events, activeIndex, onHoverChange, onSelectStop }: CoursePlotProps) {
  const size = useElementSize()
  const active = events[activeIndex] ?? null

  const box = {
    width: Math.max(0, size.width - INSET.left - INSET.right),
    height: Math.max(0, size.height - INSET.top - INSET.bottom),
  }
  const stops = plotCourse(events, box).map((stop) => ({
    ...stop,
    x: stop.x + INSET.left,
    y: stop.y + INSET.top,
  }))

  return (
    <div ref={size.ref} className={styles.plot}>
      <svg className={styles.marks} aria-hidden="true">
        <CourseLine stops={stops} activeIndex={activeIndex} />
        {stops.map((stop) => (
          <StopMark key={stop.index} stop={stop} activeIndex={activeIndex} />
        ))}
      </svg>

      <ul className={styles.stops} aria-label="Course">
        {stops.map((stop) => {
          const event = events[stop.index]
          const isActive = stop.index === activeIndex
          return (
            <li key={event.eventId} className={styles.stop} style={{ left: stop.x, top: stop.y }}>
              <button
                className={styles.button}
                aria-label={`Stop ${toRoman(stop.index + 1)}, ${event.name}, ${formatTime(event.startTime)}`}
                aria-current={isActive ? 'step' : undefined}
                onMouseEnter={() => onHoverChange(event.eventId)}
                onMouseLeave={() => onHoverChange(null)}
                onFocus={() => onHoverChange(event.eventId)}
                onBlur={() => onHoverChange(null)}
                onClick={() => onSelectStop(event.eventId)}
              />
            </li>
          )
        })}
      </ul>

      {active && (
        <div className={styles.label} aria-hidden="true">
          <span className={styles.labelMeta}>
            {toRoman(activeIndex + 1)} · {formatTime(active.startTime)}
          </span>
          <span className={styles.labelName}>{active.name}</span>
        </div>
      )}
    </div>
  )
}

/**
 * The line joining the stops. Solid behind the active stop, dotted ahead of
 * it, so the plot doubles as the list's progress indicator.
 */
function CourseLine({ stops, activeIndex }: { stops: CourseStop[]; activeIndex: number }) {
  const segment = (from: CourseStop, to: CourseStop) => `M${from.x} ${from.y} L${to.x} ${to.y}`
  let passed = ''
  let ahead = ''
  for (let i = 1; i < stops.length; i++) {
    const d = segment(stops[i - 1], stops[i])
    if (i <= activeIndex) passed += d
    else ahead += d
  }
  return (
    <>
      <path className={styles.linePassed} d={passed} />
      <path className={styles.lineAhead} d={ahead} />
    </>
  )
}

function StopMark({ stop, activeIndex }: { stop: CourseStop; activeIndex: number }) {
  if (stop.index === activeIndex) {
    return (
      <g>
        <circle className={styles.ring} cx={stop.x} cy={stop.y} r={11} />
        <circle className={styles.markActive} cx={stop.x} cy={stop.y} r={5.5} />
      </g>
    )
  }
  const state = stop.index < activeIndex ? styles.markPassed : styles.markAhead
  return <circle className={state} cx={stop.x} cy={stop.y} r={3.5} />
}

/**
 * Pixel size of an element, kept current by a ResizeObserver. The course is
 * plotted in pixels because the 22px minimum gap between stops is a pixel
 * promise, and a scaled viewBox would break it.
 */
function useElementSize() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const update = () => setSize({ width: node.clientWidth, height: node.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, ...size }
}
