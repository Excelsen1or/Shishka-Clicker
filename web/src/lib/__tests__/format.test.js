import { describe, expect, it } from 'vitest'
import { formatNumber } from '../format.js'

describe('formatNumber', () => {
  it('rounds noisy balances for ui cards', () => {
    expect(formatNumber(99.76003999999)).toBe('99,8')
  })

  it('keeps small fractional balances visible', () => {
    expect(formatNumber(0.03)).toBe('0,03')
  })
})
