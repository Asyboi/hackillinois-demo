import { describe, expect, it } from 'vitest'
import { durationMinutes, formatDate, formatRange, formatTime, toRoman, typeLabel } from './format'

const chicago = (month: number, day: number, hour: number, minute = 0) =>
  Date.UTC(2026, month - 1, day, hour + 6, minute) / 1000

describe('formatTime', () => {
  it('renders in the event time zone regardless of where the browser is', () => {
    expect(formatTime(chicago(2, 27, 18))).toBe('6:00 PM')
    expect(formatTime(chicago(2, 28, 0, 30))).toBe('12:30 AM')
  })
})

describe('formatRange', () => {
  it('joins start and end with a hyphen', () => {
    expect(formatRange(chicago(2, 27, 18), chicago(2, 27, 19, 30))).toBe('6:00 PM - 7:30 PM')
  })
})

describe('formatDate', () => {
  it('keeps 12:30 AM on the calendar day it falls on, in Chicago', () => {
    expect(formatDate(chicago(2, 28, 0, 30))).toBe('Feb 28')
  })
})

describe('typeLabel', () => {
  it('names the useful types and hides OTHER', () => {
    expect(typeLabel('MINIEVENT')).toBe('Mini event')
    expect(typeLabel('OTHER')).toBeNull()
  })
})

describe('durationMinutes', () => {
  it('handles the zero-duration submission deadline', () => {
    const t = chicago(3, 1, 6)
    expect(durationMinutes(t, t)).toBe(0)
  })

  it('rounds to whole minutes', () => {
    expect(durationMinutes(0, 5400)).toBe(90)
  })
})

describe('toRoman', () => {
  it('covers every stop number a day can have', () => {
    const expected = [
      'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
      'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx',
    ]
    expected.forEach((roman, i) => expect(toRoman(i + 1)).toBe(roman))
  })
})
