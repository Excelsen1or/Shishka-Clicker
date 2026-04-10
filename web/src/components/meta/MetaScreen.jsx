import { useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'
import { ProgressLoopCard } from '../clicker/ProgressOverview'
import { StatCard } from '../stats/StatCard'

function AchievementCard({ achievement }) {
  return (
    <article className={`meta-card achievement-card ${achievement.unlocked ? 'achievement-card--done' : ''} ${achievement.secret ? 'achievement-card--secret' : ''}`}>
      <div className="achievement-card__head">
        <span>{achievement.category}</span>
        <span>ур. {achievement.tier}</span>
      </div>
      <h3 className="achievement-card__title">
        {achievement.unlocked ? achievement.title : achievement.secret ? '??? Секретное достижение' : achievement.title}
      </h3>
      <p className="achievement-card__desc">
        {achievement.unlocked || !achievement.secret
          ? achievement.description
          : 'Откроется только после выполнения скрытого условия.'}
      </p>
      <div className="achievement-card__status">
        {achievement.unlocked ? '🏆 Открыто' : achievement.secret ? '🕶️ Скрыто' : '🔒 В процессе'}
      </div>
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

function PrestigeStep({ index, title, text, active = false }) {
  return (
    <div className={`prestige-step ${active ? 'prestige-step--active' : ''}`}>
      <div className="prestige-step__index">{index}</div>
      <div>
        <div className="prestige-step__title">{title}</div>
        <div className="prestige-step__text">{text}</div>
      </div>
    </div>
  )
}

function LabCard({ item, canBuy, onBuy }) {
  return (
    <article className={`prestige-lab-card prestige-lab-card--${item.tint ?? 'amber'}`}>
      <div className="prestige-lab-card__head">
        <div>
          <div className="prestige-lab-card__kicker">Метапрокачка</div>
          <h3 className="prestige-lab-card__title">{item.title}</h3>
        </div>
        <div className="prestige-lab-card__level">ур. {item.level}</div>
      </div>

      <p className="prestige-lab-card__desc">{item.description}</p>

      <div className="prestige-lab-card__effect">{item.effectPreview?.currentText}</div>
      <div className="prestige-lab-card__next">{item.effectPreview?.nextText}</div>

      <div className="prestige-lab-card__footer">
        <div className="prestige-lab-card__price">💎 {formatNumber(item.cost)}</div>
        <button type="button" className="shop-card__btn" disabled={!canBuy} onClick={onBuy}>
          {canBuy ? 'Улучшить за осколки' : 'Не хватает осколков'}
        </button>
      </div>
    </article>
  )
}

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
    { icon: '🌰', label: 'След. квота', value: `${formatNumber(prestige.nextQuota.shishki)} 🌰`, hint: 'по шишкам' },
    { icon: '📚', label: 'След. знания', value: `${formatNumber(prestige.nextQuota.knowledge)} 📚`, hint: 'по знаниям' },
  ]

  const lifetimeStats = [
    { icon: '🌰', label: 'Шишки', value: formatNumber(state.lifetimeShishkiEarned), hint: 'за всё время' },
    { icon: '💵', label: 'Деньги', value: formatNumber(state.lifetimeMoneyEarned), hint: 'заработано всего' },
    { icon: '📚', label: 'Знания', value: formatNumber(state.lifetimeKnowledgeEarned), hint: 'заработано всего' },
    { icon: '⚡', label: 'Мега-клики', value: formatNumber(state.megaClicks), hint: 'ручные усиления' },
    { icon: '🎉', label: 'Взрывы', value: formatNumber(state.emojiBursts), hint: 'эмодзи-эффектов' },
    { icon: '🏆', label: 'Достижения', value: `${unlockedCount}/${achievements.length}`, hint: 'открыто навсегда' },
  ]

  const prestigeLabSummary = [
    { icon: '💎', label: 'На руках', value: `${formatNumber(state.prestigeShards)} 💎`, hint: 'свободный баланс' },
    { icon: '🏦', label: 'Заработано', value: `${formatNumber(state.totalPrestigeShardsEarned)} 💎`, hint: 'за все циклы' },
    { icon: '🌰', label: 'Квота шишек', value: `-${formatNumber(prestige.bonuses.shishkiQuotaReduction * 100)}%`, hint: 'снижение требования' },
    { icon: '📚', label: 'Квота знаний', value: `-${formatNumber(prestige.bonuses.knowledgeQuotaReduction * 100)}%`, hint: 'снижение требования' },
    { icon: '🏆', label: 'Достижения', value: `-${formatNumber(prestige.bonuses.achievementQuotaReduction)}`, hint: 'срез по квоте' },
    { icon: '🚀', label: 'Бонус', value: `+x${formatNumber(prestige.bonuses.permanentMultiplierBonus)}`, hint: 'к постоянному престижу' },
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

          <article className="meta-card meta-card--stats">
            <div className="meta-card__kicker">Лайфтайм</div>
            <h3 className="meta-card__title">Глобальный прогресс</h3>
            <section className="stats-bar stats-bar--shop meta-lifetime-grid">
              {lifetimeStats.map((item) => (
                <StatCard key={item.label} {...item} formatValue={false} />
              ))}
            </section>

            <div className="meta-card__hint">
              После ребёрса сбрасываются текущие ресурсы и уровни магазина, но сохраняются достижения, осколки, мета-улучшения и общий множитель престижа.
            </div>

            <button type="button" className="reset-btn" onClick={resetGame}>
              Стереть весь прогресс
            </button>
          </article>
        </aside>
      </div>

      <article className="meta-card prestige-lab">
        <div className="meta-card__kicker">Лаборатория осколков</div>
        <h3 className="meta-card__title">Постоянные улучшения престижа</h3>
        <p className="meta-card__desc">
          Осколки редкие, поэтому здесь нет мусорных покупок: часть веток режет квоту, часть усиливает престиж, а часть повышает награду за перелив сверх квоты.
        </p>

        <section className="stats-bar stats-bar--shop prestige-lab__summary">
          {prestigeLabSummary.map((item) => (
            <StatCard key={item.label} {...item} formatValue={false} />
          ))}
        </section>

        <div className="prestige-lab__grid">
          {economy.prestigeUpgrades.map((item) => (
            <LabCard
              key={item.id}
              item={item}
              canBuy={state.prestigeShards >= item.cost}
              onBuy={() => buyPrestigeUpgrade(item.id)}
            />
          ))}
        </div>
      </article>

      <div className="meta-section-head">
        <div>
          <span className="meta-section-head__kicker">Коллекция прогресса</span>
          <h3 className="meta-section-head__title">Достижения по категориям</h3>
        </div>
        <div className="meta-section-head__meta">Открыто {unlockedCount} из {achievements.length}</div>
      </div>

      <div className="achievement-category-grid">
        {grouped.map((group) => (
          <article key={group.category} className="achievement-category">
            <div className="achievement-category__head">
              <div>
                <div className="achievement-category__kicker">Категория</div>
                <h3 className="achievement-category__title">{group.category}</h3>
              </div>
              <div className="achievement-category__count">{group.unlocked}/{group.total}</div>
            </div>

            <div className="achievement-grid">
              {group.items.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
