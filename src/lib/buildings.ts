/**
 * Which building an event location is in, and where to send someone who
 * wants directions. Locations arrive as free text like "Siebel CS 1404" or
 * "Siebel Center for Design ", so the building is matched by prefix and the
 * room is ignored: Google Maps knows buildings, not rooms.
 */
interface Building {
  /** Prefix of the location description, as the API writes it. */
  prefix: string
  /** Place name Google Maps resolves to the building's own listing. */
  mapsQuery: string
}

// Longer prefixes first so "Siebel Center for Design" is never read as "Siebel C...".
const BUILDINGS: Building[] = [
  { prefix: 'Siebel Center for Design', mapsQuery: 'Siebel Center for Design, Champaign, IL' },
  { prefix: 'Siebel CS', mapsQuery: 'Thomas M. Siebel Center for Computer Science, Urbana, IL' },
  {
    prefix: 'Sidney Lu Mechanical Engineering Building',
    mapsQuery: 'Sidney Lu Mechanical Engineering Building, Urbana, IL',
  },
]

/** Google Maps link for the building a location is in, or null if unknown. */
export function buildingMapUrl(locationDescription: string): string | null {
  const text = locationDescription.trim()
  const building = BUILDINGS.find((b) => text.startsWith(b.prefix))
  if (!building) return null
  // The documented Maps URL scheme. Opens the place search in the web app or
  // the native app, whichever the device has.
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(building.mapsQuery)}`
}
