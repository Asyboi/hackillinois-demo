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
 * does carry is light, air and ground: sunrays near the surface, bubbles in
 * every zone, rock at the bottom.
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
      <Bubbles />
      <Seabed visible={zone === 'abyssal'} />
    </div>
  )
}

/**
 * The bottom of the sea: the wreck and the rock it lies in, faded in and out
 * as one picture. They used to fade separately, and mid-fade the hull showed
 * through the half-transparent rock, so the ship registered first and the
 * floor arrived after it as a second, unrelated thing. Group opacity
 * composites the two first and fades the result, so at every instant the
 * rock buries the keel and the scene is one object at some opacity.
 */
function Seabed({ visible }: { visible: boolean }) {
  return (
    <div className={styles.seabed} style={{ opacity: visible ? 1 : 0 }}>
      {/* Before the rock in the markup, so the rock paints over its keel and the
          wreck reads as sunk into the floor rather than resting on top of it. */}
      <Wreck />
      <Seafloor />
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
 * Bubbles rising through the whole water column, the same in every zone: air
 * does not care how deep you are. Drawn in the same 1440 x 900 box as the
 * rays. Each rises from below the bottom edge to above the top on its own
 * clock and wobbles sideways, and the wobble ends where it started so the
 * loop has no jump. Rendered before the seabed so the rock covers their start.
 * Delays are negative so each bubble starts partway up: the page loads with
 * bubbles already spread through the water instead of empty for seconds.
 */
function Bubbles() {
  return (
    <svg
      className={styles.bubbles}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      {BUBBLES.map(({ x, r, duration, delay }) => (
        <Drift
          key={x}
          y={[0, -1000]}
          x={[0, 10, -8, 0]}
          duration={duration}
          delay={delay}
          repeatType="loop"
          ease="linear"
        >
          <circle cx={x} cy={940} r={r} />
        </Drift>
      ))}
    </svg>
  )
}

const BUBBLES = [
  { x: 40, r: 6, duration: 18, delay: 0 },
  { x: 58, r: 3, duration: 15, delay: -6 },
  { x: 190, r: 4, duration: 21, delay: -3 },
  { x: 330, r: 7, duration: 24, delay: -9 },
  { x: 470, r: 3, duration: 17, delay: -12 },
  { x: 610, r: 5, duration: 22, delay: -1 },
  { x: 760, r: 4, duration: 19, delay: -7 },
  { x: 850, r: 8, duration: 26, delay: -4 },
  { x: 880, r: 3, duration: 16, delay: -10 },
  { x: 1010, r: 5, duration: 20, delay: -2 },
  { x: 1150, r: 6, duration: 23, delay: -8 },
  { x: 1290, r: 3, duration: 18, delay: -5 },
  { x: 1310, r: 5, duration: 21, delay: -11 },
  { x: 1400, r: 4, duration: 25, delay: -3.5 },
]

/**
 * A sunken ship on the seafloor, under the event list. It sits in the empty
 * water below the day's last card, which is the only place the backdrop is
 * not covered by text. A raster image, not SVG: an illustrated wreck is far
 * more detail than the hand-drawn paths elsewhere in the backdrop.
 */
function Wreck() {
  return <img className={styles.wreck} src="/wreck.png" alt="" draggable={false} />
}

/**
 * Gray rock along the bottom of the viewport. Like the creatures, the seabed
 * snaps at the zone threshold: only the abyssal zone has a floor. The water
 * layer for the abyssal zone starts fading in before midnight, so it cannot
 * drive this, or the rock would show faintly in the midnight zone. The path
 * is drawn in a 1440-wide box and stretched to the viewport, so the ridge
 * line keeps its proportions at any width.
 */
function Seafloor() {
  return (
    <svg
      className={styles.seafloor}
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
