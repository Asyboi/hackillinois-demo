import type { HackEvent } from '../api/types'
import { depthForTime } from './zones'

/**
 * Where each stop of the day's course sits on the porthole glass. Only the
 * vertical axis carries information: y is the same continuous depth that
 * colors the page backdrop, so Friday's course descends and Sunday's climbs
 * without anything special-casing Sunday. The horizontal axis is for
 * legibility only, see below.
 */
export interface CourseStop {
  /** Position in the day, 0-based. */
  index: number
  /** Continuous depth, 0 at the surface to 1 at the trench. */
  depth: number
  x: number
  y: number
}

export interface CourseBox {
  width: number
  height: number
}

/**
 * Closest two stops may sit vertically. Friday bunches nine events into the
 * twilight zone and four of them start at the same minute, so raw depth
 * positions collide. This is a little more than a stop marker's diameter.
 */
export const MIN_STOP_GAP_PX = 22

/** How many stops one full left-right-left sweep of the window takes. */
const SWEEP_PERIOD = 8

/** Horizontal margin so markers at the sweep's extremes do not touch the glass. */
const X_INSET = 0.1

/**
 * x is a serpentine sweep driven purely by the stop's ordinal index. It
 * carries no data. Its only job is to spread out stops that sit at similar
 * depths so the route reads as a journey rather than a column of dots.
 */
function serpentineX(index: number, width: number): number {
  const phase = (index / SWEEP_PERIOD) * 2 * Math.PI
  const sweep = (1 + Math.sin(phase)) / 2
  return width * (X_INSET + sweep * (1 - 2 * X_INSET))
}

/**
 * One pass that enforces the minimum gap. Stops are visited in depth order
 * (not day order, because a course can climb) and each is pushed down just
 * far enough to clear the one above it. Ties keep day order, so the four
 * 7:30 PM stops fan out i, ii, iii, iv. If the pushing overflows the box,
 * the stops' own span is fitted to the box: the shallowest stop moves to
 * the top and the empty water above it is spent on separation first. Only
 * if that is still not enough does the gap itself shrink, evenly, rather
 * than losing the last stops off the bottom.
 */
function separate(ys: number[], height: number): number[] {
  const order = ys.map((_, i) => i).sort((a, b) => ys[a] - ys[b] || a - b)
  const out = [...ys]
  for (let k = 1; k < order.length; k++) {
    const above = out[order[k - 1]]
    const here = order[k]
    if (out[here] < above + MIN_STOP_GAP_PX) out[here] = above + MIN_STOP_GAP_PX
  }
  const top = out[order[0]]
  const bottom = out[order[order.length - 1]]
  if (bottom > height && bottom > top) {
    return out.map((y) => ((y - top) / (bottom - top)) * height)
  }
  return out
}

export function plotCourse(events: HackEvent[], { width, height }: CourseBox): CourseStop[] {
  if (events.length === 0) return []
  const depths = events.map((event) => depthForTime(event.startTime))
  const ys = separate(
    depths.map((depth) => depth * height),
    height,
  )
  return events.map((_, index) => ({
    index,
    depth: depths[index],
    x: serpentineX(index, width),
    y: ys[index],
  }))
}
