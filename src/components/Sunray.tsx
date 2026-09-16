import styles from './Sunray.module.css'

/**
 * One shaft of sunlight: five nested bands in lagoon, brightest in the
 * middle, 56 wide and 120 tall at scale 1 with its top at y=0. Generated
 * with Gemini alongside the sunlit creatures (2026-09-16). The caller
 * places, tilts and stretches it; the porthole scene and the page backdrop
 * both use it so the light is the same light.
 */
export function Sunray() {
  return (
    <g className={styles.ray}>
      <path d="M 32,0 L 40,120 L 80,120 L 88,0 Z" opacity="0.06" />
      <path d="M 38,0 L 45,120 L 75,120 L 82,0 Z" opacity="0.10" />
      <path d="M 44,0 L 50,120 L 70,120 L 76,0 Z" opacity="0.15" />
      <path d="M 50,0 L 55,120 L 65,120 L 70,0 Z" opacity="0.20" />
      <path d="M 55,0 L 58,120 L 62,120 L 65,0 Z" opacity="0.25" />
    </g>
  )
}
