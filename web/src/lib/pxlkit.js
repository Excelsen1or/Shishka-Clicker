import { Component, createElement, memo } from 'react'
import { PxlKitIcon as RawPxlKitIcon } from '@pxlkit/core'

export function hasRenderablePxlKitIconShape(icon) {
  if (!icon || typeof icon !== 'object') {
    return false
  }

  if (Array.isArray(icon.grid) && icon.grid.length > 0) {
    return true
  }

  if (Array.isArray(icon.frames) && icon.frames.length > 0) {
    return true
  }

  return false
}

export function isRenderableStaticPxlKitIconShape(icon) {
  return Boolean(
    icon &&
    typeof icon === 'object' &&
    Array.isArray(icon.grid) &&
    icon.grid.length > 0,
  )
}

function renderPxlKitFallback({ size = 16, className = '' }) {
  return createElement('span', {
    'aria-hidden': 'true',
    'data-pxlkit-fallback': 'true',
    className,
    style: {
      display: 'inline-block',
      width: size,
      height: size,
    },
  })
}

export class PxlKitIconBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
    }
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    }
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.icon !== this.props.icon) {
      this.setState({
        hasError: false,
      })
    }
  }

  render() {
    const { renderer = RawPxlKitIcon, icon, ...props } = this.props

    if (this.state.hasError || !isRenderableStaticPxlKitIconShape(icon)) {
      return renderPxlKitFallback(props)
    }

    return createElement(renderer, {
      icon,
      ...props,
    })
  }
}

export const PxlKitIcon = memo(function PxlKitIcon(props) {
  return createElement(PxlKitIconBoundary, props)
})

export * from '@pxlkit/core'
export * from '@pxlkit/gamification'
export * from '@pxlkit/social'
export * from '@pxlkit/ui'
