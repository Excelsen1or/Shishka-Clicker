import { useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'
import {StatCard} from "../stats/StatCard.jsx"
import {UnlockCard} from "./UnlockCard.jsx"


export function ProgressOverview() {
  const { economy, state, prestige, achievements } = useGameContext()

  const nextSub = useMemo(() => economy.subscriptions.find((i) => !i.unlocked), [economy.subscriptions])
  const nextUpgrade = useMemo(() => economy.upgrades.find((i) => !i.unlocked), [economy.upgrades])
  const unlockedAchievements = achievements.filter((entry) => entry.unlocked).length
  const metaSummary = [
    { icon: '🏆', label: 'Достижения', value: `${unlockedAchievements}/${achievements.length}`, hint: 'открыто сейчас', },
    { icon: '♻️', label: 'Ребёрсы', value: formatNumber(state.rebirths), hint: 'завершённых циклов', },
    { icon: '💎', label: 'Осколки', value: prestige.isUnlocked ? `${formatNumber(state.prestigeShards)} 💎` : 'закрыто', hint: 'баланс престижа', },
    { icon: '🔮', label: 'След. награда', value: prestige.isUnlocked ? `${formatNumber(prestige.projectedShards)} 💎` : 'закрыто', hint: 'если ребёрс сейчас', },
  ]
  const progressStats = [
    { icon: '🌰', label: 'Всего шишек', value: state.lifetimeShishkiEarned },
    { icon: '💵', label: 'Денег в цикле', value: state.totalMoneyEarned },
    { icon: '📚', label: 'Знаний в цикле', value: state.totalKnowledgeEarned },
    { icon: '⚡', label: 'Мега-кликов', value: state.megaClicks },
  ]

  return (
    <div className="progress-overview">
      <div className="progress-stats">
        {progressStats.map((item, index) => (
          <StatCard key={item.label} {...item} delay={index} className="progress-stats__card" />
        ))}
      </div>

      <section className="stats-bar stats-bar--shop meta-lifetime-grid progress-overview__mini-grid">
        {metaSummary.map((item) => (
          <StatCard key={item.label} {...item} formatValue={false} />
        ))}
      </section>

      <StatCard
        className="stat-card--shop-surface stat-card--unlock prestige-overview-card"
        label="Следующий ребёрс"
        value={prestige.isUnlocked ? `Цикл #${prestige.rebirthRule.cycle}` : 'Система ещё закрыта'}
        hint={prestige.isUnlocked
          ? 'Чтобы переродиться, теперь нужно именно закрыть квоту текущего цикла.
          : 'Сначала добей лайфтайм-порог и открой престиж.'}
        valueClassName="text-fuchsia"
        formatValue={false}
      >
        {prestige.isUnlocked ? (
          <div className="unlock-progress">
            <div className="unlock-progress__row">
              <span>🌰 Шишки цикла</span>
              <span>{formatNumber(prestige.cycleProgress.shishki)} / {formatNumber(prestige.rebirthRule.shishki)}</span>
            </div>
            <div className="unlock-progress__track">
              <div className="unlock-progress__fill" style={{ width: `${Math.min(100, prestige.cycleRatios.shishki * 100)}%` }} />
            </div>

            <div className="unlock-progress__row">
              <span>📚 Знания цикла</span>
              <span>{formatNumber(prestige.cycleProgress.knowledge)} / {formatNumber(prestige.rebirthRule.knowledge)}</span>
            </div>
            <div className="unlock-progress__track">
              <div className="unlock-progress__fill unlock-progress__fill--alt" style={{ width: `${Math.min(100, prestige.cycleRatios.knowledge * 100)}%` }} />
            </div>
          </div>
        ) : null}
      </StatCard>

      {(nextSub || nextUpgrade) && (
        <div className="unlock-grid">
          {nextSub && <UnlockCard title="Следующая подписка" item={nextSub} accentClass="text-fuchsia" />}
          {nextUpgrade && <UnlockCard title="Следующий апгрейд" item={nextUpgrade} accentClass="text-cyan" />}
        </div>
      )}
    </div>
  )
}
