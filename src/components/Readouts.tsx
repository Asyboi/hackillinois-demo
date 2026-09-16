import type { ReactNode } from 'react'
import type { Heading } from '../lib/bearing'
import { formatDistance, toRoman } from '../lib/format'
import { ZONES, type ZoneKey } from '../lib/zones'
import styles from './Readouts.module.css'

interface ReadoutsProps {
  stopIndex: number
  stopCount: number
  zone: ZoneKey
  depth: number
  heading: Heading
  concurrent: number
}

/**
 * The instrument cluster under the porthole. Five rows, label left and value
 * right, every value a pure function of the active event.
 */
export function Readouts({ stopIndex, stopCount, zone, depth, heading, concurrent }: ReadoutsProps) {
  return (
    <dl className={styles.readouts}>
      <Row label="Stop">
        {stopCount > 0 ? `${toRoman(stopIndex + 1)} / ${toRoman(stopCount)}` : '—'}
      </Row>
      <Row label="Depth">
        <span className={styles.bar} aria-hidden="true">
          <span className={styles.fill} style={{ width: `${depth * 100}%` }} />
        </span>
        {ZONES[zone].depthLabel}
      </Row>
      <Row label="Zone">
        <span className="label">{zone}</span>
      </Row>
      <Row label="Heading">
        <Compass heading={heading} />
        {heading.kind === 'on-station' ? (
          <span className="label">On station</span>
        ) : (
          `${Math.round(heading.degrees)}° · ${formatDistance(heading.meters)}`
        )}
      </Row>
      <Row label="Sonar">
        {concurrent === 0 ? 'alone' : `${concurrent} ${concurrent === 1 ? 'event' : 'events'}`}
      </Row>
    </dl>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <dt className={`mono label ${styles.term}`}>{label}</dt>
      <dd className={`mono ${styles.value}`}>{children}</dd>
    </div>
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
