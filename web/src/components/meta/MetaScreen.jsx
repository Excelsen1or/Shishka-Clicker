import { useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'
import { ProgressLoopCard } from '../clicker/ProgressOverview'

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

function HeroStat({ label, value, hint }) {
  return (
    <article className="meta-hero-stat">
      <span className="meta-hero-stat__label">{label}</span>
      <strong className="meta-hero-stat__value">{value}</strong>
      <span className="meta-hero-stat__hint">{hint}</span>
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

      <div className="meta-hero">
        <div className="meta-hero__copy">
          <span className="meta-hero__eyebrow">Стратегический слой</span>
          <h3 className="meta-hero__title">Всё важное по престижу читается с первого взгляда</h3>
          <p className="meta-hero__desc">
            Здесь собраны квоты текущего цикла, прогноз награды, постоянные осколочные апгрейды и глобальный прогресс без лишнего визуального шума.
          </p>
        </div>

        <div className="meta-hero__stats">
          {heroStats.map((item) => (
            <HeroStat key={item.label} {...item} />
          ))}
        </div>
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

          <article className="meta-card prestige-lab">
            <div className="meta-card__kicker">Лаборатория осколков</div>
            <h3 className="meta-card__title">Постоянные улучшения престижа</h3>
            <p className="meta-card__desc">
              Осколки редкие, поэтому здесь нет мусорных покупок: часть веток режет квоту, часть усиливает престиж, а часть повышает награду за перелив сверх квоты.
            </p>

            <div className="prestige-lab__summary">
              <div><span>На руках</span><b>{formatNumber(state.prestigeShards)} 💎</b></div>
              <div><span>Суммарно заработано</span><b>{formatNumber(state.totalPrestigeShardsEarned)} 💎</b></div>
              <div><span>Снижение квоты шишек</span><b>-{formatNumber(prestige.bonuses.shishkiQuotaReduction * 100)}%</b></div>
              <div><span>Снижение квоты знаний</span><b>-{formatNumber(prestige.bonuses.knowledgeQuotaReduction * 100)}%</b></div>
              <div><span>Срез достижений</span><b>-{formatNumber(prestige.bonuses.achievementQuotaReduction)}</b></div>
              <div><span>Бонус к престижу</span><b>+x{formatNumber(prestige.bonuses.permanentMultiplierBonus)}</b></div>
            </div>

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
        </div>

        <aside className="meta-dashboard__side">
          <ProgressLoopCard />

          <article className="meta-card meta-card--stats">
            <div className="meta-card__kicker">Лайфтайм</div>
            <h3 className="meta-card__title">Глобальный прогресс</h3>
            <div className="meta-lifetime-grid">
              <div><span>Всего шишек</span><b>{formatNumber(state.lifetimeShishkiEarned)}</b></div>
              <div><span>Всего денег</span><b>{formatNumber(state.lifetimeMoneyEarned)}</b></div>
              <div><span>Всего знаний</span><b>{formatNumber(state.lifetimeKnowledgeEarned)}</b></div>
              <div><span>Мега-кликов</span><b>{formatNumber(state.megaClicks)}</b></div>
              <div><span>Эмодзи-взрывов</span><b>{formatNumber(state.emojiBursts)}</b></div>
              <div><span>Достижений</span><b>{unlockedCount}/{achievements.length}</b></div>
            </div>

            <div className="meta-card__hint">
              После ребёрса сбрасываются текущие ресурсы и уровни магазина, но сохраняются достижения, осколки, мета-улучшения и общий множитель престижа.
            </div>

            <button type="button" className="reset-btn" onClick={resetGame}>
              Стереть весь прогресс
            </button>
          </article>
        </aside>
      </div>

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
