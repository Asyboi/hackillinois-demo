import type { HackEvent } from '../api/types'
import { headingFor, type Coordinate } from '../lib/bearing'
import { concurrentWith } from '../lib/concurrency'
import { stopDepthsMeters } from '../lib/soundings'
import type { ZoneKey } from '../lib/zones'
import styles from './Cockpit.module.css'
import { CoursePlot } from './CoursePlot'
import { Porthole } from './Porthole'
import { Readouts } from './Readouts'

interface CockpitProps {
  /** The day's events, in order. */
  events: HackEvent[]
  /** Position of the active event in that list. */
  activeIndex: number
  zone: ZoneKey
  depth: number
  /** Where the compass points from. Null if no event has a location. */
  home: Coordinate | null
  onHoverChange: (eventId: string | null) => void
  onSelectStop: (eventId: string) => void
}

/**
 * The front of a glass submarine: a porthole onto the water with the day's
 * course etched on the glass, over a cluster of instrument readouts. Every
 * value here is a pure function of the active event. The card already shows
 * title, time, place and description, so the cockpit shows only what the
 * card cannot: depth, zone, position in the day, concurrency and heading.
 *
 * Text stays bone in every zone. The chassis glass is dark enough that ink
 * would not clear contrast on it even over sunlit water, same as the cards.
 */
export function Cockpit({
  events,
  activeIndex,
  zone,
  depth,
  home,
  onHoverChange,
  onSelectStop,
}: CockpitProps) {
  const active = events[activeIndex] ?? null
  const depths = stopDepthsMeters(events)

  return (
    <aside className={styles.cockpit} aria-label="Dive instruments">
      <Porthole depth={depth} zone={zone}>
        <CoursePlot
          events={events}
          activeIndex={activeIndex}
          onHoverChange={onHoverChange}
          onSelectStop={onSelectStop}
        />
      </Porthole>
      <Readouts
        stopIndex={activeIndex}
        stopCount={events.length}
        zone={zone}
        depthMeters={depths[activeIndex] ?? 0}
        maxDepthMeters={Math.max(0, ...depths)}
        heading={active ? headingFor(active, home) : { kind: 'on-station' }}
        concurrent={active ? concurrentWith(active, events) : 0}
      />
    </aside>
  )
}
