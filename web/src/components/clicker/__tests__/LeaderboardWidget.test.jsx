import { describe, expect, it } from 'vitest'
import {
  getLeaderboardRankToneClass,
  isCurrentLeaderboardPlayer,
  LEADERBOARD_TABS,
} from '../LeaderboardWidget.jsx'

describe('LeaderboardWidget', () => {
  it('defines the time leaderboard tab', () => {
    expect(LEADERBOARD_TABS.some((tab) => tab.id === 'time')).toBe(true)
  })

  it('maps podium rows to themed rank styles', () => {
    expect(getLeaderboardRankToneClass(0)).toBe('leaderboard-widget__row--gold')
    expect(getLeaderboardRankToneClass(1)).toBe(
      'leaderboard-widget__row--silver',
    )
    expect(getLeaderboardRankToneClass(2)).toBe(
      'leaderboard-widget__row--bronze',
    )
    expect(getLeaderboardRankToneClass(4)).toBe('')
  })

  it('detects when the current player is present in the leaderboard', () => {
    expect(
      isCurrentLeaderboardPlayer(
        { username: 'arekkuzzera' },
        { username: 'arekkuzzera' },
      ),
    ).toBe(true)
    expect(
      isCurrentLeaderboardPlayer(
        { username: 'Охранник этого дискорда' },
        { username: 'arekkuzzera' },
      ),
    ).toBe(false)
  })
})
