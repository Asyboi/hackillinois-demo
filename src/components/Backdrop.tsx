import type { ZoneKey } from '../lib/zones'
import styles from './Backdrop.module.css'
import { Water } from './Water'

interface BackdropProps {
  /** Continuous, 0 at the surface and 1 at the trench. Drives the water. */
  depth: number
  /** Discrete. Drives what sits in the water, like the seafloor. */
  zone: ZoneKey
}

/**
 * The full-viewport water behind everything. Deliberately quiet: no marine
 * life swims here, because 780px of card text sits on top of it. The
 * creatures live inside the cockpit's porthole instead.
 */
export function Backdrop({ depth, zone }: BackdropProps) {
  return (
    <div className={styles.stage} aria-hidden="true">
      <Water depth={depth} />
      <Seafloor visible={zone === 'abyssal'} />
    </div>
  )
}

/**
 * Gray rock along the bottom of the viewport. Like the creatures, it snaps
 * at the zone threshold: only the abyssal zone has a floor. The water layer
 * for the abyssal zone starts fading in before midnight, so it cannot drive
 * this, or the rock would show faintly in the midnight zone. The path is
 * drawn in a 1440-wide box and stretched to the viewport, so the ridge line
 * keeps its proportions at any width.
 */
function Seafloor({ visible }: { visible: boolean }) {
  return (
    <svg
      className={styles.seafloor}
      style={{ opacity: visible ? 1 : 0 }}
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="seafloor-rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#555555" />
          <stop offset="1" stopColor="#727272" />
        </linearGradient>
      </defs>
      <path
        fill="url(#seafloor-rock)"
        d="M0 46 L140 30 L300 44 L420 22 L560 38 L700 18 L860 40 L980 26 L1120 42 L1260 20 L1440 36 L1440 140 L0 140 Z"
      />
    </svg>
  )
}
