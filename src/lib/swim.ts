/**
 * Keyframes for a creature that swims across the porthole and re-enters
 * from the far side. Four x positions and their times, for a linear loop:
 *
 *   rest -> past the right edge -> (cut) past the left edge -> rest
 *
 * The cut is two keyframes at the same time, so it is instantaneous, and
 * both sit outside the visible band, so it is never visible. Each leg's
 * share of the loop is its share of the total distance, which keeps speed
 * constant through the cut. Starting at the resting x rather than off
 * screen means the school is already spread across the window on first
 * paint, and under prefers-reduced-motion each fish simply sits at its
 * resting x.
 *
 * `left` and `right` are the edges of what the viewer can actually see,
 * which is narrower than the scene when the window crops it. `margin` is
 * how far past an edge the creature goes before the cut, at least half its
 * own width.
 */
export function swimKeyframes(
  restX: number,
  left: number,
  right: number,
  margin: number,
): { x: number[]; times: number[] } {
  const exitX = right + margin
  const enterX = left - margin
  const total = exitX - enterX
  const cut = (exitX - restX) / total
  return { x: [restX, exitX, enterX, restX], times: [0, cut, cut, 1] }
}
