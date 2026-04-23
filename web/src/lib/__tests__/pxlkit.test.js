import { describe, expect, it } from 'vitest'
import {
  PxlKitIconBoundary,
  hasRenderablePxlKitIconShape,
  isRenderableStaticPxlKitIconShape,
} from '../pxlkit.js'

describe('hasRenderablePxlKitIconShape', () => {
  it('accepts grid-based icons', () => {
    expect(
      hasRenderablePxlKitIconShape({
        grid: [['x']],
      }),
    ).toBe(true)
  })

  it('accepts frame-based icons', () => {
    expect(
      hasRenderablePxlKitIconShape({
        frames: [[['x']]],
      }),
    ).toBe(true)
  })

  it('rejects empty icon payloads', () => {
    expect(hasRenderablePxlKitIconShape(null)).toBe(false)
    expect(hasRenderablePxlKitIconShape({})).toBe(false)
  })
})

describe('isRenderableStaticPxlKitIconShape', () => {
  it('accepts grid-based icons only', () => {
    expect(
      isRenderableStaticPxlKitIconShape({
        grid: [['x']],
      }),
    ).toBe(true)
    expect(
      isRenderableStaticPxlKitIconShape({
        frames: [[['x']]],
      }),
    ).toBe(false)
  })
})

describe('PxlKitIconBoundary', () => {
  it('switches to a fallback render after an icon error', () => {
    const instance = new PxlKitIconBoundary({
      icon: { name: 'broken' },
      size: 16,
      className: 'pixel-inline-icon',
    })

    instance.state = {
      hasError: true,
    }

    const element = instance.render()

    expect(element.props['data-pxlkit-fallback']).toBe('true')
    expect(element.props.className).toContain('pixel-inline-icon')
  })
})
