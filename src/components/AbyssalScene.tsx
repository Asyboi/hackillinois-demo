import { Drift } from './Drift'
import styles from './AbyssalScene.module.css'

/**
 * The abyssal zone behind the porthole: a gulper eel and two sparse
 * clusters of glowing specks, and almost nothing else. The eel is ink on
 * near-black water; only its rim light and the light on its tail show it.
 *
 * The eel and the speck cluster were generated with Gemini (palette and
 * pivoted parts fixed in the prompt, 2026-09-16) and re-origined so each
 * sprite's (0,0) is its body centre. The jaw's gape, the tail light's pulse
 * and the specks' twinkle are ours.
 *
 * Everything stays inside the window: the scene box is 400 x 300 but the
 * tall porthole crops it to about x 60..340 (see SunlitScene), and each
 * creature's resting position plus its drift plus its own extent sits inside
 * that band.
 */

/* Gulper eel, facing left: pouch jaw at the front, sine body, lit tail tip. Spans x -44..44, y -17..17. */
function GulperEel() {
  return (
    <g transform="translate(-69 -50)">
      <g transform="translate(25 45)">
        {/* Jaw spans x 0..28, y -7.5..19.5: it hinges where the upper lip meets the body, its right edge just above centre. */}
        <Drift rotate={[0, 9]} duration={5} delay={1} origin={[1, 0.28]}>
          <path className={styles.body} d="M 0,0 C 8,-12 20,-8 28,0 C 20,28 8,24 0,0 Z" />
          <path className={styles.rim} d="M 0,0 C 8,-12 20,-8 28,0" />
        </Drift>
      </g>
      <g transform="translate(53 45)">
        <path className={styles.body} d="M 0,0 C 12,-10 22,12 36,3 C 46,-4 54,12 60,22 C 54,16 46,2 36,9 C 22,18 12,-4 0,0 Z" />
        <path className={styles.rim} d="M 0,0 C 12,-10 22,12 36,3 C 46,-4 54,12 60,22" />
      </g>
      <g transform="translate(113 67)">
        <Drift opacity={[0.3, 0.95]} duration={3}>
          <circle className={styles.glow} opacity="0.15" r="7" />
          <circle className={styles.glow} r="2.5" />
        </Drift>
      </g>
    </g>
  )
}

/* Three specks at different sizes, each twinkling on its own clock. Spans x -17..17, y -16..16. */
function SpeckCluster({ delay }: { delay: number }) {
  const specks: [number, number, number, number][] = [
    // x, y, halo radius, core radius
    [-17, -4, 8, 3],
    [9, -16, 5, 2],
    [17, 16, 3, 1.2],
  ]
  return (
    <g className={styles.glow}>
      {specks.map(([x, y, halo, core], i) => (
        <Drift key={i} opacity={[0.15, 0.9]} duration={2.4 + i} delay={delay + i * 0.7}>
          <g transform={`translate(${x} ${y})`}>
            <circle opacity="0.15" r={halo} />
            <circle r={core} />
          </g>
        </Drift>
      ))}
    </g>
  )
}

export function AbyssalScene() {
  return (
    <g>
      <g className={styles.life}>
        {/* Eel extent at scale 1.3: x -57..57 around its centre. Resting at 200 and drifting 30 left keeps it within x 113..257. */}
        <Drift x={[0, -30]} y={[0, 8]} rotate={[-2, 2]} duration={14}>
          <g transform="translate(200 150) scale(1.3)">
            <GulperEel />
          </g>
        </Drift>
      </g>

      <g transform="translate(110 70)">
        <SpeckCluster delay={0} />
      </g>
      <g transform="translate(295 235) scale(0.7)">
        <SpeckCluster delay={1.3} />
      </g>
    </g>
  )
}
