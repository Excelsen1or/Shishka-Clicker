import { describe, expect, it } from 'vitest'
import { parseDevCommand } from '../devConsoleCommands.js'

describe('parseDevCommand', () => {
  it('accepts the new economy resources only', () => {
    expect(parseDevCommand('give shishki 100')).toEqual({
      type: 'give',
      key: 'shishki',
      value: 100,
    })

    expect(parseDevCommand('give heavenly 2')).toEqual({
      type: 'give',
      key: 'heavenlyShishki',
      value: 2,
    })

    expect(parseDevCommand('give money 100')).toEqual({
      type: 'invalid',
    })
  })
})
