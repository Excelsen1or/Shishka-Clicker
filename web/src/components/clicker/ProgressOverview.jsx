import { memo, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { StatCard } from '../stats/StatCard.jsx'
import { UnlockCard } from './UnlockCard.jsx'
import { ConeIcon } from '../ui/ConeIcon'
import { MoneyIcon, KnowledgeIcon } from '../ui/GameIcon'

const ProgressStatsSection = memo(function ProgressStatsSection({ items }) {
  return (
    <div className="progress-stats">
      {items.map((item, index) => (
        <StatCard key={item.label} {...item} delay={index} className="progress-stats__card" formatValue={false} />
      ))}
    </div>
  )
})

const MetaSummarySection = memo(function MetaSummarySection({ items }) {
  return (
    <section className="stats-bar stats-bar--shop meta-lifetime-grid progress-overview__mini-grid">
      {items.map((item) => (
        <StatCard key={item.label} {...item} formatValue={false} />
      ))}
    </section>
  )
})

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
      className="stat-card--shop-surface stat-card--unlock prestige-overview-card"
      label="Следующий ребёрс"
      value={prestigeLabel}
      hint={prestige.isUnlocked
        ? 'Чтобы переродиться нужно закрыть квоту текущего цикла.'
        : 'Сначала добей лайфтайм-порог и открой престиж.'}
      valueClassName="text-fuchsia"
      formatValue={false}
    >
      {prestige.isUnlocked ? (
        <div className="unlock-progress">
          <div className="unlock-progress__row">
            <span><ConeIcon /> Шишки цикла</span>
            <span>
              {cycleShishkiText} / {cycleShishkiGoalText}
            </span>
          </div>
          <div className="unlock-progress__track">
            <div className="unlock-progress__fill" style={{ width: `${Math.min(100, prestige.cycleRatios.shishki * 100)}%` }} />
          </div>

          <div className="unlock-progress__row">
            <span><KnowledgeIcon /> Знания цикла</span>
            <span>
              {cycleKnowledgeText} / {cycleKnowledgeGoalText}
            </span>
          </div>
          <div className="unlock-progress__track">
            <div className="unlock-progress__fill unlock-progress__fill--alt" style={{ width: `${Math.min(100, prestige.cycleRatios.knowledge * 100)}%` }} />
          </div>
        </div>
      ) : null}
    </StatCard>
  )
})

const UnlockPreviewSection = memo(function UnlockPreviewSection({ nextSub, nextUpgrade }) {
  if (!nextSub && !nextUpgrade) return null

  return (
    <div className="unlock-grid">
      {nextSub && <UnlockCard title="Следующая подписка" item={nextSub} accentClass="text-fuchsia" />}
      {nextUpgrade && <UnlockCard title="Следующий апгрейд" item={nextUpgrade} accentClass="text-cyan" />}
    </div>
  )
})

export const ProgressOverview = observer(function ProgressOverview() {
  const { progressOverviewData } = useGameStore()
  const {
    nextSub,
    nextUpgrade,
    unlockedAchievements,
    achievementsTotal,
    rebirthsText,
    prestigeShardsText,
    projectedShardsText,
    lifetimeShishkiEarnedText,
    totalMoneyEarnedText,
    totalKnowledgeEarnedText,
    megaClicksText,
    prestigeLabel,
    cycleShishkiText,
    cycleShishkiGoalText,
    cycleShishkiFull,
    cycleShishkiAbbreviated,
    cycleKnowledgeText,
    cycleKnowledgeGoalText,
    cycleKnowledgeFull,
    cycleKnowledgeAbbreviated,
    prestige,
  } = progressOverviewData

  const metaSummary = useMemo(() => ([
    { iconKey: 'prize', label: 'Достижения', value: `${unlockedAchievements}/${achievementsTotal}`, hint: 'открыто сейчас' },
    { iconKey: 'rebirth', label: 'Ребёрсы', value: rebirthsText, hint: 'завершённых циклов' },
    { iconKey: 'shards', label: 'Осколки', value: prestige.isUnlocked ? `${prestigeShardsText} 💎` : 'закрыто', hint: 'баланс престижа' },
    { iconKey: 'reward', label: 'След. награда', value: prestige.isUnlocked ? `${projectedShardsText} 💎` : 'закрыто', hint: 'если ребёрс сейчас' },
  ]), [achievementsTotal, projectedShardsText, prestige.isUnlocked, prestigeShardsText, rebirthsText, unlockedAchievements])

  const progressStats = useMemo(() => ([
    { icon: <ConeIcon />, label: 'Всего шишек', value: lifetimeShishkiEarnedText },
    { icon: <MoneyIcon />, label: 'Денег в цикле', value: totalMoneyEarnedText },
    { icon: <KnowledgeIcon />, label: 'Знаний в цикле', value: totalKnowledgeEarnedText },
    { iconKey: 'mega', label: 'Мега-кликов', value: megaClicksText },
  ]), [lifetimeShishkiEarnedText, megaClicksText, totalKnowledgeEarnedText, totalMoneyEarnedText])

  return (
    <div className="progress-overview">
      <ProgressStatsSection items={progressStats} />
      <MetaSummarySection items={metaSummary} />
      <PrestigeOverviewCard
        prestige={prestige}
        prestigeLabel={prestigeLabel}
        cycleShishkiText={cycleShishkiText}
        cycleShishkiGoalText={cycleShishkiGoalText}
        cycleShishkiFull={cycleShishkiFull}
        cycleShishkiAbbreviated={cycleShishkiAbbreviated}
        cycleKnowledgeText={cycleKnowledgeText}
        cycleKnowledgeGoalText={cycleKnowledgeGoalText}
        cycleKnowledgeFull={cycleKnowledgeFull}
        cycleKnowledgeAbbreviated={cycleKnowledgeAbbreviated}
      />
      <UnlockPreviewSection nextSub={nextSub} nextUpgrade={nextUpgrade} />
    </div>
  )
})
