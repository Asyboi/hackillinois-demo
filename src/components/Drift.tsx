import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface DriftProps {
  children: ReactNode
  /** Keyframes, relative to the resting position. */
  x?: number[]
  y?: number[]
  rotate?: number[]
  /** Squash along y, for a bell or mantle contracting. Pivots at `origin` like rotate. */
  scaleY?: number[]
  opacity?: number[]
  /** Optional per-keyframe times in 0..1, same length as the longest keyframe list. */
  times?: number[]
  duration: number
  delay?: number
  /** mirror sways back and forth; loop restarts from the first keyframe. */
  repeatType?: 'mirror' | 'loop'
  ease?: 'easeInOut' | 'linear'
  /**
   * Pivot for rotate and scaleY, as fractions of the group's bounding box (motion
   * transforms SVG groups relative to their fill box). Defaults to the
   * centre; a tail or flipper pivots at its root instead.
   */
  origin?: [number, number]
}

/**
 * A group that idles through its keyframes forever, or sits still at the
 * first keyframe if the user asked for that. The one animation helper for
 * every creature, so the reduced-motion switch lives in exactly one place.
 */
export function Drift({
  children,
  x,
  y,
  rotate,
  scaleY,
  opacity,
  times,
  duration,
  delay = 0,
  repeatType = 'mirror',
  ease = 'easeInOut',
  origin,
}: DriftProps) {
  const reduced = useReducedMotion()
  if (reduced) return <g>{children}</g>
  const animate: Record<string, number[]> = {}
  if (x) animate.x = x
  if (y) animate.y = y
  if (rotate) animate.rotate = rotate
  if (scaleY) animate.scaleY = scaleY
  if (opacity) animate.opacity = opacity
  return (
    <motion.g
      style={origin ? { originX: origin[0], originY: origin[1] } : undefined}
      animate={animate}
      transition={{ duration, delay, times, repeat: Infinity, repeatType, ease }}
    >
      {children}
    </motion.g>
  )
}
