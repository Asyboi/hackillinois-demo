import type { HackEvent } from '../api/types'
import { headingFor, type Coordinate } from '../lib/bearing'
import { stopDepthsMeters } from '../lib/soundings'
import type { ZoneKey, ZoneRun } from '../lib/zones'
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
  /** The active event's run of same-zone neighbours, for the ZONE readout's span. */
  run: ZoneRun | null
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
 * card cannot: depth, zone, position in the day and heading.
 *
 * Text stays bone in every zone. The chassis glass is dark enough that ink
 * would not clear contrast on it even over sunlit water, same as the cards.
 */
export function Cockpit({
  events,
  activeIndex,
  zone,
  run,
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
        run={run}
        depthMeters={depths[activeIndex] ?? 0}
        maxDepthMeters={Math.max(0, ...depths)}
        heading={active ? headingFor(active, home) : { kind: 'on-station' }}
      />
    </aside>
  )
}
