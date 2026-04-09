import { useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'

function UnlockCard({ title, item, accentClass }) {
  if (!item) {
    return (
      <div className="unlock-card">
        <div className="unlock-card__label">{title}</div>
        <div className="unlock-card__value unlock-card__value--done">✓ Всё открыто</div>
        <div className="unlock-card__text">Фокус на прокачке уровней.</div>
      </div>
    )
  }

  const shishkiPct = Math.min(100, (item.unlockProgress.shishki / Math.max(1, item.unlockRule.shishki)) * 100)
  const knowledgePct = Math.min(100, (item.unlockProgress.knowledge / Math.max(1, item.unlockRule.knowledge)) * 100)

  return (
    <div className="unlock-card">
      <div className="unlock-card__label">{title}</div>
      <div className={`unlock-card__value ${accentClass}`}>{item.title}</div>
      <div className="unlock-card__text">{item.unlockText}</div>

      <div className="unlock-progress">
        <div className="unlock-progress__row">
          <span>🌰 Шишки</span>
          <span>{formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)}</span>
        </div>
        <div className="unlock-progress__track">
          <div className="unlock-progress__fill" style={{ width: `${shishkiPct}%` }} />
        </div>

        <div className="unlock-progress__row">
          <span>📚 Знания</span>
          <span>{formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)}</span>
        </div>
        <div className="unlock-progress__track">
          <div className="unlock-progress__fill unlock-progress__fill--alt" style={{ width: `${knowledgePct}%` }} />
        </div>
      </div>
    </div>
  )
}

export function ProgressOverview() {
  const { economy, state, resetGame } = useGameContext()

  const nextSub = useMemo(
    () => economy.subscriptions.find((i) => !i.unlocked),
    [economy.subscriptions]
  )
  const nextUpgrade = useMemo(
    () => economy.upgrades.find((i) => !i.unlocked),
    [economy.upgrades]
  )

  return (
    <div className="progress-overview">
      <div className="progress-loop">
        <div className="progress-loop__title">Петля прогресса</div>
        <div className="progress-loop__steps">
          <div className="loop-step"><b>1.</b> Кликаешь → добываешь <b>🌰 шишки</b></div>
          <div className="loop-step"><b>2.</b> Подписки генерируют <b>💵 деньги</b> и <b>📚 знания</b></div>
          <div className="loop-step"><b>3.</b> AI открывает поздние тиры через <b>📚 знания</b></div>
        </div>
      </div>

      <div className="progress-stats">
        <div className="progress-stat">
          <span className="progress-stat__num">{formatNumber(state.totalShishkiEarned)}</span>
          <span className="progress-stat__lbl">всего шишек</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat__num">{formatNumber(state.totalMoneyEarned)}</span>
          <span className="progress-stat__lbl">всего денег</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat__num">{formatNumber(state.totalKnowledgeEarned)}</span>
          <span className="progress-stat__lbl">всего знаний</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat__num">{formatNumber(state.manualClicks)}</span>
          <span className="progress-stat__lbl">ручных кликов</span>
        </div>
      </div>

      {(nextSub || nextUpgrade) &&
        <div className="unlock-grid">
          {nextSub && <UnlockCard title="Следующая подписка" item={nextSub} accentClass="text-fuchsia"/>}
          {nextUpgrade && <UnlockCard title="Следующий апгрейд" item={nextUpgrade} accentClass="text-cyan"/>}
        </div>
      }

      <button className="reset-btn" onClick={resetGame}>
        Сбросить прогресс
      </button>
    </div>
  )
}
