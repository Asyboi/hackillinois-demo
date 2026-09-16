import type { ReactNode } from 'react'
import { useTweenedNumber } from '../hooks/useTweenedNumber'
import type { Heading } from '../lib/bearing'
import { formatDistance, formatRange, formatTime, toRoman } from '../lib/format'
import { ZONES, type ZoneKey, type ZoneRun } from '../lib/zones'
import styles from './Readouts.module.css'

interface ReadoutsProps {
  stopIndex: number
  stopCount: number
  zone: ZoneKey
  /** The active event's run of same-zone neighbours. Null with no events. */
  run: ZoneRun | null
  /** This stop's depth on the day's meter, in metres. See stopDepthsMeters. */
  depthMeters: number
  /** The deepest stop of the day: the meter's full-scale reading. */
  maxDepthMeters: number
  heading: Heading
}

/**
 * The instrument cluster under the porthole. Four rows, label left and value
 * right, every value a pure function of the active event.
 */
export function Readouts({
  stopIndex,
  stopCount,
  zone,
  run,
  depthMeters,
  maxDepthMeters,
  heading,
}: ReadoutsProps) {
  return (
    <dl className={styles.readouts}>
      <Row label="Stop">
        {stopCount > 0 ? `${toRoman(stopIndex + 1)} / ${toRoman(stopCount)}` : '—'}
      </Row>
      <Row label="Depth">
        <DepthMeter meters={depthMeters} maxMeters={maxDepthMeters} />
      </Row>
      <Row label="Zone" stacked>
        <ZoneReading zone={zone} run={run} />
      </Row>
      <Row label="Heading">
        <Compass heading={heading} />
        {heading.kind === 'on-station' ? (
          <span className="label">On station</span>
        ) : (
          `${Math.round(heading.degrees)}° · ${formatDistance(heading.meters)}`
        )}
      </Row>
    </dl>
  )
}

/**
 * One instrument row. A stacked row lays its value out as lines, right
 * aligned, with the term sitting on the first line instead of centred on
 * the block.
 */
function Row({
  label,
  stacked = false,
  children,
}: {
  label: string
  stacked?: boolean
  children: ReactNode
}) {
  return (
    <div className={stacked ? `${styles.row} ${styles.stacked}` : styles.row}>
      <dt className={`mono label ${styles.term}`}>{label}</dt>
      <dd className={`mono ${styles.value}`}>{children}</dd>
    </div>
  )
}

/**
 * The zone's name on one line and, beneath it, the real depth where the zone
 * begins and the clock span of the active event's run through it: the three
 * facts the list's zone headers used to carry. The second line is set
 * smaller so the name stays the reading.
 */
function ZoneReading({ zone, run }: { zone: ZoneKey; run: ZoneRun | null }) {
  const first = run?.events[0]
  const last = run?.events[run.events.length - 1]
  return (
    <>
      <span className="label">{ZONES[zone].name}</span>
      <span className={styles.zoneDetail}>
        <span>{ZONES[zone].depthLabel}</span>
        {first && last && (
          <span>
            {first === last
              ? formatTime(first.startTime)
              : formatRange(first.startTime, last.startTime)}
          </span>
        )}
      </span>
    </>
  )
}

/**
 * The number glides to each new reading, and the bar follows it. The text
 * sits in a slot wide enough for the largest reading ("6,000/6,000 m"), so
 * the bar never shifts as the digits change.
 */
function DepthMeter({ meters, maxMeters }: { meters: number; maxMeters: number }) {
  const shown = useTweenedNumber(meters)
  const fraction = maxMeters > 0 ? Math.min(1, shown / maxMeters) : 0
  const digits = (n: number) => Math.round(n).toLocaleString('en-US')
  return (
    <>
      <span className={styles.bar} aria-hidden="true">
        <span className={styles.fill} style={{ width: `${fraction * 100}%` }} />
      </span>
      <span className={styles.depthValue}>
        {digits(shown)}/{digits(maxMeters)} m
      </span>
    </>
  )
}

/**
 * A small dial. On station it shows a filled centre dot and no needle; the
 * needle appears and swings only when the event is in another building.
 */
function Compass({ heading }: { heading: Heading }) {
  const ticks = [0, 90, 180, 270]
  return (
    <svg className={styles.compass} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" className={styles.dial} />
      {ticks.map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="2.5"
          x2="12"
          y2="5"
          className={styles.tick}
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
      {heading.kind === 'on-station' ? (
        <circle cx="12" cy="12" r="2.5" className={styles.station} />
      ) : (
        <path
          d="M12 3.5 L14.4 12.5 L12 11 L9.6 12.5 Z"
          className={styles.needle}
          style={{ transform: `rotate(${heading.degrees}deg)` }}
        />
      )}
    </svg>
  )
}
