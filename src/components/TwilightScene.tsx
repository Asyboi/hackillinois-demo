import { Drift } from './Drift'
import styles from './TwilightScene.module.css'

/**
 * The twilight zone behind the porthole: two jellyfish and a squid. The
 * first light that is not the sun. Scene box is 400 x 300; the tall
 * porthole crops it to about x 60..340, so everything sits inside that band.
 *
 * The jellyfish and squid paths were generated with Gemini (palette and
 * pivoted parts fixed in the prompt, 2026-09-16) and re-origined so each
 * sprite's (0,0) is its body centre. The bell pulse, mantle pulse and the
 * trailing sway are ours: each moving part sits in a group whose origin is
 * the joint.
 */

interface PulseProps {
  /** Seconds per contraction. */
  pulse?: number
  delay?: number
}

/* Moon jellyfish, bell up. (0,0) is the bell's base centre; tentacles hang from y=10. */
function Jellyfish({ pulse = 2.6, delay = 0 }: PulseProps) {
  return (
    <g>
      {/* The bell spans y -12.5..10.5, so its base is the bottom of its box. It contracts toward that base. */}
      <Drift scaleY={[1, 0.84]} duration={pulse} delay={delay} origin={[0.5, 1]}>
        <path className={styles.body} d="M -30,10 C -30,-20 30,-20 30,10 C 15,5 0,10 -30,10 Z" />
        <g className={styles.glow}>
          <circle cx="-25" cy="8" r="1.5" />
          <circle cx="-10" cy="9" r="1.5" />
          <circle cx="10" cy="9" r="1.5" />
          <circle cx="25" cy="8" r="1.5" />
        </g>
      </Drift>
      <g transform="translate(0 10)">
        {/* Tentacles trail the bell by a beat, swinging from where they meet it. */}
        <Drift rotate={[-4, 4]} duration={pulse} delay={delay + pulse * 0.3} origin={[0.5, 0]}>
          <g className={styles.strand}>
            <path d="M -20,0 C -25,15 -15,25 -20,40" />
            <path d="M -7,0 C -10,18 0,30 -5,45" />
            <path d="M 7,0 C 10,18 0,30 5,45" />
            <path d="M 20,0 C 25,15 15,25 20,40" />
          </g>
        </Drift>
      </g>
    </g>
  )
}

/* Squid, mantle pointing up and to the right. (0,0) is where the arms meet the mantle. */
function Squid({ pulse = 3, delay = 0 }: PulseProps) {
  return (
    <g transform="rotate(-40)">
      {/* The mantle spans y -45..0 in its own frame; it contracts toward the arms. */}
      <Drift scaleY={[1, 0.9]} duration={pulse} delay={delay} origin={[0.5, 1]}>
        <path className={styles.body} d="M 0,-35 C 10,-35 15,-10 15,0 L -15,0 C -15,-10 -10,-35 0,-35 Z" />
        <path className={styles.body} transform="translate(0 -35)" d="M -15,5 L 0,-10 L 15,5 Z" />
        <circle className={styles.glow} cx="0" cy="-15" r="3" />
      </Drift>
      <Drift rotate={[-4, 4]} duration={pulse} delay={delay + pulse * 0.3} origin={[0.5, 0]}>
        <g className={styles.strand}>
          <path d="M -10,0 C -12,15 -8,25 -10,35" />
          <path d="M -4,0 C -6,18 2,28 -2,38" />
          <path d="M 4,0 C 6,18 -2,28 2,38" />
          <path d="M 10,0 C 12,15 8,25 10,35" />
        </g>
      </Drift>
    </g>
  )
}

export function TwilightScene() {
  return (
    <g>
      <Drift y={[0, -22]} x={[0, 6]} duration={6}>
        <g transform="translate(120 100) scale(0.85)">
          <Jellyfish pulse={2.6} />
        </g>
      </Drift>
      <Drift y={[0, -16]} x={[0, -8]} duration={7.5} delay={1.5}>
        <g transform="translate(300 190) scale(0.55)">
          <Jellyfish pulse={2.1} delay={0.7} />
        </g>
      </Drift>

      {/* Squid jet mantle-first, so it travels the way it points: up and to the right. */}
      <Drift x={[0, 40]} y={[0, -30]} rotate={[0, -5]} duration={9}>
        <g transform="translate(240 80) scale(0.9)">
          <Squid pulse={3} />
        </g>
      </Drift>
    </g>
  )
}
