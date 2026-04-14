import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format'
import { ProgressLoopCard } from '../clicker/ProgressLoopCard.jsx'
import { PrestigeStep } from './PrestigeStep.jsx'
import { ProgressRow } from './ProgressRow.jsx'
import { AchievementsGrid } from './AchievementsGrid.jsx'
import { ShardsLaboratory } from './ShardsLaboratory.jsx'
import { LifetimeCard } from './LifetimeCard.jsx'
import { StatCard } from '../stats/StatCard.jsx'
import { ConeIcon } from '../ui/ConeIcon'
import { KnowledgeIcon, MoneyIcon, PrizeIcon } from '../ui/GameIcon'

const ACHIEVEMENT_THEME_BY_CATEGORY = {
  Кликер: { tone: 'amber', icon: '⚡' },
  Прогресс: { tone: 'emerald', icon: '🌲' },
  Экономика: { tone: 'cyan', icon: '💸' },
  Исследование: { tone: 'violet', icon: '🧠' },
  Метa: { tone: 'fuchsia', icon: '💎' },
  Мета: { tone: 'fuchsia', icon: '💎' },
  Секреты: { tone: 'rose', icon: '🜂' },
}

function getAchievementTheme(category, secret = false) {
  if (secret) {
    return ACHIEVEMENT_THEME_BY_CATEGORY.Секреты
  }

  return ACHIEVEMENT_THEME_BY_CATEGORY[category] ?? { tone: 'slate', icon: '✦' }
}

function toRoman(value) {
  const numerals = [
    ['X', 10],
    ['IX', 9],
    ['V', 5],
    ['IV', 4],
    ['I', 1],
  ]

  let number = Math.max(0, Number(value) || 0)
  if (number <= 0) return '0'

  let result = ''
  numerals.forEach(([symbol, amount]) => {
    while (number >= amount) {
      result += symbol
      number -= amount
    }
  })
  return result
}

function buildAchievementGroup(items) {
  const sortedItems = [...items].sort((a, b) => a.level - b.level)
  const currentLevel = sortedItems.reduce((level, item) => (item.unlocked ? item.level : level), 0)
  const nextItem = sortedItems.find((item) => !item.unlocked) ?? null
  const lastItem = sortedItems[sortedItems.length - 1]
  const nextLevel = nextItem?.level ?? null
  const progressValue = Number(sortedItems[0]?.progressValue ?? 0)
  const progressTarget = nextItem?.target ?? lastItem?.target ?? 0
  const theme = getAchievementTheme(sortedItems[0].category, sortedItems[0].secret)

  return {
    id: `group-${sortedItems[0].groupKey}`,
    kind: 'group',
    title: sortedItems[0].groupTitle,
    category: sortedItems[0].category,
    secret: Boolean(sortedItems[0].secret),
    unlocked: currentLevel > 0,
    currentLevel,
    maxLevel: sortedItems.length,
    levelLabel: currentLevel > 0 ? toRoman(currentLevel) : '0',
    nextLevelLabel: nextLevel ? toRoman(nextLevel) : null,
    nextDescription: nextItem?.description ?? lastItem?.description ?? '',
    progressValue,
    nextTarget: progressTarget,
    progressText: `${formatNumber(progressValue)} / ${formatNumber(progressTarget)}`,
    theme,
  }
}

function getAchievementSortWeight(item) {
  if (item.kind === 'group') {
    if (item.currentLevel > 0 && item.currentLevel < item.maxLevel) return 0
    if (item.currentLevel === 0) return 1
    return 2
  }

  if (item.unlocked) return 3
  if (item.secret) return 5
  return 4
}

