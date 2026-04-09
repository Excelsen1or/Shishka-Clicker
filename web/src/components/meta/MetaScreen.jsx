import { useGameContext } from '../../context/GameContext'
import {MainStore} from "../../MainStore.js"


function AchievementCard({ achievement }) {
  return (
    <article className={`meta-card achievement-card ${achievement.unlocked ? 'achievement-card--done' : ''}`}>
      <div className="achievement-card__head">
        <span>{achievement.unlocked ? '🏆 Открыто' : '🔒 В процессе'}</span>
      </div>
      <h3 className="achievement-card__title">{achievement.title}</h3>
      <p className="achievement-card__desc">{achievement.description}</p>
    </article>
  )
}

function ProgressRow({ label, current, goal, alt = false }) {
  const percent = Math.min(100, (current / Math.max(1, goal)) * 100)

  return (
    <>
      <div className="unlock-progress__row">
        <span>{label}</span>
        <span>{formatNumber(current)} / {formatNumber(goal)}</span>
      </div>
      <div className="unlock-progress__track">
        <div className={`unlock-progress__fill ${alt ? 'unlock-progress__fill--alt' : ''}`} style={{ width: `${percent}%` }} />
      </div>
    </>
  )
}

export function MetaScreen() {
  const { state, achievements, prestige, prestigeReset, resetGame } = useGameContext()
  const unlockedCount = achievements.filter((entry) => entry.unlocked).length

  const handleFullReset = () => {
    resetGame()
  }

  return (
    <section className="screen meta-screen">
      <div className="screen__glow" />

      <div className="screen__header">
        <span className="screen__kicker">Мета</span>
        <h2 className="screen__title">Достижения и престиж</h2>
        <p className="screen__desc">
          Здесь живёт долгосрочный прогресс: достижения, счётчик ребёрсов и постоянный множитель престижа.
        </p>
      </div>

      <div className="meta-grid">
        <article className="meta-card prestige-card">
          <div className="meta-card__kicker">Престиж</div>
          <h3 className="meta-card__title">Система перерождения</h3>
          <div className="meta-stats">
            <div><b>{MainStore.formatShortNumber(state.rebirths)}</b><span>ребёрсов</span></div>
            <div><b>{MainStore.formatShortNumber(state.prestigeShards)}</b><span>осколков</span></div>
            <div><b>x{MainStore.formatShortNumber(state.prestigeMultiplier)}</b><span>постоянный буст</span></div>
          </div>

          {!prestige.isUnlocked ? (
            <>
              <p className="meta-card__desc">
                Перерождения теперь открываются только после середины игры. Сначала накопи экономику, знания и часть достижений.
              </p>

              <div className="unlock-progress">
                <ProgressRow
                  label="🌰 Лайфтайм шишки"
                  current={prestige.unlockProgress.shishki}
                  goal={prestige.unlockRule.shishki}
                />
                <ProgressRow
                  label="📚 Лайфтайм знания"
                  current={prestige.unlockProgress.knowledge}
                  goal={prestige.unlockRule.knowledge}
                  alt
                />
                <ProgressRow
                  label="🏆 Достижения"
                  current={prestige.unlockProgress.achievements}
                  goal={prestige.unlockRule.achievements}
                />
              </div>

              <div className="meta-card__hint">
                После открытия для ребёрса всё равно понадобится ещё {MainStore.formatShortNumber(Math.max(0, prestige.rebirthRule.shishki - prestige.unlockRule.shishki))} лайфтайм шишек и {MainStore.formatShortNumber(Math.max(0, prestige.rebirthRule.knowledge - prestige.unlockRule.knowledge))} знаний.
              </div>
            </>
          ) : (
            <>
              <p className="meta-card__desc">
                После ребёрса текущие ресурсы и уровни сбрасываются, но осколки и общий престиж остаются навсегда.
              </p>
              <div className="meta-card__hint">
                {prestige.canRebirth
                  ? `Сейчас можно получить ${formatNumber(prestige.shards)} оск.`
                  : `До следующего ребёрса осталось ${formatNumber(prestige.nextGoal.shishki)} шишек и ${formatNumber(prestige.nextGoal.knowledge)} знаний за всё время.`}
              </div>
            </>
          )}

          <button
            type="button"
            className="shop-card__btn"
            disabled={!prestige.canRebirth || prestige.shards <= 0}
            onClick={prestigeReset}
          >
            {prestige.isUnlocked
              ? prestige.canRebirth ? 'Переродиться сейчас' : 'Копи ресурсы для ребёрса'
              : 'Сначала открой систему престижа'}
          </button>
        </article>

        <article className="meta-card meta-card--stats">
          <div className="meta-card__kicker">Лайфтайм</div>
          <h3 className="meta-card__title">Глобальный прогресс</h3>
          <div className="meta-lifetime-grid">
            <div><span>Всего шишек</span><b>{MainStore.formatShortNumber(state.lifetimeShishkiEarned)}</b></div>
            <div><span>Всего денег</span><b>{MainStore.formatShortNumber(state.lifetimeMoneyEarned)}</b></div>
            <div><span>Всего знаний</span><b>{MainStore.formatShortNumber(state.lifetimeKnowledgeEarned)}</b></div>
            <div><span>Мега-кликов</span><b>{MainStore.formatShortNumber(state.megaClicks)}</b></div>
            <div><span>Эмодзи-взрывов</span><b>{MainStore.formatShortNumber(state.emojiBursts)}</b></div>
            <div><span>Достижений</span><b>{unlockedCount}/{achievements.length}</b></div>
          </div>

          <div className="meta-card__hint">
            Добавлено {achievements.length} достижений — теперь мета-прогресс растёт заметно дольше и разнообразнее.
          </div>

          <button type="button" className="reset-btn" onClick={handleFullReset}>
            Стереть весь прогресс
          </button>
        </article>
      </div>

      <div className="achievement-grid">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </section>
  )
}
