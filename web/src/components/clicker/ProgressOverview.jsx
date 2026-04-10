import { useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'
import {UnlockCard} from "./UnlockCard.jsx"


export function ProgressOverview() {
  const { economy, state, prestige, achievements } = useGameContext()

  const nextSub = useMemo(() => economy.subscriptions.find((i) => !i.unlocked), [economy.subscriptions])
  const nextUpgrade = useMemo(() => economy.upgrades.find((i) => !i.unlocked), [economy.upgrades])
  const unlockedAchievements = achievements.filter((entry) => entry.unlocked).length

  return (
    <div className="progress-overview">
      <div className="progress-stats">
        <div className="progress-stat">
          <span className="progress-stat__num">{formatNumber(state.lifetimeShishkiEarned)}</span>
          <span className="progress-stat__lbl">всего шишек</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat__num">{formatNumber(state.totalMoneyEarned)}</span>
          <span className="progress-stat__lbl">денег в этом цикле</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat__num">{formatNumber(state.totalKnowledgeEarned)}</span>
          <span className="progress-stat__lbl">знаний в этом цикле</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat__num">{formatNumber(state.megaClicks)}</span>
          <span className="progress-stat__lbl">мега-кликов</span>
        </div>
      </div>

      <div className="meta-lifetime-grid progress-overview__mini-grid">
        <div><span>Достижения</span><b>{unlockedAchievements}/{achievements.length}</b></div>
        <div><span>Ребёрсы</span><b>{formatNumber(state.rebirths)}</b></div>
        <div><span>Осколки</span><b>{prestige.isUnlocked ? `${formatNumber(state.prestigeShards)} 💎` : 'закрыто'}</b></div>
        <div><span>След. награда</span><b>{prestige.isUnlocked ? `${formatNumber(prestige.projectedShards)} 💎` : 'закрыто'}</b></div>
      </div>

      <div className="unlock-card prestige-overview-card">
        <div className="unlock-card__label">Следующий ребёрс</div>
        <div className="unlock-card__value text-fuchsia">
          {prestige.isUnlocked ? `Цикл #${prestige.rebirthRule.cycle}` : 'Система ещё закрыта'}
        </div>
        <div className="unlock-card__text">
          {prestige.isUnlocked
            ? 'Чтобы переродиться, теперь нужно именно закрыть квоту текущего цикла, а не просто нажать кнопку.'
            : 'Сначала добей лайфтайм-порог и открой престиж.'}
        </div>

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
      </div>

      {(nextSub || nextUpgrade) && (
        <div className="unlock-grid">
          {nextSub && <UnlockCard title="Следующая подписка" item={nextSub} accentClass="text-fuchsia" />}
          {nextUpgrade && <UnlockCard title="Следующий апгрейд" item={nextUpgrade} accentClass="text-cyan" />}
        </div>
      )}
    </div>
  )
}