export const MetaScreen = observer(function MetaScreen() {
  const {
    uiState,
    uiEconomy,
    uiAchievements,
    uiPrestige,
    prestigeReset,
    buyPrestigeUpgrade,
  } = useGameStore()
  const unlockedCount = uiAchievements.filter((entry) => entry.unlocked).length

  const grouped = useMemo(() => {
    const groups = uiAchievements.reduce((acc, achievement) => {
      const key = achievement.category ?? 'Разное'
      if (!acc[key]) {
        acc[key] = {
          rawUnlocked: 0,
          rawTotal: 0,
          milestoneGroups: new Map(),
          singles: [],
        }
      }

      acc[key].rawTotal += 1
      if (achievement.unlocked) {
        acc[key].rawUnlocked += 1
      }

      if (achievement.achievementType === 'milestone' && achievement.groupKey) {
        const bucket = acc[key].milestoneGroups.get(achievement.groupKey) ?? []
        bucket.push(achievement)
        acc[key].milestoneGroups.set(achievement.groupKey, bucket)
        return acc
      }

      acc[key].singles.push({
        ...achievement,
        kind: 'single',
        theme: getAchievementTheme(achievement.category, achievement.secret),
      })
      return acc
    }, {})

    return Object.entries(groups).map(([category, data]) => {
      const milestoneItems = Array.from(data.milestoneGroups.values()).map(buildAchievementGroup)
      const items = [...milestoneItems, ...data.singles].sort((a, b) => {
        const weightDelta = getAchievementSortWeight(a) - getAchievementSortWeight(b)
        if (weightDelta !== 0) return weightDelta
        return (a.tier ?? a.currentLevel ?? 0) - (b.tier ?? b.currentLevel ?? 0)
      })

      return {
        category,
        unlocked: data.rawUnlocked,
        total: data.rawTotal,
        items,
      }
    })
  }, [uiAchievements])

  const prestigeStats = [
    { icon: '♻️', label: 'Ребёрсов', value: formatNumber(uiState.rebirths), hint: 'завершённых циклов' },
    { icon: '💎', label: 'Осколков', value: formatNumber(uiState.prestigeShards), hint: 'на руках сейчас' },
    { icon: '📈', label: 'Общий буст', value: `x${formatNumber(uiState.prestigeMultiplier)}`, hint: 'постоянный множитель' },
  ]

  const forecastStats = [
    { icon: '🔮', label: 'Прогноз', value: formatNumber(uiPrestige.projectedShards), hint: 'осколков за ребёрс' },
    { icon: '📊', label: 'Квота', value: formatNumber(uiPrestige.quotaScore), hint: 'текущая оценка цикла' },
    { icon: <ConeIcon />, label: 'След. квота', value: <>{formatNumber(uiPrestige.nextQuota.shishki)} <ConeIcon /></>, hint: 'по шишкам' },
    { icon: <KnowledgeIcon />, label: 'След. знания', value: <>{formatNumber(uiPrestige.nextQuota.knowledge)} <KnowledgeIcon /></>, hint: 'по знаниям' },
  ]

  const lifetimeStats = [
    { icon: <ConeIcon />, label: 'Шишки', value: formatNumber(uiState.lifetimeShishkiEarned), hint: 'за всё время' },
    { icon: <MoneyIcon />, label: 'Деньги', value: formatNumber(uiState.lifetimeMoneyEarned), hint: 'заработано всего' },
    { icon: <KnowledgeIcon />, label: 'Знания', value: formatNumber(uiState.lifetimeKnowledgeEarned), hint: 'заработано всего' },
    { icon: '⚡', label: 'Мега-клики', value: formatNumber(uiState.megaClicks), hint: 'ручные усиления' },
    { icon: '🎉', label: 'Взрывы', value: formatNumber(uiState.emojiBursts), hint: 'эмодзи-эффектов' },
    { icon: <PrizeIcon />, label: 'Достижения', value: `${unlockedCount}/${uiAchievements.length}`, hint: 'открыто навсегда' },
  ]

  const prestigeLabSummary = [
    { icon: '💎', label: 'На руках', value: `${formatNumber(uiState.prestigeShards)} 💎`, hint: 'свободный баланс' },
    { icon: '🏦', label: 'Заработано', value: `${formatNumber(uiState.totalPrestigeShardsEarned)} 💎`, hint: 'за все циклы' },
    { icon: <ConeIcon />, label: 'Квота шишек', value: `-${formatNumber(uiPrestige.bonuses.shishkiQuotaReduction * 100)}%`, hint: 'снижение требования' },
    { icon: <KnowledgeIcon />, label: 'Квота знаний', value: `-${formatNumber(uiPrestige.bonuses.knowledgeQuotaReduction * 100)}%`, hint: 'снижение требования' },
    { icon: <PrizeIcon />, label: 'Достижения', value: `-${formatNumber(uiPrestige.bonuses.achievementQuotaReduction)}`, hint: 'срез по квоте' },
    { icon: '🚀', label: 'Бонус', value: `+x${formatNumber(uiPrestige.bonuses.permanentMultiplierBonus)}`, hint: 'к постоянному престижу' },
  ]

  return (
    <section className="screen meta-screen">
      <div className="screen__header">
        <span className="screen__kicker">Мета</span>
        <h2 className="screen__title">Престиж, квоты и осколки</h2>
        <p className="screen__desc">
          Метаслой перестроен как стратегическая панель: наверху ключевая ситуация по циклу,
          ниже управление ребёрсом и постоянными улучшениями.
        </p>
      </div>

      <div className="meta-dashboard">
        <div className="meta-dashboard__main">
          <article className="meta-card">
            <div className="meta-card__kicker">Престиж</div>
            <section className="stats-bar stats-bar--shop meta-stats">
              {prestigeStats.map((item) => (
                <StatCard key={item.label} {...item} formatValue={false} />
              ))}
            </section>

            <div className="prestige-steps">
              <PrestigeStep
                index="1"
                title="Открытие"
                text="Один раз добей лайфтайм-порог по шишкам, знаниям и достижениям."
                active={!uiPrestige.isUnlocked}
              />
              <PrestigeStep
                index="2"
                title={`Квота цикла #${uiPrestige.rebirthRule.cycle}`}
                text="После каждого ребёрса нужно заново закрыть отдельную квоту текущего забега."
                active={uiPrestige.isUnlocked && !uiPrestige.canRebirth}
              />
              <PrestigeStep
                index="3"
                title="Осколки и мета"
                text="Осколков теперь меньше: базово 1 за квоту, больше только за сильный перелив сверх требований."
                active={uiPrestige.canRebirth}
              />
            </div>

            {!uiPrestige.isUnlocked ? (
              <>
                <div className="unlock-progress">
                  <ProgressRow label={<><ConeIcon /> Лайфтайм шишки</>} current={uiPrestige.unlockProgress.shishki} goal={uiPrestige.unlockRule.shishki} />
                  <ProgressRow label={<><KnowledgeIcon /> Лайфтайм знания</>} current={uiPrestige.unlockProgress.knowledge} goal={uiPrestige.unlockRule.knowledge} alt />
                  <ProgressRow label={<><PrizeIcon /> Достижения</>} current={uiPrestige.unlockProgress.achievements} goal={uiPrestige.unlockRule.achievements} />
                </div>

                <div className="meta-card__hint">
                  Сначала открой систему престижа. После этого появится отдельная квота забега и прогноз по осколкам.
                </div>
              </>
            ) : (
              <>
                <div className="unlock-progress">
                  <ProgressRow label={<><ConeIcon /> Квота шишек в этом цикле</>} current={uiPrestige.cycleProgress.shishki} goal={uiPrestige.rebirthRule.shishki} />
                  <ProgressRow label={<><KnowledgeIcon /> Квота знаний в этом цикле</>} current={uiPrestige.cycleProgress.knowledge} goal={uiPrestige.rebirthRule.knowledge} alt />
                  <ProgressRow label={<><PrizeIcon /> Квота достижений</>} current={uiPrestige.cycleProgress.achievements} goal={uiPrestige.rebirthRule.achievements} />
                </div>

                <section className="stats-bar stats-bar--shop prestige-forecast-grid">
                  {forecastStats.map((item) => (
                    <StatCard key={item.label} {...item} formatValue={false} />
                  ))}
                </section>

                <div className="meta-card__hint">
                  {uiPrestige.canRebirth
                    ? `Квота закрыта. Сейчас ребёрс даст ${formatNumber(uiPrestige.shards)} оск. Всё, что выше квоты, повышает награду, но медленно.`
                    : `До ребёрса осталось ${formatNumber(uiPrestige.nextGoal.shishki)} шишек, ${formatNumber(uiPrestige.nextGoal.knowledge)} знаний и ${formatNumber(uiPrestige.nextGoal.achievements)} достижений.`}
                </div>
              </>
            )}

            <button
              type="button"
              className="shop-card__btn"
              disabled={!uiPrestige.canRebirth || uiPrestige.shards <= 0}
              onClick={prestigeReset}
            >
              {uiPrestige.isUnlocked
                ? uiPrestige.canRebirth ? 'Переродиться и забрать осколки' : 'Сначала закрой квоту цикла'
                : 'Сначала открой систему престижа'}
            </button>
          </article>
        </div>

        <aside className="meta-dashboard__side">
          <ProgressLoopCard />
          <LifetimeCard lifetimeStats={lifetimeStats} />
        </aside>
      </div>

      <ShardsLaboratory
        buyPrestigeUpgrade={buyPrestigeUpgrade}
        economy={uiEconomy}
        state={uiState}
        prestigeLabSummary={prestigeLabSummary}
      />

      <div className="meta-section-head">
        <div>
          <span className="meta-section-head__kicker">Достижения</span>
        </div>
        <div className="meta-section-head__meta">Открыто {unlockedCount} из {uiAchievements.length}</div>
      </div>

      <AchievementsGrid grouped={grouped} />
    </section>
  )
})
