import { useEffect, useState } from 'react'
import { fetchEvents } from '../api/events'
import type { HackEvent } from '../api/types'

export type EventsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; events: HackEvent[] }

/**
 * Load the full event list once on mount. One endpoint, one request, no
 * caching layer: a data library would be more to explain than it saves.
 */
export function useEvents(): EventsState {
  const [state, setState] = useState<EventsState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetchEvents(controller.signal)
      .then((events) => setState({ status: 'ready', events }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'Unknown error'
        setState({ status: 'error', message })
      })
    return () => controller.abort()
  }, [])

  return state
}
