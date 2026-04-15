import { memo } from 'react'
import { formatNumber } from '../../lib/format.js'
import { StatCard } from '../stats/StatCard.jsx'
import { ConeIcon } from '../ui/ConeIcon'
import { KnowledgeIcon } from '../ui/GameIcon'

function areUnlockItemsEqual(previousItem, nextItem) {
  if (previousItem === nextItem) return true
  if (!previousItem || !nextItem) return previousItem === nextItem

  return previousItem.id === nextItem.id
    && previousItem.title === nextItem.title
    && previousItem.unlockText === nextItem.unlockText
    && previousItem.unlockRule?.shishki === nextItem.unlockRule?.shishki
    && previousItem.unlockRule?.knowledge === nextItem.unlockRule?.knowledge
    && previousItem.unlockProgress?.shishki === nextItem.unlockProgress?.shishki
    && previousItem.unlockProgress?.knowledge === nextItem.unlockProgress?.knowledge
}

export const UnlockCard = memo(function UnlockCard({ title, item, accentClass }) {
  if (!item) {
    return (
      <StatCard
        label={title}
        value="✓ Всё открыто"
        hint="Фокус на прокачке уровней и престиже."
        formatValue={false}
        className="stat-card--shop-surface stat-card--unlock"
        valueClassName="stat-card__value--done"
      />
    )
  }

  const shishkiPct = Math.min(100, (item.unlockProgress.shishki / Math.max(1, item.unlockRule.shishki)) * 100)
  const knowledgePct = Math.min(100, (item.unlockProgress.knowledge / Math.max(1, item.unlockRule.knowledge)) * 100)

  return (
    <StatCard
      label={title}
      value={item.title}
      hint={item.unlockText}
      formatValue={false}
      className="stat-card--shop-surface stat-card--unlock"
      valueClassName={accentClass}
    >
      <div className="unlock-progress">
        <div className="unlock-progress__row">
          <span><ConeIcon /> Шишки</span>
          <span>{formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)}</span>
        </div>
        <div className="unlock-progress__track">
          <div className="unlock-progress__fill" style={{ width: `${shishkiPct}%` }} />
        </div>

        <div className="unlock-progress__row">
          <span><KnowledgeIcon /> Знания</span>
          <span>{formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)}</span>
        </div>
        <div className="unlock-progress__track">
          <div className="unlock-progress__fill unlock-progress__fill--alt" style={{ width: `${knowledgePct}%` }} />
        </div>
      </div>
    </StatCard>
  )
}, (previousProps, nextProps) => (
  previousProps.title === nextProps.title
  && previousProps.accentClass === nextProps.accentClass
  && areUnlockItemsEqual(previousProps.item, nextProps.item)
))
