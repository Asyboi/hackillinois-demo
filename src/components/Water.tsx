import { layerOpacities } from '../lib/zones'
import styles from './Water.module.css'

/**
 * The water itself: four stacked gradient layers, one per zone, with the
 * sunlit layer always painted underneath. Depth (0 at the surface, 1 at the
 * trench) sets how much of each darker layer shows. Only opacity changes,
 * which the browser animates on the compositor without repainting.
 *
 * Used by both the page backdrop and the cockpit porthole, so the window
 * always matches the page exactly: it is literally the same water.
 */
export function Water({ depth }: { depth: number }) {
  const opacity = layerOpacities(depth)
  return (
    <>
      <div className={`${styles.layer} ${styles.sunlit}`} />
      <div className={`${styles.layer} ${styles.twilight}`} style={{ opacity: opacity.twilight }} />
      <div className={`${styles.layer} ${styles.midnight}`} style={{ opacity: opacity.midnight }} />
      <div className={`${styles.layer} ${styles.abyssal}`} style={{ opacity: opacity.abyssal }} />
    </>
  )
}
