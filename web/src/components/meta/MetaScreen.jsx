import { useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'
import { ProgressLoopCard } from '../clicker/ProgressLoopCard.jsx'
import {PrestigeStep} from "./PrestigeStep.jsx"
import {ProgressRow} from "./ProgressRow.jsx"
import {AchievementsGrid} from "./AchievementsGrid.jsx"
import {ShardsLaboratory} from "./ShardsLaboratory.jsx"
import {LifetimeCard} from "./LifetimeCard.jsx"


export function MetaScreen() {
  const { state, economy, achievements, prestige, prestigeReset, buyPrestigeUpgrade, resetGame } = useGameContext()
  const unlockedCount = achievements.filter((entry) => entry.unlocked).length

  const grouped = useMemo(() => {
    const groups = achievements.reduce((acc, achievement) => {
      const key = achievement.category ?? 'Разное'
      if (!acc[key]) acc[key] = []
      acc[key].push(achievement)
      return acc
    }, {})

    return Object.entries(groups).map(([category, items]) => ({
      category,
      unlocked: items.filter((entry) => entry.unlocked).length,
      total: items.length,
      items: items.sort((a, b) => Number(a.secret) - Number(b.secret) || a.tier - b.tier),
    }))
  }, [achievements])

  const heroStats = [
    {
      label: 'Ребёрсы',
      value: formatNumber(state.rebirths),
      hint: 'завершённых циклов',
    },
    {
      label: 'Осколки',
      value: `${formatNumber(state.prestigeShards)} 💎`,
      hint: 'доступно сейчас',
    },
    {
      label: 'Множитель',
      value: `x${formatNumber(state.prestigeMultiplier)}`,
      hint: 'постоянный буст',
    },
    {
      label: 'Достижения',
      value: `${unlockedCount}/${achievements.length}`,
      hint: prestige.canRebirth ? 'квота готова' : 'в прогрессе',
    },
  ]

  return (
    <section className="screen meta-screen">
      <div className="screen__glow" />

      <div className="screen__header">
        <span className="screen__kicker">Мета</span>
        <h2 className="screen__title">Престиж, квоты и осколки</h2>
        <p className="screen__desc">
          Метаслой перестроен как стратегическая панель: наверху — ключевая ситуация по циклу, ниже — управление ребёрсом и постоянными улучшениями.
        </p>
      </div>

      <div className="meta-dashboard">
        <div className="meta-dashboard__main">
          <article className="meta-card prestige-card">
            <div className="meta-card__kicker">Престиж</div>
            <h3 className="meta-card__title">Система перерождения</h3>
            <div className="meta-stats">
              <div><b>{formatNumber(state.rebirths)}</b><span>ребёрсов</span></div>
              <div><b>{formatNumber(state.prestigeShards)}</b><span>осколков на руках</span></div>
              <div><b>x{formatNumber(state.prestigeMultiplier)}</b><span>общий буст</span></div>
            </div>

            <div className="prestige-steps">
              <PrestigeStep index="1" title="Открытие" text="Один раз добей лайфтайм-порог по шишкам, знаниям и достижениям." active={!prestige.isUnlocked} />
              <PrestigeStep index="2" title={`Квота цикла #${prestige.rebirthRule.cycle}`} text="После каждого ребёрса нужно заново закрыть отдельную квоту текущего забега." active={prestige.isUnlocked && !prestige.canRebirth} />
              <PrestigeStep index="3" title="Осколки и мета" text="Осколков теперь меньше: базово 1 за квоту, больше только за сильный перелив сверх требований." active={prestige.canRebirth} />
            </div>

            {!prestige.isUnlocked ? (
              <>
                <div className="unlock-progress">
                  <ProgressRow label="🌰 Лайфтайм шишки" current={prestige.unlockProgress.shishki} goal={prestige.unlockRule.shishki} />
                  <ProgressRow label="📚 Лайфтайм знания" current={prestige.unlockProgress.knowledge} goal={prestige.unlockRule.knowledge} alt />
                  <ProgressRow label="🏆 Достижения" current={prestige.unlockProgress.achievements} goal={prestige.unlockRule.achievements} />
                </div>

                <div className="meta-card__hint">
                  Сначала открой систему престижа. После этого появится отдельная квота забега и прогноз по осколкам.
                </div>
              </>
            ) : (
              <>
                <div className="unlock-progress">
                  <ProgressRow label="🌰 Квота шишек в этом цикле" current={prestige.cycleProgress.shishki} goal={prestige.rebirthRule.shishki} />
                  <ProgressRow label="📚 Квота знаний в этом цикле" current={prestige.cycleProgress.knowledge} goal={prestige.rebirthRule.knowledge} alt />
                  <ProgressRow label="🏆 Квота достижений" current={prestige.cycleProgress.achievements} goal={prestige.rebirthRule.achievements} />
                </div>

                <div className="prestige-forecast-grid">
                  <div>
                    <span>Прогноз осколков</span>
                    <b>{formatNumber(prestige.projectedShards)}</b>
                  </div>
                  <div>
                    <span>Оценка квоты</span>
                    <b>{formatNumber(prestige.quotaScore)}</b>
                  </div>
                  <div>
                    <span>Следующая квота</span>
                    <b>{formatNumber(prestige.nextQuota.shishki)} 🌰</b>
                  </div>
                  <div>
                    <span>След. знания</span>
                    <b>{formatNumber(prestige.nextQuota.knowledge)} 📚</b>
                  </div>
                </div>

                <div className="meta-card__hint">
                  {prestige.canRebirth
                    ? `Квота закрыта. Сейчас ребёрс даст ${formatNumber(prestige.shards)} оск. Всё, что выше квоты, повышает награду, но медленно.`
                    : `До ребёрса осталось ${formatNumber(prestige.nextGoal.shishki)} шишек, ${formatNumber(prestige.nextGoal.knowledge)} знаний и ${formatNumber(prestige.nextGoal.achievements)} достижений.`}
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
                ? prestige.canRebirth ? 'Переродиться и забрать осколки' : 'Сначала закрой квоту цикла'
                : 'Сначала открой систему престижа'}
            </button>
          </article>
        </div>

        <aside className="meta-dashboard__side">
          <ProgressLoopCard />
          <LifetimeCard
            state={state}
            unlockedCount={unlockedCount}
            achievements={achievements}
          />
        </aside>
      </div>

      <ShardsLaboratory
        buyPrestigeUpgrade={buyPrestigeUpgrade}
        economy={economy}
        state={state}
        prestige={prestige}
      />

      <div className="meta-section-head">
        <div>
          <span className="meta-section-head__kicker">Коллекция прогресса</span>
          <h3 className="meta-section-head__title">Достижения по категориям</h3>
        </div>
        <div className="meta-section-head__meta">Открыто {unlockedCount} из {achievements.length}</div>
      </div>

      <AchievementsGrid
        grouped={grouped}
      />
    </section>
  )
}
