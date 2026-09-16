import { SchedulePage } from './components/SchedulePage'
import { useEvents } from './hooks/useEvents'

export function App() {
  const events = useEvents()

  if (events.status === 'loading') {
    return <p className="status">Loading the schedule…</p>
  }
  if (events.status === 'error') {
    return <p className="status">Could not load the schedule: {events.message}</p>
  }
  return <SchedulePage events={events.events} />
}
