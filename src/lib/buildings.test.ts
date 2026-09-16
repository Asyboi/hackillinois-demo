import { describe, expect, it } from 'vitest'
import { buildingMapUrl } from './buildings'

describe('buildingMapUrl', () => {
  it('sends every Siebel CS room to the same building', () => {
    const lobby = buildingMapUrl('Siebel CS 1st Floor Lobby')
    expect(decodeURIComponent(lobby!)).toContain('Thomas M. Siebel Center for Computer Science')
    expect(buildingMapUrl('Siebel CS 1404')).toBe(lobby)
    expect(buildingMapUrl('Siebel CS ')).toBe(lobby)
  })

  it('does not confuse Siebel Center for Design with Siebel CS', () => {
    const url = decodeURIComponent(buildingMapUrl('Siebel Center for Design ')!)
    expect(url).toContain('Siebel Center for Design')
    expect(url).not.toContain('Computer Science')
  })

  it('drops the room number from Sidney Lu', () => {
    const url = decodeURIComponent(buildingMapUrl('Sidney Lu Mechanical Engineering Building 4100')!)
    expect(url).toContain('Sidney Lu Mechanical Engineering Building, Urbana, IL')
    expect(url).not.toContain('4100')
  })

  it('returns null for a building it does not know', () => {
    expect(buildingMapUrl('Illini Union 314')).toBeNull()
    expect(buildingMapUrl('')).toBeNull()
  })
})
