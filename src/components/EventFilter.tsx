import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { EVENT_TYPES, isFiltering, toggle, type EventFilter as Filter } from '../lib/filter'
import { typeLabel } from '../lib/format'
import { ZONE_ORDER, ZONES } from '../lib/zones'
import styles from './EventFilter.module.css'

interface EventFilterProps {
  filter: Filter
  onChange: (filter: Filter) => void
}

/**
 * The filter, folded away behind one button in the hero. "FILTERS" opens a
 * narrow panel hanging under it, over the list, with the two groups stacked,
 * zones over event types, and each group's chips listed in a column. Each
 * chip is a toggle and any number can be
 * on at once; with none on in a group the group does not constrain, so
 * there is no "All" chip to keep in sync. A dot on the button's corner says
 * something is applied while the panel is shut. The panel closes on Escape
 * or a click anywhere outside it, and the filter itself stays wherever it
 * was: the page owns the filter, this component only owns whether the panel
 * is showing.
 */
export function EventFilter({ filter, onChange }: EventFilterProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const applied = isFiltering(filter)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={root} className={styles.disclosure}>
      <button
        ref={button}
        className={`label ${styles.toggle}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        Filters
        <FilterIcon />
        {applied && <span className={styles.dot} aria-label="Filters applied" role="img" />}
      </button>

      {open && (
        <div id={panelId} className={styles.panel}>
          <Group label="Zone">
            {ZONE_ORDER.map((zone) => (
              <Chip
                key={zone}
                on={filter.zones.includes(zone)}
                onToggle={() => onChange({ ...filter, zones: toggle(filter.zones, zone) })}
              >
                {ZONES[zone].name}
              </Chip>
            ))}
          </Group>
          <Group label="Type">
            {EVENT_TYPES.map((type) => (
              <Chip
                key={type}
                on={filter.types.includes(type)}
                onToggle={() => onChange({ ...filter, types: toggle(filter.types, type) })}
              >
                {typeLabel(type)}
              </Chip>
            ))}
          </Group>
          {applied && (
            <button className={styles.clear} onClick={() => onChange({ zones: [], types: [] })}>
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** One group: its name in the cockpit's term voice, its chips listed beneath. */
function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={`label ${styles.term}`} aria-hidden="true">
        {label}
      </span>
      <div className={styles.chips}>{children}</div>
    </div>
  )
}

function Chip({
  on,
  onToggle,
  children,
}: {
  on: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <button className={styles.chip} aria-pressed={on} onClick={onToggle}>
      {children}
    </button>
  )
}

/** Three bars, each shorter than the last: the usual sign for a filter. */
function FilterIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M7 12h10M10 17h4"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
