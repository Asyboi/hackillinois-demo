import type { DayKey } from '../lib/days'
import { ZONES, type ZoneKey } from '../lib/zones'
import { DayValves } from './DayValves'
import styles from './Chrome.module.css'

interface ChromeProps {
  day: DayKey
  /** "2/27" per day, or null for a day with no events. */
  dates: Record<DayKey, string | null>
  /** Zone of the active event: the hero's headline. */
  zone: ZoneKey
  onSelectDay: (day: DayKey) => void
}

/**
 * Nav and hero. Never scrolls. The nav is a full-bleed 88px row in the
 * reference site's proportions, the wordmark at the left and the links at the
 * right, both on a pale foam banner. The hero below it carries the name of
 * the zone the active card is in and the ballast valves that pick the day.
 * The day itself is stamped on the valves; the zone's depth and clock span
 * are the cockpit's ZONE readout. Hero text below the banner is bone in every
 * zone, set once on the page through the --chrome-fg variable.
 */
export function Chrome({ day, dates, zone, onSelectDay }: ChromeProps) {
  return (
    <header className={styles.chrome}>
      <nav className={styles.nav}>
        <div className={styles.brandPane}>
          <a className={styles.brand} href="https://hackillinois.org" aria-label="HackIllinois">
            <Mark />
            <span className={styles.wordmark} aria-hidden="true">
              <span>Hack</span>
              <span>Illinois</span>
            </span>
          </a>
        </div>
        <div className={styles.links}>
          <span className={styles.current}>Schedule</span>
          <span className={styles.muted}>Mentors</span>
          <span className={styles.muted}>Prizes</span>
          <span className={styles.muted}>Credits</span>
        </div>
      </nav>

      <div className={styles.hero}>
        {/* Keyed by zone so crossing a boundary remounts the heading and
            replays its entrance, which is the "you have entered the twilight
            zone" moment now that the list has no headers of its own. */}
        <h1 key={zone} className={styles.zoneName}>
          {ZONES[zone].label}
        </h1>
        <DayValves day={day} dates={dates} onSelectDay={onSelectDay} />
      </div>
    </header>
  )
}

/**
 * The logo mark: an I-beam broken across the middle, the two halves stacked
 * on one axis. Taller than wide, with bars thinner than the stems are wide,
 * so it reads as a beam and not a block.
 */
function Mark() {
  return (
    <svg className={styles.mark} viewBox="0 0 40 52" aria-hidden="true">
      <path d="M3 0 H37 V9 H26 V22 H14 V9 H3 Z" fill="currentColor" />
      <path d="M14 30 H26 V43 H37 V52 H3 V43 H14 Z" fill="currentColor" />
    </svg>
  )
}
