import { swimKeyframes } from '../lib/swim'
import { Drift } from './Drift'
import { Sunray } from './Sunray'
import styles from './SunlitScene.module.css'

/**
 * The sunlit zone behind the porthole: sunrays, a school of reef fish
 * crossing the window, a turtle, and bubbles. Dark silhouettes on bright
 * water.
 *
 * The fish, turtle and sunray shapes were generated with Gemini from a
 * prompt that fixed the palette and asked for named, pivoted parts, then
 * re-origined here so each sprite's (0,0) is its body centre. The paths are
 * the generated ones; the articulation (tail beat, flipper stroke) and the
 * motion across the window are ours. Each moving part sits in a group whose
 * origin is the joint, so a rotate on it reads as a hinge.
 */

/**
 * The scene box is 400 x 300 but the porthole is taller than 4:3, and
 * `preserveAspectRatio="xMidYMid slice"` crops the sides to fit the height.
 * At the desktop layout (a 450 x 480 window) the viewer sees scene x from
 * about 60 to 340. Swim loops run across that band, not the full box, or the
 * fish would spend half of every crossing parked out of sight.
 */
const VISIBLE_LEFT = 60
const VISIBLE_RIGHT = 340
/** Past the edge before the cut: over half the widest fish at its largest scale. */
const SWIM_MARGIN = 45

/* Small reef fish, facing right. Tail root is the joint. */
function ReefFish({ beat, delay }: { beat: number; delay: number }) {
  return (
    <g transform="translate(-60 -60)">
      <g transform="translate(56 48)">
        <path d="M 0,11 Q 6,-8 -12,-6 Q -16,4 0,11 Z" />
        <path className={styles.rim} d="M -12,-6 Q 0,-8 2,11" />
      </g>
      <g transform="translate(38 61)">
        {/* Tail spans x -18..0, y -14..14: the root is the right edge, mid height. */}
        <Drift rotate={[-14, 14]} duration={beat} delay={delay} origin={[1, 0.5]}>
          <path d="M 0,0 L -18,-14 Q -10,-2 -12,0 Q -10,2 -18,14 Z" />
        </Drift>
      </g>
      <g transform="translate(60 60)">
        <path d="M 24,-2 Q 10,-14 -22,1 Q -2,15 24,-2 Z" />
        <path className={styles.rim} d="M 24,-2 Q 10,-14 -22,1" />
      </g>
    </g>
  )
}

/* Taller, rounder reef fish, facing right, so the school reads as varied. */
function TallReefFish({ beat, delay }: { beat: number; delay: number }) {
  return (
    <g transform="translate(-60 -60)">
      <g transform="translate(54 38)">
        <path d="M 12,18 C 10,2 -2,-4 -18,2 C -10,12 -2,16 12,18 Z" />
        <path className={styles.rim} d="M 12,18 C 10,2 -2,-4 -18,2" />
      </g>
      <g transform="translate(38 60)">
        {/* Tail spans x -16..0, y -16..16. */}
        <Drift rotate={[-12, 12]} duration={beat} delay={delay} origin={[1, 0.5]}>
          <path d="M 0,0 L -16,-16 Q -12,0 -16,16 Z" />
        </Drift>
      </g>
      <g transform="translate(60 60)">
        <path d="M 22,0 C 14,-24 -10,-20 -22,0 C -10,20 14,24 22,0 Z" />
        <path className={styles.rim} d="M 22,0 C 14,-24 -10,-20 -22,0" />
      </g>
    </g>
  )
}

