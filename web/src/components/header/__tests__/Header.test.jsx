import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Header } from '../Header.jsx'

vi.mock('../../../context/NavContext.jsx', () => ({
  useNav: () => ({
    activeTab: 'market',
  }),
}))

vi.mock('../../clicker/LeaderboardWidget.jsx', () => ({
  LeaderboardWidget: ({ placement }) => (
    <div data-placement={placement}>TOP-5</div>
  ),
}))

describe('Header', () => {
  it('renders the leaderboard toggle outside the clicker screen', () => {
    const html = renderToStaticMarkup(<Header />)

    expect(html).toContain('TOP-5')
    expect(html).toContain('data-placement="header"')
  })
})
