import { describe, expect, it } from 'vitest'
import type { HackEvent } from '../api/types'
import { concurrentWith } from './concurrency'

// Helper: Unix seconds for a Chicago local time in Feb/Mar 2026 (CST, UTC-6).
const chicago = (month: number, day: number, hour: number, minute = 0) =>
  Date.UTC(2026, month - 1, day, hour + 6, minute) / 1000

let nextId = 0
const stub = (startTime: number, minutes: number, name = 'stub'): HackEvent => ({
  eventId: String(nextId++),
  name,
  description: '',
  startTime,
  endTime: startTime + minutes * 60,
  eventType: 'OTHER',
  locations: [],
  points: 0,
})

describe('concurrentWith', () => {
  // Friday evening as it is in the live data.
  const dinner = stub(chicago(2, 27, 18), 90, 'Dinner')
  const rsoExpo = stub(chicago(2, 27, 18), 90, 'RSO Expo')
  const tracks = [
    stub(chicago(2, 27, 19, 30), 60, 'Modal'),
    stub(chicago(2, 27, 19, 30), 60, 'John Deere'),
    stub(chicago(2, 27, 19, 30), 60, 'Stripe'),
    stub(chicago(2, 27, 19, 30), 60, 'Caterpillar'),
  ]
  const teamMatching = stub(chicago(2, 27, 20, 30), 60, 'Team Matching')
  const friday = [dinner, rsoExpo, ...tracks, teamMatching]

  it('reads 3 on each of the four 7:30 PM track introductions', () => {
    for (const track of tracks) expect(concurrentWith(track, friday)).toBe(3)
  })

  it('does not count an event that ends exactly when this one starts', () => {
    // Dinner runs 6:00 to 7:30; the tracks start at 7:30. Adjacent, not overlapping.
    expect(concurrentWith(dinner, friday)).toBe(1)
  })

  it('counts a partial overlap', () => {
    const late = stub(chicago(2, 27, 20), 60)
    expect(concurrentWith(late, [...friday, late])).toBe(5)
  })

  it('reads 0 for an event with the day to itself', () => {
    expect(concurrentWith(teamMatching, friday)).toBe(0)
  })

  it('never counts the event itself', () => {
    expect(concurrentWith(dinner, [dinner])).toBe(0)
  })

  it('treats a zero-duration event as an instant that overlaps anything containing it', () => {
    const deadline = stub(chicago(3, 1, 6), 0, 'Submission deadline')
    const overnight = stub(chicago(3, 1, 5, 30), 60)
    const endsAtSix = stub(chicago(3, 1, 5), 60)
    const startsAtSix = stub(chicago(3, 1, 6), 60)
    expect(concurrentWith(deadline, [overnight, endsAtSix, startsAtSix, deadline])).toBe(2)
    expect(concurrentWith(overnight, [overnight, deadline])).toBe(1)
  })
})
