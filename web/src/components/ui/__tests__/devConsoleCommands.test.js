import { describe, expect, it } from 'vitest'
import {
  parseDevCommand,
  parseDevConsoleControlCommand,
} from '../devConsoleCommands.js'

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

  it('parses sv.www with boolean and numeric aliases', () => {
    expect(parseDevConsoleControlCommand('sv.www true')).toEqual({
      type: 'toggleCheats',
      enabled: true,
    })

    expect(parseDevConsoleControlCommand('sv.www 1')).toEqual({
      type: 'toggleCheats',
      enabled: true,
    })

    expect(parseDevConsoleControlCommand('sv.www false')).toEqual({
      type: 'toggleCheats',
      enabled: false,
    })

    expect(parseDevConsoleControlCommand('sv.www 0')).toEqual({
      type: 'toggleCheats',
      enabled: false,
    })
  })

  it('parses fake sv.cheats aliases as troll commands', () => {
    expect(parseDevCommand('sv.cheats true')).toEqual({
      type: 'troll',
    })

    expect(parseDevCommand('sv_cheats 1')).toEqual({
      type: 'troll',
    })
  })

  it('parses qa helper commands', () => {
    expect(parseDevCommand('tick 60')).toEqual({
      type: 'tick',
      seconds: 60,
    })

    expect(parseDevCommand('event districtHype')).toEqual({
      type: 'event',
      eventId: 'districtHype',
    })

    expect(parseDevCommand('event clear')).toEqual({
      type: 'event',
      eventId: null,
    })

    expect(parseDevCommand('campaign iceFlexer')).toEqual({
      type: 'campaign',
      campaignId: 'iceFlexer',
    })

    expect(parseDevCommand('market unlock')).toEqual({
      type: 'marketToggle',
      enabled: true,
    })

    expect(parseDevCommand('quota ready')).toEqual({
      type: 'quotaReady',
    })

    expect(parseDevCommand('rebirth')).toEqual({
      type: 'rebirth',
    })
  })
})
