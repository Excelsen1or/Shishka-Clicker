import { useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'

function UnlockCard({ title, item, accentClass }) {
  if (!item) {
    return (
      <div className="unlock-card">
        <div className="unlock-card__label">{title}</div>
        <div className="unlock-card__value unlock-card__value--done">✓ Всё открыто</div>
        <div className="unlock-card__text">Фокус на прокачке уровней и престиже.</div>
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

export function ProgressLoopCard() {
  return (
    <article className="meta-card progress-loop-card">
      <div className="meta-card__kicker">Петля прогресса</div>
      <h3 className="meta-card__title">Как теперь устроен цикл</h3>
      <div className="progress-loop__steps">
        <div className="loop-step"><b>1.</b> Кликаешь и фармишь <b>🌰 шишки</b>.</div>
        <div className="loop-step"><b>2.</b> Вкладываешь их в ветки за <b>💵 деньги</b>, <b>📚 знания</b> и <b>🌰 шишечные апгрейды</b>.</div>
        <div className="loop-step"><b>3.</b> Открываешь престиж, закрываешь квоту цикла и получаешь редкие <b>💎 осколки</b>.</div>
      </div>
    </article>
  )
}

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
        <div><span>Ребёрсы</span><b>{formatNumber(state.rebirths)}</b></div>
        <div><span>Осколки</span><b>{formatNumber(state.prestigeShards)}</b></div>
        <div><span>Достижения</span><b>{unlockedAchievements}/{achievements.length}</b></div>
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
