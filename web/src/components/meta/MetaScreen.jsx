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

export function MetaScreen() {
  const { state, achievements, prestige, prestigeReset } = useGameContext()
  const unlockedCount = achievements.filter((entry) => entry.unlocked).length

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
          <p className="meta-card__desc">
            После ребёрса текущие ресурсы и уровни сбрасываются, но осколки и общий престиж остаются навсегда.
          </p>
          <div className="meta-card__hint">
            {prestige.canRebirth
              ? `Сейчас можно получить ${MainStore.formatShortNumber(prestige.shards)} оск.`
              : `До первого ребёрса осталось ${MainStore.formatShortNumber(prestige.nextGoal)} шишек за всё время.`}
          </div>
          <button
            type="button"
            className="shop-card__btn"
            disabled={!prestige.canRebirth || prestige.shards <= 0}
            onClick={prestigeReset}
          >
            {prestige.canRebirth ? 'Переродиться сейчас' : 'Престиж пока недоступен'}
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
