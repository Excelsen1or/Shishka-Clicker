import { isValidElement, memo, useEffect, useMemo, useRef } from 'react'
import {
  AnimatedPxlKitIcon,
  Gem,
  isAnimatedIcon,
  Lightning,
  PxlKitIcon,
  Scroll,
  Sword,
  Trophy,
  Community,
} from '../../lib/pxlkit'
import { formatNumber } from '../../lib/format'
import { ContributionBar } from './ContributionBar.jsx'
import { ConeIcon } from '../ui/ConeIcon'

const renderPxlIcon = (icon, label, size = 18) => (
  <PxlKitIcon
    icon={icon}
    size={size}
    colorful
    className="stat-card__pixel-icon"
    aria-label={label}
  />
)

const ICON_MAP = {
  cone: <ConeIcon />,
  knowledge: renderPxlIcon(Scroll, 'knowledge'),
  power: renderPxlIcon(Sword, 'power'),
  mega: renderPxlIcon(Lightning, 'mega'),
  rebirth: renderPxlIcon(Community, 'rebirth'),
  shards: renderPxlIcon(Gem, 'shards'),
  reward: renderPxlIcon(Trophy, 'reward'),
}

const PIXEL_ICON_MAP = {
  knowledge: Scroll,
  power: Sword,
  mega: Lightning,
  rebirth: Community,
  shards: Gem,
  reward: Trophy,
}

function buildAnimatedDigits(previousValue, nextValue) {
  const prevText = String(previousValue ?? '')
  const nextText = String(nextValue ?? '')
  const prevChars = Array.from(prevText)
  const nextChars = Array.from(nextText)

  return nextChars.map((char, index) => {
    const rightOffset = nextChars.length - 1 - index
    const prevIndex = prevChars.length - 1 - rightOffset
    const prevChar = prevIndex >= 0 ? prevChars[prevIndex] : ''

    return {
      char,
      changed: /\d/.test(char) && prevChar !== char,
      key: `${index}-${char}`,
    }
  })
}

export function getChangedDigitIndexes(previousValue, nextValue) {
  return buildAnimatedDigits(previousValue, nextValue)
    .map((entry, index) => (entry.changed ? index : -1))
    .filter((index) => index >= 0)
}

