import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { Coin, Gem, Lightning, PxlKitIcon, Scroll, Trophy, Community } from '../../lib/pxlkit'
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

const ACHIEVEMENT_THEME_BY_CATEGORY = {
  Кликер: { tone: 'amber', icon: Lightning },
  Прогресс: { tone: 'emerald', icon: Trophy },
  Экономика: { tone: 'cyan', icon: Coin },
  Исследование: { tone: 'violet', icon: Scroll },
  Мета: { tone: 'fuchsia', icon: Gem },
  Секреты: { tone: 'rose', icon: Community },
}

const pxl = (icon, label, size = 16) => (
  <PxlKitIcon
    icon={icon}
    size={size}
    colorful
    className="pixel-inline-icon"
    aria-label={label}
  />
)

const knowledgeLabel = <>{pxl(Scroll, 'знания')} Знания</>
const achievementsLabel = <>{pxl(Trophy, 'достижения')} Достижения</>

function getAchievementTheme(category, secret = false) {
  if (secret) {
    return ACHIEVEMENT_THEME_BY_CATEGORY.Секреты
  }

  return ACHIEVEMENT_THEME_BY_CATEGORY[category] ?? { tone: 'slate', icon: Trophy }
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
    { iconKey: 'rebirth', label: 'Реберсов', value: formatNumber(uiState.rebirths), hint: 'завершенных циклов' },
    { iconKey: 'shards', label: 'Осколков', value: formatNumber(uiState.prestigeShards), hint: 'на руках сейчас' },
    { icon: pxl(Lightning, 'общий буст', 18), label: 'Общий буст', value: `x${formatNumber(uiState.prestigeMultiplier)}`, hint: 'постоянный множитель' },
  ]

  const forecastStats = [
    { iconKey: 'reward', label: 'Прогноз', value: formatNumber(uiPrestige.projectedShards), hint: 'осколков за реберс' },
    { icon: pxl(Trophy, 'квота', 18), label: 'Квота', value: formatNumber(uiPrestige.quotaScore), hint: 'текущая оценка цикла' },
    { icon: <ConeIcon />, label: 'След. квота', value: <>{formatNumber(uiPrestige.nextQuota.shishki)} <ConeIcon /></>, hint: 'по шишкам' },
    { iconKey: 'knowledge', label: 'След. знания', value: <>{formatNumber(uiPrestige.nextQuota.knowledge)} {pxl(Scroll, 'знания')}</>, hint: 'по знаниям' },
  ]

  const lifetimeStats = [
    { icon: <ConeIcon />, label: 'Шишки', value: formatNumber(uiState.lifetimeShishkiEarned), hint: 'за все время' },
    { iconKey: 'money', label: 'Деньги', value: formatNumber(uiState.lifetimeMoneyEarned), hint: 'заработано всего' },
    { iconKey: 'knowledge', label: 'Знания', value: formatNumber(uiState.lifetimeKnowledgeEarned), hint: 'заработано всего' },
    { iconKey: 'mega', label: 'Мега-клики', value: formatNumber(uiState.megaClicks), hint: 'ручные усиления' },
    { icon: pxl(Community, 'взрывы', 18), label: 'Взрывы', value: formatNumber(uiState.emojiBursts), hint: 'эмодзи-эффектов' },
    { iconKey: 'prize', label: 'Достижения', value: `${unlockedCount}/${uiAchievements.length}`, hint: 'открыто навсегда' },
  ]

  const prestigeLabSummary = [
    { iconKey: 'shards', label: 'На руках', value: `${formatNumber(uiState.prestigeShards)} шт.`, hint: 'свободный баланс' },
    { icon: pxl(Gem, 'заработано', 18), label: 'Заработано', value: `${formatNumber(uiState.totalPrestigeShardsEarned)} шт.`, hint: 'за все циклы' },
    { icon: <ConeIcon />, label: 'Квота шишек', value: `-${formatNumber(uiPrestige.bonuses.shishkiQuotaReduction * 100)}%`, hint: 'снижение требования' },
    { iconKey: 'knowledge', label: 'Квота знаний', value: `-${formatNumber(uiPrestige.bonuses.knowledgeQuotaReduction * 100)}%`, hint: 'снижение требования' },
    { iconKey: 'prize', label: 'Достижения', value: `-${formatNumber(uiPrestige.bonuses.achievementQuotaReduction)}`, hint: 'срез по квоте' },
    { icon: pxl(Lightning, 'бонус', 18), label: 'Бонус', value: `+x${formatNumber(uiPrestige.bonuses.permanentMultiplierBonus)}`, hint: 'к постоянному престижу' },
  ]

  return (
    <section className="screen meta-screen">
      <div className="screen__header">
        <span className="screen__kicker">Мета</span>
        <h2 className="screen__title">Престиж, квоты и осколки</h2>
        <p className="screen__desc">
          Метаслой собран как стратегическая панель: наверху ключевая ситуация по циклу,
          ниже управление реберсом и постоянными улучшениями.
        </p>
      </div>

      <div className="meta-dashboard">
        <div className="meta-dashboard__main">
          <article className="meta-card">
            <div className="meta-card__kicker">Престиж</div>
            <section className="stats-bar stats-bar--shop meta-stats">
              {prestigeStats.map((item) => (
                <StatCard key={item.label} {...item} formatValue={false} variant="pixel" />
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
                text="После каждого реберса нужно заново закрыть отдельную квоту текущего забега."
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
                  <ProgressRow label={<>{knowledgeLabel} лайфтайм</>} current={uiPrestige.unlockProgress.knowledge} goal={uiPrestige.unlockRule.knowledge} alt />
                  <ProgressRow label={achievementsLabel} current={uiPrestige.unlockProgress.achievements} goal={uiPrestige.unlockRule.achievements} />
                </div>

                <div className="meta-card__hint">
                  Сначала открой систему престижа. После этого появится отдельная квота забега
                  и прогноз по осколкам.
                </div>
              </>
            ) : (
              <>
                <div className="unlock-progress">
                  <ProgressRow label={<><ConeIcon /> Квота шишек в этом цикле</>} current={uiPrestige.cycleProgress.shishki} goal={uiPrestige.rebirthRule.shishki} />
                  <ProgressRow label={<>{knowledgeLabel} в этом цикле</>} current={uiPrestige.cycleProgress.knowledge} goal={uiPrestige.rebirthRule.knowledge} alt />
                  <ProgressRow label={achievementsLabel} current={uiPrestige.cycleProgress.achievements} goal={uiPrestige.rebirthRule.achievements} />
                </div>

                <section className="stats-bar stats-bar--shop prestige-forecast-grid">
                  {forecastStats.map((item) => (
                    <StatCard key={item.label} {...item} formatValue={false} variant="pixel" />
                  ))}
                </section>

                <div className="meta-card__hint">
                  {uiPrestige.canRebirth
                    ? `Квота закрыта. Сейчас реберс даст ${formatNumber(uiPrestige.shards)} оск. Все, что выше квоты, повышает награду, но медленно.`
                    : `До реберса осталось ${formatNumber(uiPrestige.nextGoal.shishki)} шишек, ${formatNumber(uiPrestige.nextGoal.knowledge)} знаний и ${formatNumber(uiPrestige.nextGoal.achievements)} достижений.`}
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
