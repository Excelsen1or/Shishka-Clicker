import { useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import {MainStore} from "../../MainStore.js"


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
          <span>{MainStore.formatShortNumber(item.unlockProgress.shishki)} / {MainStore.formatShortNumber(item.unlockRule.shishki)}</span>
        </div>
        <div className="unlock-progress__track">
          <div className="unlock-progress__fill" style={{ width: `${shishkiPct}%` }} />
        </div>

        <div className="unlock-progress__row">
          <span>📚 Знания</span>
          <span>{MainStore.formatShortNumber(item.unlockProgress.knowledge)} / {MainStore.formatShortNumber(item.unlockRule.knowledge)}</span>
        </div>
        <div className="unlock-progress__track">
          <div className="unlock-progress__fill unlock-progress__fill--alt" style={{ width: `${knowledgePct}%` }} />
        </div>
      </div>
    </div>
  )
}

export function ProgressOverview() {
  const { economy, state, prestige, achievements } = useGameContext()

  const nextSub = useMemo(() => economy.subscriptions.find((i) => !i.unlocked), [economy.subscriptions])
  const nextUpgrade = useMemo(() => economy.upgrades.find((i) => !i.unlocked), [economy.upgrades])
  const unlockedAchievements = achievements.filter((entry) => entry.unlocked).length

  return (
    <div className="progress-overview">
      <div className="progress-loop">
        <div className="progress-loop__title">Петля прогресса</div>
        <div className="progress-loop__steps">
          <div className="loop-step"><b>1.</b> Кликаешь → добываешь <b>🌰 шишки</b></div>
          <div className="loop-step"><b>2.</b> Подписки и апгрейды делают <b>💵 деньги</b> и <b>📚 знания</b></div>
          <div className="loop-step"><b>3.</b> Мега-клики и престиж ускоряют позднюю игру</div>
        </div>
      </div>

      <div className="progress-stats">
        <div className="progress-stat">
          <span className="progress-stat__num">{MainStore.formatShortNumber(state.lifetimeShishkiEarned)}</span>
          <span className="progress-stat__lbl">всего шишек</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat__num">{MainStore.formatShortNumber(state.totalMoneyEarned)}</span>
          <span className="progress-stat__lbl">денег в этом цикле</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat__num">{MainStore.formatShortNumber(state.totalKnowledgeEarned)}</span>
          <span className="progress-stat__lbl">знаний в этом цикле</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat__num">{MainStore.formatShortNumber(state.megaClicks)}</span>
          <span className="progress-stat__lbl">мега-кликов</span>
        </div>
      </div>

      <div className="meta-lifetime-grid progress-overview__mini-grid">
        <div><span>Ребёрсы</span><b>{MainStore.formatShortNumber(state.rebirths)}</b></div>
        <div><span>Осколки</span><b>{MainStore.formatShortNumber(state.prestigeShards)}</b></div>
        <div><span>Достижения</span><b>{unlockedAchievements}/{achievements.length}</b></div>
        <div><span>До ребёрса</span><b>{prestige.canRebirth ? 'готово' : MainStore.formatShortNumber(prestige.nextGoal)}</b></div>
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
