import { layerOpacities } from '../lib/zones'
import styles from './Backdrop.module.css'

/**
 * The water. Four full-viewport gradient layers, one per zone, stacked with
 * the sunlit layer always painted underneath. Depth (0 at the surface, 1 at
 * the trench) sets how much of each darker layer shows. Only opacity changes,
 * which the browser can animate on the compositor without repainting.
 */
export function Backdrop({ depth }: { depth: number }) {
  const opacity = layerOpacities(depth)
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={`${styles.layer} ${styles.sunlit}`} />
      <div className={`${styles.layer} ${styles.twilight}`} style={{ opacity: opacity.twilight }} />
      <div className={`${styles.layer} ${styles.midnight}`} style={{ opacity: opacity.midnight }} />
      <div className={`${styles.layer} ${styles.abyssal}`} style={{ opacity: opacity.abyssal }} />
    </div>
  )
}
