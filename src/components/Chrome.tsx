import { DAYS, type DayKey } from '../lib/days'
import styles from './Chrome.module.css'

interface ChromeProps {
  day: DayKey
  counts: Record<DayKey, number>
  onSelectDay: (day: DayKey) => void
}

/**
 * Nav and hero. Never scrolls. Its text color is bone in every zone, set
 * once on the page through the --chrome-fg variable.
 */
export function Chrome({ day, counts, onSelectDay }: ChromeProps) {
  const info = DAYS.find((d) => d.key === day)!

  return (
    <header className={styles.chrome}>
      <nav className={styles.nav}>
        <a className={styles.brand} href="https://hackillinois.org" aria-label="HackIllinois">
          <svg width="26" height="30" viewBox="0 0 26 30" fill="none" aria-hidden="true">
            <path
              d="M13 2 L24 8 L24 22 L13 28 L2 22 L2 8 Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="13" cy="15" r="4" fill="var(--color-coral)" />
          </svg>
          HackIllinois
        </a>
        <div className={styles.links}>
          <span className={styles.current}>Schedule</span>
          <span className={styles.muted}>Mentors</span>
          <span className={styles.muted}>Prizes</span>
          <span className={styles.muted}>Credits</span>
        </div>
      </nav>

      <div className={styles.hero}>
        <h1 className={styles.day}>{info.label}</h1>
        <div className={styles.pills} role="tablist" aria-label="Day">
          {DAYS.map((d) => (
            <button
              key={d.key}
              role="tab"
              aria-selected={d.key === day}
              data-active={d.key === day}
              className={styles.pill}
              onClick={() => onSelectDay(d.key)}
            >
              {d.label}
              <span className={styles.count}>{counts[d.key]}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
