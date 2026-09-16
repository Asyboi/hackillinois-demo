import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/**
 * A number that glides to its target instead of jumping, the way a real
 * gauge needle does. Starts at zero on mount, so the first reading ramps up
 * from nothing. Snaps immediately under prefers-reduced-motion.
 */
export function useTweenedNumber(target: number, seconds = 0.6): number {
  const reduced = useReducedMotion()
  const current = useRef(0)
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (reduced) {
      current.current = target
      setValue(target)
      return
    }
    const controls = animate(current.current, target, {
      duration: seconds,
      ease: 'easeOut',
      onUpdate: (v) => {
        current.current = v
        setValue(v)
      },
    })
    return () => controls.stop()
  }, [target, seconds, reduced])

  return value
}
