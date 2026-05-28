import { describe, it, expect } from 'vitest'
import { Shoe } from '../domain/models/shoe'

describe('Shoe', () => {
  it('starts with 312 cards (6 × 52)', () => {
    const shoe = new Shoe()
    expect(shoe.remainingCount).toBe(312)
  })

  it('deal removes one card', () => {
    const shoe = new Shoe()
    const card = shoe.deal()
    expect(card).toBeDefined()
    expect(shoe.remainingCount).toBe(311)
  })

  it('penetration is 0 at start', () => {
    const shoe = new Shoe()
    expect(shoe.penetration).toBeCloseTo(0)
  })

  it('penetration reaches 75% after 234 deals, reshuffle on 235th', () => {
    const shoe = new Shoe()
    for (let i = 0; i < 234; i++) shoe.deal()
    expect(shoe.remainingCount).toBe(78)   // no reshuffle yet
    shoe.deal()                             // triggers reshuffle then deals
    expect(shoe.remainingCount).toBe(311)
  })

  it('second reshuffle cycle works correctly', () => {
    const shoe = new Shoe()
    // First reshuffle at deal 235
    for (let i = 0; i < 235; i++) shoe.deal()
    expect(shoe.remainingCount).toBe(311)
    // From 311, need 233 more deals to reach 75% threshold (311-233=78)
    for (let i = 0; i < 233; i++) shoe.deal()
    expect(shoe.remainingCount).toBe(78)
    shoe.deal()  // triggers second reshuffle
    expect(shoe.remainingCount).toBe(311)
  })

  it('reshuffle() resets to 312', () => {
    const shoe = new Shoe()
    shoe.deal(); shoe.deal()
    shoe.reshuffle()
    expect(shoe.remainingCount).toBe(312)
  })
})
