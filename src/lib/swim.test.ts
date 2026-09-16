import { describe, expect, it } from 'vitest'
import { swimKeyframes } from './swim'

// A swimmer crosses the visible band left to right and re-enters from the
// left; the jump back must happen while it is off both edges so the loop
// never pops on screen.
const left = 60
const right = 340
const margin = 45

describe('swimKeyframes', () => {
  it('starts and ends at the resting x so the loop is seamless', () => {
    const { x } = swimKeyframes(150, left, right, margin)
    expect(x[0]).toBe(150)
    expect(x[x.length - 1]).toBe(150)
  })

  it('exits past the right edge and re-enters from past the left edge', () => {
    const { x } = swimKeyframes(150, left, right, margin)
    expect(x).toEqual([150, right + margin, left - margin, 150])
  })

  it('makes the jump instantaneous by giving both jump keyframes the same time', () => {
    const { times } = swimKeyframes(150, left, right, margin)
    expect(times[1]).toBe(times[2])
  })

  it('paces the two legs by distance so speed is constant across the jump', () => {
    const { times } = swimKeyframes(150, left, right, margin)
    const total = right + margin - (left - margin)
    const cut = (right + margin - 150) / total
    expect(times).toEqual([0, cut, cut, 1])
  })

  it('keeps times monotonic for any resting x inside the band', () => {
    for (const start of [left, 97, 200, 339, right]) {
      const { times } = swimKeyframes(start, left, right, margin)
      for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThanOrEqual(times[i - 1])
      expect(times[0]).toBe(0)
      expect(times[3]).toBe(1)
    }
  })
})
