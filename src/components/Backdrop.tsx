import { layerOpacities, type ZoneKey } from '../lib/zones'
import styles from './Backdrop.module.css'
import { Drift } from './Drift'
import { Sunray } from './Sunray'
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
 * creatures live inside the cockpit's porthole instead. What the backdrop
 * does carry is light and ground: sunrays near the surface, rock at the
 * bottom.
 */
export function Backdrop({ depth, zone }: BackdropProps) {
  // The rays are what the twilight water covers. Their strength is the
  // inverse of that layer, so they dim with every card rather than snapping
  // at the zone line, and are gone by the time the twilight layer is opaque.
  const daylight = 1 - layerOpacities(depth).twilight
  return (
    <div className={styles.stage} aria-hidden="true">
      <Water depth={depth} />
      <Sunrays strength={daylight} />
      <Seafloor visible={zone === 'abyssal'} />
    </div>
  )
}

/**
 * Shafts of light from the upper left, across the viewport. Drawn in a
 * 1440 x 900 box and sliced to the viewport so the shafts keep their tilt at
 * any width. Each one breathes and sways on its own clock so they never
 * pulse in unison. A CSS mask fades them out toward the bottom: light
 * weakens with depth even inside the sunlit zone.
 */
function Sunrays({ strength }: { strength: number }) {
  return (
    <svg
      className={styles.sunrays}
      style={{ opacity: strength }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      {RAYS.map(({ x, width, duration, delay, opacity }) => (
        <Drift key={x} opacity={opacity} x={[0, 30]} duration={duration} delay={delay}>
          {/* skewX tilts the shaft so it leans right as it descends; scale stretches the 120-tall sprite past the bottom edge. */}
          <g transform={`translate(${x} -40) skewX(12) scale(${width} 8)`}>
            <Sunray />
          </g>
        </Drift>
      ))}
    </svg>
  )
}

const RAYS = [
  { x: -80, width: 2.6, duration: 7, delay: 0, opacity: [0.5, 1] },
  { x: 260, width: 1.8, duration: 9, delay: 2, opacity: [1, 0.4] },
  { x: 540, width: 3.2, duration: 8, delay: 1, opacity: [0.45, 0.9] },
  { x: 900, width: 2.2, duration: 10, delay: 3, opacity: [0.9, 0.5] },
  { x: 1180, width: 2.8, duration: 7.5, delay: 1.5, opacity: [0.55, 1] },
]

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
