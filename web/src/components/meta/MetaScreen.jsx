import { useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'
import { ProgressLoopCard } from '../clicker/ProgressLoopCard.jsx'
import {PrestigeStep} from "./PrestigeStep.jsx"
import {ProgressRow} from "./ProgressRow.jsx"
import {AchievementsGrid} from "./AchievementsGrid.jsx"
import {ShardsLaboratory} from "./ShardsLaboratory.jsx"
import {LifetimeCard} from "./LifetimeCard.jsx"
import {StatCard} from "../stats/StatCard.jsx"
import { ConeIcon } from '../ui/ConeIcon'
import { KnowledgeIcon, MoneyIcon, PrizeIcon } from '../ui/GameIcon'


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

  const prestigeStats = [
    { icon: '♻️', label: 'Ребёрсов', value: formatNumber(state.rebirths), hint: 'завершённых циклов' },
    { icon: '💎', label: 'Осколков', value: formatNumber(state.prestigeShards), hint: 'на руках сейчас' },
    { icon: '📈', label: 'Общий буст', value: `x${formatNumber(state.prestigeMultiplier)}`, hint: 'постоянный множитель' },
  ]

  const forecastStats = [
    { icon: '🔮', label: 'Прогноз', value: formatNumber(prestige.projectedShards), hint: 'осколков за ребёрс' },
    { icon: '📊', label: 'Квота', value: formatNumber(prestige.quotaScore), hint: 'текущая оценка цикла' },
    { icon: <ConeIcon />, label: 'След. квота', value: <>{formatNumber(prestige.nextQuota.shishki)} <ConeIcon /></>, hint: 'по шишкам' },
    { icon: <KnowledgeIcon />, label: 'След. знания', value: <>{formatNumber(prestige.nextQuota.knowledge)} <KnowledgeIcon /></>, hint: 'по знаниям' },
  ]

  const lifetimeStats = [
    { icon: <ConeIcon />, label: 'Шишки', value: formatNumber(state.lifetimeShishkiEarned), hint: 'за всё время' },
    { icon: <MoneyIcon />, label: 'Деньги', value: formatNumber(state.lifetimeMoneyEarned), hint: 'заработано всего' },
    { icon: <KnowledgeIcon />, label: 'Знания', value: formatNumber(state.lifetimeKnowledgeEarned), hint: 'заработано всего' },
    { icon: '⚡', label: 'Мега-клики', value: formatNumber(state.megaClicks), hint: 'ручные усиления' },
    { icon: '🎉', label: 'Взрывы', value: formatNumber(state.emojiBursts), hint: 'эмодзи-эффектов' },
    { icon: <PrizeIcon />, label: 'Достижения', value: `${unlockedCount}/${achievements.length}`, hint: 'открыто навсегда' },
  ]

  const prestigeLabSummary = [
    { icon: '💎', label: 'На руках', value: `${formatNumber(state.prestigeShards)} 💎`, hint: 'свободный баланс' },
    { icon: '🏦', label: 'Заработано', value: `${formatNumber(state.totalPrestigeShardsEarned)} 💎`, hint: 'за все циклы' },
    { icon: <ConeIcon />, label: 'Квота шишек', value: `-${formatNumber(prestige.bonuses.shishkiQuotaReduction * 100)}%`, hint: 'снижение требования' },
    { icon: <KnowledgeIcon />, label: 'Квота знаний', value: `-${formatNumber(prestige.bonuses.knowledgeQuotaReduction * 100)}%`, hint: 'снижение требования' },
    { icon: <PrizeIcon />, label: 'Достижения', value: `-${formatNumber(prestige.bonuses.achievementQuotaReduction)}`, hint: 'срез по квоте' },
    { icon: '🚀', label: 'Бонус', value: `+x${formatNumber(prestige.bonuses.permanentMultiplierBonus)}`, hint: 'к постоянному престижу' },
  ]

  return (
    <section className="screen meta-screen">
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
            <section className="stats-bar stats-bar--shop meta-stats">
              {prestigeStats.map((item) => (
                <StatCard key={item.label} {...item} formatValue={false} />
              ))}
            </section>

            <div className="prestige-steps">
              <PrestigeStep index="1" title="Открытие" text="Один раз добей лайфтайм-порог по шишкам, знаниям и достижениям." active={!prestige.isUnlocked} />
              <PrestigeStep index="2" title={`Квота цикла #${prestige.rebirthRule.cycle}`} text="После каждого ребёрса нужно заново закрыть отдельную квоту текущего забега." active={prestige.isUnlocked && !prestige.canRebirth} />
              <PrestigeStep index="3" title="Осколки и мета" text="Осколков теперь меньше: базово 1 за квоту, больше только за сильный перелив сверх требований." active={prestige.canRebirth} />
            </div>

            {!prestige.isUnlocked ? (
              <>
                <div className="unlock-progress">
                  <ProgressRow label={<><ConeIcon /> Лайфтайм шишки</>} current={prestige.unlockProgress.shishki} goal={prestige.unlockRule.shishki} />
                  <ProgressRow label={<><KnowledgeIcon /> Лайфтайм знания</>} current={prestige.unlockProgress.knowledge} goal={prestige.unlockRule.knowledge} alt />
                  <ProgressRow label={<><PrizeIcon /> Достижения</>} current={prestige.unlockProgress.achievements} goal={prestige.unlockRule.achievements} />
                </div>

                <div className="meta-card__hint">
                  Сначала открой систему престижа. После этого появится отдельная квота забега и прогноз по осколкам.
                </div>
              </>
            ) : (
              <>
                <div className="unlock-progress">
                  <ProgressRow label={<><ConeIcon /> Квота шишек в этом цикле</>} current={prestige.cycleProgress.shishki} goal={prestige.rebirthRule.shishki} />
                  <ProgressRow label={<><KnowledgeIcon /> Квота знаний в этом цикле</>} current={prestige.cycleProgress.knowledge} goal={prestige.rebirthRule.knowledge} alt />
                  <ProgressRow label={<><PrizeIcon /> Квота достижений</>} current={prestige.cycleProgress.achievements} goal={prestige.rebirthRule.achievements} />
                </div>

                <section className="stats-bar stats-bar--shop prestige-forecast-grid">
                  {forecastStats.map((item) => (
                    <StatCard key={item.label} {...item} formatValue={false} />
                  ))}
                </section>

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
						lifetimeStats={lifetimeStats}
          />
        </aside>
      </div>

      <ShardsLaboratory
        buyPrestigeUpgrade={buyPrestigeUpgrade}
        economy={economy}
        state={state}
				prestigeLabSummary={prestigeLabSummary}
      />

      <div className="meta-section-head">
        <div>
          <span className="meta-section-head__kicker">Достижения</span>
        </div>
        <div className="meta-section-head__meta">Открыто {unlockedCount} из {achievements.length}</div>
      </div>

      <AchievementsGrid
        grouped={grouped}
      />
    </section>
  )
}
