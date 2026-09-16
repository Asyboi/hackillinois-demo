import type { HackEvent } from '../api/types'
import { SEAFLOOR_METERS, ZONE_ORDER, ZONES, zoneRuns, type ZoneKey } from './zones'

/**
 * The depth the cockpit's DEPTH readout shows for each stop of the day.
 *
 * This is ordinal, not clock-driven: the water's color follows the time of
 * day, but the meter counts stops. Each zone owns a range of the water
 * column (sunlit 0 to 200 m, twilight 200 to 1,000 m, and so on down to
 * the 6,000 m seafloor), and the stops in a zone step through that range
 * in even increments, so the last stop of a zone lands exactly on the next
 * boundary. Friday's four sunlit stops read 50, 100, 150, 200.
 *
 * A zone is walked bottom-up when the day is surfacing through it (the
 * next run is shallower, or it is the last run and the previous one was
 * deeper), so Sunday climbs from 200 m to 0 m at the closing ceremony.
 */
export function stopDepthsMeters(events: HackEvent[]): number[] {
  const runs = zoneRuns(events)
  const depths: number[] = []
  runs.forEach((run, i) => {
    const [top, bottom] = zoneRange(run.zone)
    const next = runs[i + 1]?.zone
    const previous = runs[i - 1]?.zone
    const surfacing = next ? isShallower(next, run.zone) : previous ? isShallower(run.zone, previous) : false
    const [from, to] = surfacing ? [bottom, top] : [top, bottom]
    const n = run.events.length
    for (let k = 1; k <= n; k++) depths.push(from + ((to - from) * k) / n)
  })
  return depths
}

/** The stretch of water column a zone owns, from its own boundary to the next one down. */
function zoneRange(zone: ZoneKey): [number, number] {
  const index = ZONE_ORDER.indexOf(zone)
  const deeper = ZONE_ORDER[index + 1]
  return [ZONES[zone].depthMeters, deeper ? ZONES[deeper].depthMeters : SEAFLOOR_METERS]
}

const isShallower = (a: ZoneKey, b: ZoneKey) => ZONE_ORDER.indexOf(a) < ZONE_ORDER.indexOf(b)
