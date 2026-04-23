import { describe, expect, it } from 'vitest'
import { LEADERBOARD_TABS } from '../LeaderboardWidget.jsx'

describe('LeaderboardWidget', () => {
  it('defines the time leaderboard tab', () => {
    expect(LEADERBOARD_TABS.some((tab) => tab.id === 'time')).toBe(true)
  })
})
