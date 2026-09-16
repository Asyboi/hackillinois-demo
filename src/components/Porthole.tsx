import type { ReactNode } from 'react'
import type { ZoneKey } from '../lib/zones'
import { Creatures } from './Creatures'
import styles from './Porthole.module.css'
import { Water } from './Water'

interface PortholeProps {
  depth: number
  zone: ZoneKey
  /** Whatever is etched on the glass: the course plot. */
  children: ReactNode
}

/**
 * The window. Behind the glass, in z-order: the same water as the page
 * backdrop, then the marine life for the current zone, then whatever the
 * caller etches on the glass. The scene is decoration and is hidden from
 * assistive tech; the etching is not, so it is rendered outside that wrapper.
 */
export function Porthole({ depth, zone, children }: PortholeProps) {
  return (
    <div className={styles.porthole}>
      <div className={styles.scene} aria-hidden="true">
        <Water depth={depth} />
        <Creatures zone={zone} />
      </div>
      {children}
      <div className={styles.rim} aria-hidden="true" />
    </div>
  )
}
