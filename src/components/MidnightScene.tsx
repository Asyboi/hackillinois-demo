import { Drift } from './Drift'
import styles from './MidnightScene.module.css'

/**
 * The midnight zone behind the porthole: an anglerfish with a lit lure, two
 * lanternfish with photophores down the belly, and the specks of other
 * things that glow. No sunlight reaches here, so bioluminescence and a rim
 * light are the only things that show a shape.
 *
 * The anglerfish, lanternfish and speck were generated with Gemini (palette
 * and pivoted parts fixed in the prompt, 2026-09-16) and re-origined so each
 * sprite's (0,0) is its body centre. The tail beats, fin strokes, the jaw
 * and the lure's bob are ours: each moving part sits in a group whose origin
 * is the joint.
 *
 * Everything stays inside the window. The scene box is 400 x 300 but the
 * tall porthole crops it to about x 60..340 (see SunlitScene), and unlike
 * the sunlit school nothing here swims out of frame: each creature's
 * resting position plus its drift plus its own extent sits inside that band.
 */

/* Anglerfish, facing left. Lure and jaw at the front, tail at the back. */
function Anglerfish() {
  return (
    <g transform="translate(-60 -60)">
      <g transform="translate(60 60)">
        <path className={styles.body} d="M -30,-5 C -40,-25 10,-30 25,-5 L 20,15 C 10,25 -20,20 -30,-5 Z" />
        <path className={styles.rim} d="M -30,-5 C -40,-25 10,-30 25,-5" />
      </g>
      {/* Gemini placed the dorsal at (60, 32), 8 above the back; the body's top edge at x 60 is y 40. */}
      <g transform="translate(58 40)">
        {/* Dorsal spans x 0..13, y -10..2: the base is its left edge, near the bottom. */}
        <Drift rotate={[-6, 6]} duration={2.4} origin={[0, 0.85]}>
          <path className={styles.body} d="M 0,0 L 10,-10 C 15,-5 10,5 0,0 Z" />
          <path className={styles.rim} d="M 10,-10 C 15,-5 10,5 0,0" />
        </Drift>
      </g>
      <g transform="translate(50 65)">
        {/* Pectoral spans x 0..11, y 0..10: the base is its top left corner. */}
        <Drift rotate={[-12, 12]} duration={1.3} origin={[0, 0]}>
          <path className={styles.body} d="M 0,0 L 8,10 C 12,8 10,0 0,0 Z" />
        </Drift>
      </g>
      <g transform="translate(85 60)">
        {/* Tail spans x -5..15, y -15..15: the root is its left edge, mid height. */}
        <Drift rotate={[-10, 10]} duration={1.8} origin={[0, 0.5]}>
          <path className={styles.body} d="M -5,0 L 15,-15 L 10,0 L 15,15 Z" />
          <path className={styles.rim} d="M 15,-15 L 10,0 L 15,15" />
        </Drift>
      </g>
      <g transform="translate(38 45)">
        {/* Stalk spans x -25..0, y -14..0: it hinges at the head, its bottom right corner. */}
        <Drift rotate={[-5, 5]} duration={3.2} origin={[1, 1]}>
          <path className={styles.stalk} d="M 0,0 C -5,-10 -15,-15 -25,-10" />
          <Drift opacity={[0.55, 1]} duration={2.2}>
            <circle cx="-25" cy="-10" r="16" fill="url(#lure-glow)" />
            <circle className={styles.glow} cx="-25" cy="-10" r="4" />
          </Drift>
        </Drift>
      </g>
      <g transform="translate(30 65)">
        <path className={styles.body} d="M 0,0 L -5,-15 C -15,-10 -20,0 -15,10 Z" />
        {/* Upper teeth catch the lure's light. */}
        <path className={styles.lit} d="M -5,-15 L -8,-12 M -9,-14 L -11,-10 M -13,-12 L -14,-8" />
        {/* Lower jaw spans x -24..3, y 0..22: it hinges where it meets the head, its top right corner. */}
        <Drift rotate={[0, 7]} duration={4} delay={1} origin={[0.9, 0]}>
          <path className={styles.body} d="M -15,10 C -25,20 10,25 0,0" />
          <path className={styles.stalk} d="M -16,12 L -18,16 M -19,13 L -21,17 M -22,14 L -24,18" />
        </Drift>
      </g>
    </g>
  )
}

