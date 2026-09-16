import { describe, expect, it } from 'vitest'
import type { EventType, HackEvent } from '../api/types'
import { EMPTY_FILTER, filterEvents, isFiltering, toggle } from './filter'

// Helper: Unix seconds for a Chicago local time in Feb/Mar 2026 (CST, UTC-6).
const chicago = (month: number, day: number, hour: number, minute = 0) =>
  Date.UTC(2026, month - 1, day, hour + 6, minute) / 1000

const stub = (eventId: string, startTime: number, eventType: EventType): HackEvent => ({
  eventId,
  name: eventId,
  description: '',
  startTime,
  endTime: startTime + 3600,
  eventType,
  locations: [],
  points: 0,
})

// A Friday in miniature: one stop per zone, types mixed.
const checkIn = stub('check-in', chicago(2, 27, 14), 'OTHER')
const opening = stub('opening', chicago(2, 27, 17), 'SPEAKER')
const dinner = stub('dinner', chicago(2, 27, 18), 'MEAL')
const workshop = stub('workshop', chicago(2, 27, 19, 30), 'WORKSHOP')
const snack = stub('snack', chicago(2, 27, 23), 'MEAL')
const overnight = stub('overnight', chicago(2, 28, 0, 30), 'OTHER')
const friday = [checkIn, opening, dinner, workshop, snack, overnight]

const ids = (events: HackEvent[]) => events.map((e) => e.eventId)

describe('filterEvents', () => {
  it('passes everything through when nothing is selected', () => {
    expect(filterEvents(friday, EMPTY_FILTER)).toBe(friday)
  })

  it('keeps only the selected zones, in day order', () => {
    expect(ids(filterEvents(friday, { zones: ['twilight'], types: [] }))).toEqual([
      'dinner',
      'workshop',
    ])
    expect(ids(filterEvents(friday, { zones: ['sunlit', 'abyssal'], types: [] }))).toEqual([
      'check-in',
      'opening',
      'overnight',
    ])
  })

  it('keeps only the selected types', () => {
    expect(ids(filterEvents(friday, { zones: [], types: ['MEAL'] }))).toEqual(['dinner', 'snack'])
  })

  it('needs both a selected zone and a selected type when both are set', () => {
    expect(ids(filterEvents(friday, { zones: ['midnight'], types: ['MEAL'] }))).toEqual(['snack'])
    expect(filterEvents(friday, { zones: ['sunlit'], types: ['MEAL'] })).toEqual([])
  })
})

describe('isFiltering', () => {
  it('is false for the empty filter and true once anything is selected', () => {
    expect(isFiltering(EMPTY_FILTER)).toBe(false)
    expect(isFiltering({ zones: ['sunlit'], types: [] })).toBe(true)
    expect(isFiltering({ zones: [], types: ['OTHER'] })).toBe(true)
  })
})

describe('toggle', () => {
  it('adds a value that is absent and removes one that is present', () => {
    expect(toggle(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggle(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('returns a new array rather than mutating', () => {
    const before = ['a']
    const after = toggle(before, 'b')
    expect(before).toEqual(['a'])
    expect(after).not.toBe(before)
  })
})
