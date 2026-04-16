import { memo, useMemo } from 'react'
import { Gem, PxlKitIcon, Scroll } from '../../lib/pxlkit'
import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { StatCard } from '../stats/StatCard.jsx'
import { UnlockCard } from './UnlockCard.jsx'
import { ConeIcon } from '../ui/ConeIcon'

const SideKpiGrid = memo(function SideKpiGrid({
  items,
  reserveHintSpace = false,
}) {
  return (
    <div className="side-kpi-grid">
      {items.map((item, index) => (
        <StatCard
          key={item.label}
          {...item}
          delay={index}
          variant="pixel"
          className="side-kpi-card"
          formatValue={false}
          reserveHintSpace={reserveHintSpace}
        />
      ))}
    </div>
  )
})

const MetaSummarySection = memo(function MetaSummarySection({ items }) {
  return (
    <section className="stats-bar stats-bar--shop meta-lifetime-grid progress-overview__mini-grid">
      {items.map((item) => (
        <StatCard
          key={item.label}
          {...item}
          formatValue={false}
          variant="pixel"
        />
      ))}
    </section>
  )
})

function useProgressStatsItems() {
  const { progressOverviewData } = useGameStore()
  const {
    lifetimeShishkiEarnedText,
    totalMoneyEarnedText,
    totalKnowledgeEarnedText,
    megaClicksText,
  } = progressOverviewData

  return useMemo(
    () => [
      {
        iconKey: 'cone',
        label: 'Всего шишек',
        value: lifetimeShishkiEarnedText,
      },
      { iconKey: 'money', label: 'Денег в цикле', value: totalMoneyEarnedText },
      {
        iconKey: 'knowledge',
        label: 'Знаний в цикле',
        value: totalKnowledgeEarnedText,
      },
      { iconKey: 'mega', label: 'Мега-кликов', value: megaClicksText },
    ],
    [
      lifetimeShishkiEarnedText,
      megaClicksText,
      totalKnowledgeEarnedText,
      totalMoneyEarnedText,
    ],
  )
}

function useMetaSummaryItems() {
  const { progressOverviewData } = useGameStore()
  const {
    unlockedAchievements,
    achievementsTotal,
    rebirthsText,
    prestigeShardsText,
    projectedShardsText,
    prestige,
  } = progressOverviewData

  return useMemo(
    () => [
      {
        iconKey: 'prize',
        label: 'Достижения',
        value: `${unlockedAchievements}/${achievementsTotal}`,
        hint: 'открыто сейчас',
      },
      {
        iconKey: 'rebirth',
        label: 'Ребёрсы',
        value: rebirthsText,
        hint: 'завершённых циклов',
      },
      {
        iconKey: 'shards',
        label: 'Осколки',
        value: prestige.isUnlocked ? prestigeShardsText : 'закрыто',
        hint: 'баланс престижа',
      },
      {
        iconKey: 'reward',
        label: 'След. награда',
        value: prestige.isUnlocked ? projectedShardsText : 'закрыто',
        hint: 'если ребёрс сейчас',
      },
    ],
    [
      achievementsTotal,
      projectedShardsText,
      prestige.isUnlocked,
      prestigeShardsText,
      rebirthsText,
      unlockedAchievements,
    ],
  )
}

const PrestigeOverviewCard = memo(function PrestigeOverviewCard({
  prestige,
  prestigeLabel,
  cycleShishkiText,
  cycleShishkiGoalText,
  cycleKnowledgeText,
  cycleKnowledgeGoalText,
}) {
  return (
    <StatCard
      variant="pixel"
      className="stat-card--shop-surface stat-card--unlock prestige-overview-card pixel-surface"
      label="Следующий ребёрс"
      value={prestigeLabel}
      hint={
        prestige.isUnlocked
          ? 'Чтобы переродиться нужно закрыть квоту текущего цикла.'
          : 'Сначала добей лайфтайм-порог и открой престиж.'
      }
      valueClassName="text-fuchsia"
      formatValue={false}
    >
      {prestige.isUnlocked ? (
        <div className="unlock-progress">
          <div className="unlock-progress__row">
            <span>
              <ConeIcon /> Шишки цикла
            </span>
            <span>
              {cycleShishkiText} / {cycleShishkiGoalText}
            </span>
          </div>
          <div className="unlock-progress__track">
            <div
              className="unlock-progress__fill"
              style={{
                width: `${Math.min(100, prestige.cycleRatios.shishki * 100)}%`,
              }}
            />
          </div>

          <div className="unlock-progress__row">
            <span>
              <PxlKitIcon
                icon={Scroll}
                size={16}
                colorful
                className="pixel-inline-icon"
              />{' '}
              Знания цикла
            </span>
            <span>
              {cycleKnowledgeText} / {cycleKnowledgeGoalText}
            </span>
          </div>
          <div className="unlock-progress__track">
            <div
              className="unlock-progress__fill unlock-progress__fill--alt"
              style={{
                width: `${Math.min(100, prestige.cycleRatios.knowledge * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : null}
    </StatCard>
  )
})

const UnlockPreviewSection = memo(function UnlockPreviewSection({
  nextSub,
  nextUpgrade,
}) {
  if (!nextSub && !nextUpgrade) return null

  return (
    <div className="unlock-grid">
      {nextSub ? (
        <UnlockCard
          title="Следующая подписка"
          item={nextSub}
          accentClass="text-fuchsia"
        />
      ) : null}
      {nextUpgrade ? (
        <UnlockCard
          title="Следующий апгрейд"
          item={nextUpgrade}
          accentClass="text-cyan"
        />
      ) : null}
    </div>
  )
})

export const ProgressStatsPanel = observer(function ProgressStatsPanel({
  className = '',
}) {
  const items = useProgressStatsItems()

  return (
    <section className={`progress-stats-panel ${className}`.trim()}>
      <SideKpiGrid items={items} reserveHintSpace />
    </section>
  )
})

export const ProgressMetaPanel = observer(function ProgressMetaPanel({
  className = '',
}) {
  const items = useMetaSummaryItems()

  return (
    <section className={`progress-stats-panel ${className}`.trim()}>
      <SideKpiGrid items={items} />
    </section>
  )
})

export const ProgressOverview = observer(function ProgressOverview({
  hideStats = false,
  hideMeta = false,
}) {
  const { progressOverviewData } = useGameStore()
  const {
    nextSub,
    nextUpgrade,
    prestigeLabel,
    cycleShishkiText,
    cycleShishkiGoalText,
    cycleKnowledgeText,
    cycleKnowledgeGoalText,
    prestige,
  } = progressOverviewData
  const progressStats = useProgressStatsItems()
  const metaSummary = useMetaSummaryItems()

  return (
    <div className="progress-overview">
      {hideStats ? null : (
        <SideKpiGrid items={progressStats} reserveHintSpace />
      )}
      {hideMeta ? null : <MetaSummarySection items={metaSummary} />}
      <PrestigeOverviewCard
        prestige={prestige}
        prestigeLabel={prestigeLabel}
        cycleShishkiText={cycleShishkiText}
        cycleShishkiGoalText={cycleShishkiGoalText}
        cycleKnowledgeText={cycleKnowledgeText}
        cycleKnowledgeGoalText={cycleKnowledgeGoalText}
      />
      <UnlockPreviewSection nextSub={nextSub} nextUpgrade={nextUpgrade} />
    </div>
  )
})