export const StatCard = memo(function StatCard({
  icon = null,
  iconKey = '',
  pixelIcon = null,
  variant = 'default',
  label,
  value,
  hint,
  reserveHintSpace = false,
  contributions,
  delay = 0,
  compact = false,
  className = '',
  formatValue = true,
  valueClassName = '',
  hintClassName = '',
  children,
}) {
  const prevValueRef = useRef(null)
  const cardRef = useRef(null)
  const valueTrackRef = useRef(null)
  const valueAnimationTimerRef = useRef(null)
  const isRenderablePrimitive =
    typeof value === 'string' || typeof value === 'number'
  const displayValue = useMemo(
    () => (formatValue ? formatNumber(value) : value),
    [formatValue, value],
  )
  const shouldAnimateValue =
    isRenderablePrimitive && !isValidElement(displayValue)
  const resolvedIcon = useMemo(
    () =>
      typeof icon === 'string'
        ? (ICON_MAP[icon] ?? icon)
        : (icon ?? (iconKey ? (ICON_MAP[iconKey] ?? iconKey) : null)),
    [icon, iconKey],
  )
  const resolvedPixelIcon = useMemo(
    () => pixelIcon ?? (iconKey ? (PIXEL_ICON_MAP[iconKey] ?? null) : null),
    [iconKey, pixelIcon],
  )
  const iconNode = useMemo(() => {
    if (variant === 'pixel' && resolvedPixelIcon) {
      const sharedProps = {
        icon: resolvedPixelIcon,
        size: 18,
        colorful: true,
        className: 'stat-card__pixel-icon',
        'aria-label': label ?? iconKey,
      }

      return isAnimatedIcon(resolvedPixelIcon) ? (
        <AnimatedPxlKitIcon {...sharedProps} />
      ) : (
        <PxlKitIcon {...sharedProps} />
      )
    }

    return resolvedIcon
  }, [iconKey, label, resolvedIcon, resolvedPixelIcon, variant])
  const items = useMemo(
    () =>
      compact
        ? (contributions?.items?.slice(0, 3) ?? [])
        : (contributions?.items ?? []),
    [compact, contributions?.items],
  )
  const total = useMemo(
    () => items.reduce((sum, entry) => sum + entry.value, 0) ?? 0,
    [items],
  )
  const topContributors = useMemo(
    () => (compact ? items.slice(0, 3) : []),
    [compact, items],
  )
  const cardClassName = useMemo(
    () =>
      [
        'stat-card',
        `stat-card--${variant}`,
        compact ? 'stat-card--compact' : '',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [className, compact, variant],
  )
  const valueClasses = useMemo(
    () => ['stat-card__value', valueClassName].filter(Boolean).join(' '),
    [valueClassName],
  )
  const hintClasses = useMemo(
    () => ['stat-card__hint', hintClassName].filter(Boolean).join(' '),
    [hintClassName],
  )
  const cardStyle = useMemo(
    () => ({ animationDelay: `${delay * 60}ms` }),
    [delay],
  )
  const animatedDigits = useMemo(
    () =>
      shouldAnimateValue ? buildAnimatedDigits(displayValue, displayValue) : [],
    [displayValue, shouldAnimateValue],
  )

  useEffect(() => {
    if (!shouldAnimateValue) {
      prevValueRef.current = displayValue
      return
    }

    const previousValue = prevValueRef.current ?? displayValue
    const nextIndexes = getChangedDigitIndexes(previousValue, displayValue)
    const cardNode = cardRef.current
    const valueTrackNode = valueTrackRef.current
    const nodes = valueTrackNode?.children

    if (!nodes?.length) {
      prevValueRef.current = displayValue
      return
    }

    for (const node of nodes) {
      node.classList.remove('stat-card__digit--changed')
    }

    if (!nextIndexes.length) {
      prevValueRef.current = displayValue
      return
    }

    cardNode?.classList.remove('stat-card--updated')
    valueTrackNode?.classList.remove('stat-card__value-track--changed')

    nextIndexes.forEach((index) => {
      const node = nodes[index]
      if (!node) return
      void node.offsetWidth
      node.classList.add('stat-card__digit--changed')
    })

    void cardNode?.offsetWidth
    cardNode?.classList.add('stat-card--updated')
    valueTrackNode?.classList.add('stat-card__value-track--changed')

    window.clearTimeout(valueAnimationTimerRef.current)
    valueAnimationTimerRef.current = window.setTimeout(() => {
      cardNode?.classList.remove('stat-card--updated')
      valueTrackNode?.classList.remove('stat-card__value-track--changed')
      for (const node of nodes) {
        node.classList.remove('stat-card__digit--changed')
      }
    }, 260)

    prevValueRef.current = displayValue
  }, [displayValue, shouldAnimateValue])

  useEffect(() => {
    return () => {
      window.clearTimeout(valueAnimationTimerRef.current)
    }
  }, [])

  return (
    <div ref={cardRef} className={cardClassName} style={cardStyle}>
      {(resolvedIcon || label) && (
        <div className="stat-card__head">
          {iconNode ? (
            <span className="stat-card__icon">{iconNode}</span>
          ) : null}
          {label ? <span className="stat-card__label">{label}</span> : null}
        </div>
      )}

      <div className={valueClasses}>
        {shouldAnimateValue ? (
          <span
            ref={valueTrackRef}
            className="stat-card__value-track"
            aria-hidden="true"
          >
            {animatedDigits.map((entry) => (
              <span key={entry.key} className="stat-card__digit">
                {entry.char}
              </span>
            ))}
          </span>
        ) : (
          <span className="stat-card__value-node">{displayValue}</span>
        )}
      </div>

      {(hint || reserveHintSpace) && (
        <div className={hintClasses}>{hint ?? ''}</div>
      )}

      {children}

      {compact && topContributors.length > 0 && (
        <div className="stat-card__top-contrib">
          {topContributors.map((entry, index) => (
            <div key={entry.id} className="stat-card__top-contrib-row">
              <span>#{index + 1}</span>
              <b>{entry.title}</b>
              <span className="stat-card__top-contrib-val">
                {formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="stat-card__breakdown">
          {items.map((entry, index) => (
            <ContributionBar
              key={entry.id}
              entry={entry}
              total={total}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
})

StatCard.displayName = 'StatCard'