/* Lanternfish, facing left, with a row of photophores along the belly. */
function Lanternfish({ beat, delay }: { beat: number; delay: number }) {
  return (
    <g transform="translate(-60 -60)">
      <g transform="translate(60 60)">
        <path className={styles.body} d="M -35,0 C -20,-15 15,-15 35,0 C 15,15 -20,15 -35,0 Z" />
        <path className={styles.rim} d="M -35,0 C -20,-15 15,-15 35,0" />
        <Drift opacity={[0.5, 1]} duration={1.6} delay={delay}>
          <g className={styles.glow}>
            <circle cx="-25" cy="8" r="1.5" />
            <circle cx="-15" cy="10" r="1.5" />
            <circle cx="-5" cy="11" r="1.5" />
            <circle cx="5" cy="11" r="1.5" />
            <circle cx="15" cy="10" r="1.5" />
            <circle cx="25" cy="8" r="1.5" />
          </g>
        </Drift>
      </g>
      <g transform="translate(60 48)">
        <path className={styles.body} d="M -8,0 L 0,-8 L 8,0 Z" />
        <path className={styles.rim} d="M 0,-8 L 8,0" />
      </g>
      <g transform="translate(95 60)">
        {/* Tail spans x -5..10, y -12..12: the root is its left edge, mid height. */}
        <Drift rotate={[-12, 12]} duration={beat} delay={delay} origin={[0, 0.5]}>
          <path className={styles.body} d="M -5,0 L 10,-12 Q 5,0 10,12 Z" />
          <path className={styles.rim} d="M 10,-12 Q 5,0 10,12" />
        </Drift>
      </g>
    </g>
  )
}

/* One glowing speck: a bright core inside a soft halo. */
function Speck() {
  return (
    <g>
      <path
        className={styles.glow}
        opacity="0.15"
        d="M 0,-15 C 8,-15 15,-8 15,0 C 15,8 8,15 0,15 C -8,15 -15,8 -15,0 C -15,-8 -8,-15 0,-15 Z"
      />
      <circle className={styles.glow} r="3" />
    </g>
  )
}

/* The visible band of the scene box, see the note at the top of the file. */
const VISIBLE_LEFT = 60
const VISIBLE_RIGHT = 340
const VISIBLE_WIDTH = VISIBLE_RIGHT - VISIBLE_LEFT

/** Bioluminescent specks that twinkle in place, scattered through the visible band. */
function Specks({ count }: { count: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const x = VISIBLE_LEFT + ((i * 131 + 20) % VISIBLE_WIDTH)
        const y = (i * 73 + 20) % 300
        const scale = i % 3 === 0 ? 0.6 : 0.4
        return (
          <Drift key={i} opacity={[0.15, 0.9]} duration={2 + (i % 4)} delay={(i * 0.6) % 3}>
            <g transform={`translate(${x} ${y}) scale(${scale})`}>
              <Speck />
            </g>
          </Drift>
        )
      })}
    </g>
  )
}

export function MidnightScene() {
  return (
    <g>
      <defs>
        <radialGradient id="lure-glow">
          <stop offset="0" stopColor="var(--color-biolum)" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="var(--color-biolum)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--color-biolum)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className={styles.life}>
        {/*
         * Anglerfish extent at scale 1.1: x -70..44, y -42..25 around its
         * centre, the lure's halo included. Resting at (200, 150) and
         * drifting 26 left keeps it within x 104..244.
         */}
        <Drift x={[0, -26]} y={[0, 12]} rotate={[-2, 2]} duration={10}>
          <g transform="translate(200 150) scale(1.1)">
            <Anglerfish />
          </g>
        </Drift>

        {/* Lanternfish extent at scale 1: x -35..45, y -20..12 around its centre. */}
        <Drift x={[0, -36]} y={[0, -8]} rotate={[-3, 2]} duration={9} delay={0.5}>
          <g transform="translate(140 62) scale(0.6)">
            <Lanternfish beat={0.7} delay={0.2} />
          </g>
        </Drift>
        {/* Mirrored so the pair does not read as a formation. Drift is in scene space, so it stays within x 230..322. */}
        <Drift x={[0, 30]} y={[0, 6]} rotate={[2, -3]} duration={11} delay={2}>
          <g transform="translate(270 236) scale(-0.45 0.45)">
            <Lanternfish beat={0.6} delay={0.9} />
          </g>
        </Drift>
      </g>

      <Specks count={12} />
    </g>
  )
}
