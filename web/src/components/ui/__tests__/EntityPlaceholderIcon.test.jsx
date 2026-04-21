import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { EntityPlaceholderIcon } from '../EntityPlaceholderIcon.jsx'

describe('EntityPlaceholderIcon', () => {
  it('renders a fixed 32x32 placeholder tile with a short code', () => {
    const html = renderToStaticMarkup(
      <EntityPlaceholderIcon
        code="market_pickup_point_leftovers"
        label="Остатки с ПВЗ"
        type="market"
        state="active"
      />,
    )

    expect(html).toContain('entity-placeholder-icon--active')
    expect(html).toContain('width:32px;height:32px')
    expect(html).toContain('MP')
    expect(html).toContain('Остатки с ПВЗ')
  })

  it('distinguishes available state styling', () => {
    const html = renderToStaticMarkup(
      <EntityPlaceholderIcon
        code="campaign_gray_tour"
        label="Серый тур"
        type="campaign"
        state="available"
      />,
    )

    expect(html).toContain('entity-placeholder-icon--available')
    expect(html).toContain('CG')
  })
})
