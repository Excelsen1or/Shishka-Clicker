import { isValidElement, memo, useEffect, useMemo, useRef } from 'react'
import { formatNumber } from '../../lib/format'
import { ContributionBar } from './ContributionBar.jsx'
import { ConeIcon } from '../ui/ConeIcon'
import { MoneyIcon, KnowledgeIcon, PowerIcon, RobotIcon, PrizeIcon } from '../ui/GameIcon'

const ICON_MAP = {
  cone: <ConeIcon />,
  money: <MoneyIcon />,
  knowledge: <KnowledgeIcon />,
  power: <PowerIcon />,
  robot: <RobotIcon />,
  prize: <PrizeIcon />,
  mega: '⚡',
  rebirth: '♻️',
  shards: '💎',
  reward: '🔮',
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

function getChangedDigitIndexes(previousValue, nextValue) {
  return buildAnimatedDigits(previousValue, nextValue)
    .map((entry, index) => (entry.changed ? index : -1))
    .filter((index) => index >= 0)
}

export const StatCard = memo(function StatCard({
  icon = null,
  iconKey = '',
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
  const isRenderablePrimitive = typeof value === 'string' || typeof value === 'number'
  const displayValue = formatValue ? formatNumber(value) : value
  const shouldAnimateValue = isRenderablePrimitive && !isValidElement(displayValue)
  const resolvedIcon = typeof icon === 'string'
    ? ICON_MAP[icon] ?? icon
    : icon ?? (iconKey ? ICON_MAP[iconKey] ?? iconKey : null)
  const items = compact ? (contributions?.items?.slice(0, 3) ?? []) : (contributions?.items ?? [])
  const total = items.reduce((sum, entry) => sum + entry.value, 0) ?? 0
  const topContributors = compact ? items.slice(0, 3) : []
  const cardClassName = ['stat-card', compact ? 'stat-card--compact' : '', className].filter(Boolean).join(' ')
  const valueClasses = ['stat-card__value', valueClassName].filter(Boolean).join(' ')
  const hintClasses = ['stat-card__hint', hintClassName].filter(Boolean).join(' ')
  const animatedDigits = useMemo(
    () => (shouldAnimateValue ? buildAnimatedDigits(displayValue, displayValue) : []),
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
    const nodes = valueTrackRef.current?.querySelectorAll('.stat-card__digit')

    if (nodes?.length) {
      nodes.forEach((node) => node.classList.remove('stat-card__digit--changed'))

      if (nextIndexes.length) {
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
          nodes.forEach((node) => node.classList.remove('stat-card__digit--changed'))
        }, 260)
      }
    }

    prevValueRef.current = displayValue
  }, [displayValue, shouldAnimateValue])

  useEffect(() => {
    return () => {
      window.clearTimeout(valueAnimationTimerRef.current)
    }
  }, [])

  return (
    <div ref={cardRef} className={cardClassName} style={{ animationDelay: `${delay * 60}ms` }}>
      {(resolvedIcon || label) && (
        <div className="stat-card__head">
          {resolvedIcon ? <span className="stat-card__icon">{resolvedIcon}</span> : null}
          {label ? <span className="stat-card__label">{label}</span> : null}
        </div>
      )}

      <div
        className={valueClasses}
        
      >
        {shouldAnimateValue ? (
          <span ref={valueTrackRef} className="stat-card__value-track" aria-hidden="true">
            {animatedDigits.map((entry) => (
              <span
                key={entry.key}
                className="stat-card__digit"
              >
                {entry.char}
              </span>
            ))}
          </span>
        ) : (
          <span className="stat-card__value-node">{displayValue}</span>
        )}
      </div>

      {(hint || reserveHintSpace) && <div className={hintClasses}>{hint ?? ''}</div>}

      {children}

      {compact && topContributors.length > 0 && (
        <div className="stat-card__top-contrib">
          {topContributors.map((entry, index) => (
            <div
              key={entry.id}
              className="stat-card__top-contrib-row"
              
            >
              <span>#{index + 1}</span>
              <b>{entry.title}</b>
              <span
                className="stat-card__top-contrib-val"
                
              >
                {formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="stat-card__breakdown">
          {items.map((entry, index) => (
            <ContributionBar key={entry.id} entry={entry} total={total} index={index} />
          ))}
        </div>
      )}
    </div>
  )
})

StatCard.displayName = 'StatCard'
