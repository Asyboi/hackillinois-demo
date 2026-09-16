import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import type { ZoneKey } from '../lib/zones'
import styles from './Creatures.module.css'

/**
 * The marine life behind the porthole glass, one scene per zone. Scenes
 * crossfade at the zone thresholds, which is the "you have entered the
 * twilight zone" moment. Everything animates with transform and opacity
 * only, and every animation is off under prefers-reduced-motion. The whole
 * scene is dimmed so the course etched over it stays legible; that is the
 * reason the page backdrop has no creatures of its own.
 */
export function Creatures({ zone }: { zone: ZoneKey }) {
  const Scene = SCENES[zone]
  return (
    <AnimatePresence>
      <motion.svg
        key={zone}
        className={styles.scene}
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        <Scene />
      </motion.svg>
    </AnimatePresence>
  )
}

interface DriftProps {
  children: ReactNode
  /** Keyframes, relative to the resting position. */
  x?: number[]
  y?: number[]
  rotate?: number[]
  opacity?: number[]
  duration: number
  delay?: number
  /** mirror sways back and forth; loop restarts from the first keyframe. */
  repeatType?: 'mirror' | 'loop'
  ease?: 'easeInOut' | 'linear'
}

/** A group that idles through its keyframes forever, or sits still if the user asked for that. */
function Drift({
  children,
  x,
  y,
  rotate,
  opacity,
  duration,
  delay = 0,
  repeatType = 'mirror',
  ease = 'easeInOut',
}: DriftProps) {
  const reduced = useReducedMotion()
  if (reduced) return <g>{children}</g>
  const animate: Record<string, number[]> = {}
  if (x) animate.x = x
  if (y) animate.y = y
  if (rotate) animate.rotate = rotate
  if (opacity) animate.opacity = opacity
  return (
    <motion.g
      animate={animate}
      transition={{ duration, delay, repeat: Infinity, repeatType, ease }}
    >
      {children}
    </motion.g>
  )
}

/* Sunlit: fish school, turtle, sunray caustics, bubbles. Dark silhouettes on bright water. */

function Fish() {
  return <path d="M-12 0 Q-4 -6 6 0 Q-4 6 -12 0 Z M6 0 L12 -5 L12 5 Z" />
}

const SCHOOL: [number, number, number][] = [
  [0, 0, 1],
  [22, -12, 0.85],
  [26, 14, 0.9],
  [48, 2, 0.8],
  [52, -20, 0.7],
  [70, -8, 0.75],
  [74, 18, 0.65],
]

function Sunlit() {
  return (
    <g>
      <g className={styles.caustic}>
        <Drift opacity={[0.35, 0.7]} duration={4} delay={0}>
          <polygon points="60,0 90,0 150,300 90,300" />
        </Drift>
        <Drift opacity={[0.6, 0.25]} duration={5} delay={1}>
          <polygon points="180,0 200,0 260,300 220,300" />
        </Drift>
        <Drift opacity={[0.3, 0.6]} duration={6} delay={2}>
          <polygon points="300,0 330,0 400,240 400,300 370,300" />
        </Drift>
      </g>

      <g className={styles.silhouette}>
        <Drift x={[-30, 40]} y={[0, -10]} duration={11}>
          <g transform="translate(90 100)">
            {SCHOOL.map(([x, y, s], i) => (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                <Fish />
              </g>
            ))}
          </g>
        </Drift>

        <Drift x={[0, 28]} y={[0, -8]} rotate={[-3, 3]} duration={14} delay={2}>
          <g transform="translate(270 200)">
            <ellipse cx="0" cy="0" rx="17" ry="12" />
            <circle cx="21" cy="-3" r="4.5" />
            <ellipse cx="-8" cy="-12" rx="7" ry="3" transform="rotate(-35 -8 -12)" />
            <ellipse cx="-8" cy="12" rx="7" ry="3" transform="rotate(35 -8 12)" />
            <ellipse cx="9" cy="-11" rx="6" ry="3" transform="rotate(-50 9 -11)" />
            <ellipse cx="9" cy="11" rx="6" ry="3" transform="rotate(50 9 11)" />
            <path d="M-17 0 L-23 -3 L-23 3 Z" />
          </g>
        </Drift>
      </g>

      <g className={styles.bubble}>
        {[
          [40, 7, 0],
          [58, 4, 2.5],
          [330, 6, 1],
          [350, 3, 4],
          [200, 5, 3],
        ].map(([x, r, delay], i) => (
          <Drift key={i} y={[0, -340]} x={[0, 8, -6, 4]} duration={9 + i} delay={delay} repeatType="loop" ease="linear">
            <circle cx={x} cy={310} r={r} />
          </Drift>
        ))}
      </g>
    </g>
  )
}

/* Twilight: glowing jellyfish, a squid, marine snow. The first light that is not the sun. */

function Jellyfish() {
  return (
    <g>
      <path
        className={styles.bell}
        d="M-16 0 A16 16 0 0 1 16 0 Q12 4 8 0 Q4 4 0 0 Q-4 4 -8 0 Q-12 4 -16 0 Z"
      />
      <g className={styles.tentacle}>
        <path d="M-10 2 q4 14 -2 26 q-3 10 2 20" />
        <path d="M-3 3 q-3 16 3 28 q2 9 -2 18" />
        <path d="M4 3 q4 12 -1 26 q-2 10 3 20" />
        <path d="M11 2 q-3 14 3 24 q3 8 -1 18" />
      </g>
    </g>
  )
}

