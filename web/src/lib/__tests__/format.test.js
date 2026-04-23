import { describe, expect, it } from 'vitest'
import {
  formatDurationCompact,
  formatDurationDetailed,
  formatNumber,
} from '../format.js'

describe('formatNumber', () => {
  it('rounds noisy balances for ui cards', () => {
    expect(formatNumber(99.76003999999)).toBe('99,8')
  })

  it('keeps small fractional balances visible', () => {
    expect(formatNumber(0.03)).toBe('0,03')
  })
})

describe('playtime formatters', () => {
  it('formats short durations compactly', () => {
    expect(formatDurationCompact(42)).toBe('42с')
    expect(formatDurationCompact(75)).toBe('1м 15с')
  })

  it('formats long durations without noisy seconds', () => {
    expect(formatDurationCompact(3661)).toBe('1ч 1м')
  })

  it('formats detailed durations for meta cards', () => {
    expect(formatDurationDetailed(7322)).toBe('2 ч 2 м')
  })
})