/* Sea turtle from above, head at the top. Front flippers do the power stroke. */
function SeaTurtle() {
  const stroke = 2.6
  return (
    <g transform="translate(-60 -60)">
      <g transform="translate(60 38)">
        <path d="M 0,0 C -6,-6 -5,-14 0,-18 C 5,-14 6,-6 0,0 Z" />
        <path className={styles.rim} d="M -5,-14 C 0,-18 5,-14 5,-14" />
      </g>
      <g transform="translate(46 48)">
        {/* Front-left flipper spans x -34..0, y -4..10: the shoulder is the right edge, 4/14 down. */}
        <Drift rotate={[-14, 10]} duration={stroke} origin={[1, 4 / 14]}>
          <path d="M 0,0 C -14,-4 -28,-2 -34,10 C -26,10 -12,6 0,0 Z" />
          <path className={styles.rim} d="M 0,0 C -14,-4 -28,-2 -34,10" />
        </Drift>
      </g>
      <g transform="translate(74 48)">
        <Drift rotate={[14, -10]} duration={stroke} origin={[0, 4 / 14]}>
          <path d="M 0,0 C 14,-4 28,-2 34,10 C 26,10 12,6 0,0 Z" />
          <path className={styles.rim} d="M 0,0 C 14,-4 28,-2 34,10" />
        </Drift>
      </g>
      <g transform="translate(48 76)">
        {/* Back flippers span 16 x 16 from the hip; they only trail. */}
        <Drift rotate={[-6, 6]} duration={stroke} delay={0.4} origin={[1, 0]}>
          <path d="M 0,0 C -6,6 -12,10 -16,16 C -10,16 -4,10 0,0 Z" />
        </Drift>
      </g>
      <g transform="translate(72 76)">
        <Drift rotate={[6, -6]} duration={stroke} delay={0.4} origin={[0, 0]}>
          <path d="M 0,0 C 6,6 12,10 16,16 C 10,16 4,10 0,0 Z" />
        </Drift>
      </g>
      <g transform="translate(60 62)">
        <path d="M 0,-24 C 18,-24 22,-6 16,20 C 10,26 0,28 0,28 C 0,28 -10,26 -16,20 C -22,-6 -18,-24 0,-24 Z" />
        <path className={styles.rim} d="M -18,-10 C -14,-22 0,-24 18,-10" />
      </g>
    </g>
  )
}

interface Swimmer {
  kind: 'small' | 'tall'
  /** Resting position in scene coordinates. */
  x: number
  y: number
  /** Scale doubles as distance: smaller fish are further away, fainter and slower. */
  scale: number
  /** Seconds for one full crossing of the window. */
  crossing: number
  /** Seconds per tail beat. */
  beat: number
}

/* Resting x values are spread through the visible band so the school is on screen from the first frame. */
const SCHOOL: Swimmer[] = [
  { kind: 'small', x: 90, y: 70, scale: 0.55, crossing: 20, beat: 0.5 },
  { kind: 'tall', x: 130, y: 118, scale: 0.5, crossing: 23, beat: 0.55 },
  { kind: 'small', x: 180, y: 52, scale: 0.4, crossing: 28, beat: 0.45 },
  { kind: 'small', x: 70, y: 160, scale: 0.65, crossing: 17, beat: 0.5 },
  { kind: 'tall', x: 230, y: 96, scale: 0.4, crossing: 30, beat: 0.6 },
  { kind: 'small', x: 270, y: 146, scale: 0.5, crossing: 22, beat: 0.5 },
  { kind: 'small', x: 320, y: 214, scale: 0.35, crossing: 33, beat: 0.45 },
  { kind: 'small', x: 160, y: 238, scale: 0.45, crossing: 26, beat: 0.5 },
]

export function SunlitScene() {
  return (
    <g>
      <g>
        {[
          { x: 60, width: 1.1, duration: 4, delay: 0, opacity: [0.5, 1] },
          { x: 170, width: 0.9, duration: 5, delay: 1, opacity: [1, 0.4] },
          { x: 270, width: 1.3, duration: 6, delay: 2, opacity: [0.45, 0.9] },
        ].map(({ x, width, duration, delay, opacity }) => (
          <Drift key={x} opacity={opacity} x={[0, 10]} duration={duration} delay={delay}>
            {/* Tilted so the light comes from the upper left, as the old rays did. */}
            <g transform={`translate(${x} 0) skewX(10) scale(${width} 2.5)`}>
              <Sunray />
            </g>
          </Drift>
        ))}
      </g>

      <g className={styles.silhouette}>
        {SCHOOL.map((fish, i) => {
          const swim = swimKeyframes(fish.x, VISIBLE_LEFT, VISIBLE_RIGHT, SWIM_MARGIN)
          const Sprite = fish.kind === 'small' ? ReefFish : TallReefFish
          return (
            <g key={i} transform={`translate(0 ${fish.y})`} opacity={Math.min(1, 0.4 + fish.scale)}>
              <Drift x={swim.x} times={swim.times} duration={fish.crossing} repeatType="loop" ease="linear">
                <Drift y={[0, -6]} duration={2.5 + (i % 3)} delay={i * 0.4}>
                  <g transform={`scale(${fish.scale})`}>
                    <Sprite beat={fish.beat} delay={i * 0.13} />
                  </g>
                </Drift>
              </Drift>
            </g>
          )
        })}

        <Drift x={[0, 20]} y={[0, -16]} rotate={[-3, 3]} duration={16} delay={2}>
          {/* Lower right of the visible band, heading up and to the right. */}
          <g transform="translate(265 232) rotate(50) scale(0.8)">
            <SeaTurtle />
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