function Twilight() {
  return (
    <g>
      <Drift y={[0, -22]} x={[0, 6]} duration={6}>
        <g transform="translate(100 90)">
          <Jellyfish />
        </g>
      </Drift>
      <Drift y={[0, -16]} x={[0, -8]} duration={7.5} delay={1.5}>
        <g transform="translate(300 170) scale(0.7)">
          <Jellyfish />
        </g>
      </Drift>

      <Drift x={[0, -50]} y={[0, 14]} rotate={[0, -6]} duration={13}>
        <g className={styles.silhouetteDeep} transform="translate(250 60) rotate(40)">
          <path d="M0 -34 L9 -8 L9 8 L-9 8 L-9 -8 Z" />
          <path d="M0 -34 L16 -14 L9 -9 Z M0 -34 L-16 -14 L-9 -9 Z" />
          <ellipse cx="0" cy="13" rx="9" ry="6.5" />
          <g className={styles.tentacle}>
            <path d="M-6 18 q-4 14 -1 30" />
            <path d="M-2 19 q-1 16 2 32" />
            <path d="M2 19 q2 16 -1 32" />
            <path d="M6 18 q4 14 1 30" />
          </g>
          <circle className={styles.eye} cx="-4" cy="11" r="1.8" />
          <circle className={styles.eye} cx="4" cy="11" r="1.8" />
        </g>
      </Drift>

      <Snow count={14} />
    </g>
  )
}

/** Marine snow: specks sinking slowly, restarting at the top. */
function Snow({ count }: { count: number }) {
  return (
    <g className={styles.speck}>
      {Array.from({ length: count }, (_, i) => {
        const x = (i * 97) % 400
        const delay = (i * 1.7) % 9
        return (
          <Drift key={i} y={[0, 330]} x={[0, 6, -4]} duration={18 + (i % 5) * 3} delay={delay} repeatType="loop" ease="linear">
            <circle cx={x} cy={-10} r={1.2} />
          </Drift>
        )
      })}
    </g>
  )
}

/* Midnight: an anglerfish with a lit lure, and the specks of other things that glow. */

function Midnight() {
  return (
    <g>
      <defs>
        <radialGradient id="lure-glow">
          <stop offset="0" stopColor="var(--color-biolum)" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="var(--color-biolum)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--color-biolum)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Drift x={[0, 26]} y={[0, 12]} rotate={[-2, 2]} duration={10}>
        <g transform="translate(150 150)">
          <g className={styles.angler}>
            <path d="M-32 0 Q-24 -24 4 -20 Q28 -14 34 0 Q28 12 4 18 Q-24 22 -32 0 Z" />
            <path d="M-32 0 L-44 -10 L-44 10 Z" />
          </g>
          <path className={styles.mouth} d="M34 0 Q20 -3 10 8" />
          <g className={styles.teeth}>
            <path d="M28 -2 l2 6 l2 -6 Z M22 -3 l2 6 l2 -6 Z M16 -1 l1.5 5 l1.5 -5 Z" />
          </g>
          <circle className={styles.eye} cx="16" cy="-7" r="3" />
          <path className={styles.lureStalk} d="M8 -20 q-6 -20 14 -26" />
          <Drift opacity={[0.55, 1]} duration={2.2}>
            <circle cx="22" cy="-46" r="16" fill="url(#lure-glow)" />
            <circle className={styles.lure} cx="22" cy="-46" r="3.2" />
          </Drift>
        </g>
      </Drift>

      <Specks count={12} />
    </g>
  )
}

/** Bioluminescent specks that twinkle in place. */
function Specks({ count }: { count: number }) {
  return (
    <g className={styles.glow}>
      {Array.from({ length: count }, (_, i) => {
        const x = (i * 131 + 40) % 400
        const y = (i * 73 + 20) % 300
        return (
          <Drift key={i} opacity={[0.15, 0.9]} duration={2 + (i % 4)} delay={(i * 0.6) % 3}>
            <circle cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.1} />
          </Drift>
        )
      })}
    </g>
  )
}

/* Abyssal: a gulper eel and almost nothing else. */

function Abyssal() {
  return (
    <g>
      <Drift x={[0, -36]} y={[0, 8]} rotate={[-2, 2]} duration={14}>
        <g transform="translate(220 160)">
          <path
            className={styles.eelBody}
            d="M-120 14 Q-90 -8 -60 10 T0 4 T60 0"
          />
          <g className={styles.eelHead}>
            <path d="M60 0 Q78 -14 100 -6 Q92 4 78 4 Q86 14 60 0 Z" />
          </g>
          <circle className={styles.eye} cx="76" cy="-5" r="1.8" />
          <Drift opacity={[0.3, 0.9]} duration={3}>
            <circle className={styles.lure} cx="-122" cy="14" r="1.8" />
          </Drift>
        </g>
      </Drift>

      <Specks count={5} />
    </g>
  )
}

const SCENES: Record<ZoneKey, () => ReactNode> = {
  sunlit: Sunlit,
  twilight: Twilight,
  midnight: Midnight,
  abyssal: Abyssal,
}
