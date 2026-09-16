import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { ZoneKey } from '../lib/zones'
import { AbyssalScene } from './AbyssalScene'
import styles from './Creatures.module.css'
import { MidnightScene } from './MidnightScene'
import { SunlitScene } from './SunlitScene'
import { TwilightScene } from './TwilightScene'

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

/* Each zone's scene lives in its own file: SunlitScene, TwilightScene, MidnightScene, AbyssalScene. */
const SCENES: Record<ZoneKey, () => ReactNode> = {
  sunlit: SunlitScene,
  twilight: TwilightScene,
  midnight: MidnightScene,
  abyssal: AbyssalScene,
}
