import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useGameContext } from '../../context/GameContext'
import { ShopCard } from './ShopCard'

const SCREEN_META = {
  subscriptions: {
    kicker: 'Магазин',
    title: 'Подписки',
    desc: 'Подписки ускоряют добычу денег и знаний.',
    accent: 'orange',
    emptyText: 'Подписки загружаются…',
    categories: [
      { id: 'starter', title: 'Стартовые ассистенты', desc: 'Ранние сервисы для первого снежного кома и мягкого входа в AI-экономику.' },
      { id: 'production', title: 'Рабочие модели', desc: 'Основной производственный слой середины игры: стабильный доход, наука и поддержка билда.' },
      { id: 'research', title: 'Исследовательские сервисы', desc: 'Сервисы, которые сильнее всего толкают знания и помогают готовить престиж.' },
      { id: 'frontier', title: 'Фронтир-кластеры', desc: 'Дорогие late-game модели для глубокой меты и финального разгона.' },
    ],
  },
  upgrades: {
    kicker: 'Магазин',
    title: 'Апгрейды',
    desc: 'Апгрейды дают бонусы к добыче. Инвестиции открывают новые возможности для прогрессии.',
    accent: 'orange',
    emptyText: 'Апгрейды загружаются…',
    categories: [
      { id: 'manual', title: 'Ручной темп', desc: 'Апгрейды для клика, ранней стабильности и активной игры.' },
      { id: 'industry', title: 'Производство и логистика', desc: 'Контур шишек, денег и инфраструктуры для ровной средней игры.' },
      { id: 'research', title: 'Обучение и исследования', desc: 'Знаниевая ветка, усиливающая AI, науку и стратегические решения.' },
      { id: 'capital', title: 'Рост и капитал', desc: 'Поздние ускорители экономики, престижной подготовки и длинной дистанции.' },
    ],
  },
}

const ITEM_CATEGORIES = {
  subscriptions: {
    gigachat: 'starter',
    yandex_alisa: 'starter',
    gpt: 'production',
    claude: 'production',
    copilot: 'production',
    perplexity: 'research',
    gemini: 'research',
    deepseek: 'frontier',
    mistral: 'frontier',
  },
  upgrades: {
    textbooks: 'manual',
    coffee: 'manual',
    autoClicker: 'manual',
    focusMode: 'manual',
    internship: 'industry',
    pickupPointShift: 'industry',
    courierRush: 'industry',
    coneSorting: 'industry',
    resinWorkshop: 'industry',
    logisticsHub: 'industry',
    serverRack: 'industry',
    campusExchange: 'industry',
    studyGroup: 'research',
    promptEngineering: 'research',
    researchLab: 'research',
    grantProgram: 'research',
    memeMarketing: 'capital',
    brandStudio: 'capital',
    franchiseNetwork: 'capital',
    ventureFund: 'capital',
    quantFund: 'capital',
  },
}

function groupItemsByCategory(items, type, categories) {
  const categoryByItem = ITEM_CATEGORIES[type] ?? {}

  return categories
    .map((category) => ({
      ...category,
      items: items.filter((item) => (categoryByItem[item.id] ?? 'misc') === category.id),
    }))
    .filter((category) => category.items.length > 0)
}

function renderCategorySections({ groupedItems, onBuy, onInspect, delayOffset = 0 }) {
  let currentOffset = delayOffset

  return groupedItems.map((category) => {
    const content = (
      <section key={category.id} className="shop-category">
        <div className="shop-category__head">
          <h4 className="shop-category__title">{category.title}</h4>
          <p className="shop-category__desc">{category.desc}</p>
        </div>

        <div className="shop-grid shop-grid--category">
          {category.items.map((item, index) => (
            <ShopCard
              key={item.id}
              itemId={item.id}
              item={item}
              canBuy={item.canBuy}
              balance={item.balance}
              onBuy={onBuy}
              onInspect={onInspect}
              delay={currentOffset + index}
            />
          ))}
        </div>
      </section>
    )

    currentOffset += category.items.length
    return content
  })
}

export const ShopScreen = observer(function ShopScreen({ type }) {
  const { economy, buySubscription, buyUpgrade, markShopItemSeen, markShopItemsSeen } = useGameContext()
  const meta = SCREEN_META[type]
  const hasItemCategories = type === 'upgrades'

  const items = type === 'subscriptions' ? economy.subscriptions : economy.upgrades
  const onBuy = type === 'subscriptions' ? buySubscription : buyUpgrade
  const unlockedItems = items.filter((item) => item.unlocked)
  const lockedItems = items.filter((item) => !item.unlocked)
  const unlockedByCategory = hasItemCategories ? groupItemsByCategory(unlockedItems, type, meta.categories) : []
  const lockedByCategory = hasItemCategories ? groupItemsByCategory(lockedItems, type, meta.categories) : []

  useEffect(() => {
    const idsToMark = items
      .filter((item) => item.isNew || item.isBuyableNew)
      .map((item) => item.id)

    if (idsToMark.length) {
      markShopItemsSeen(idsToMark)
    }
  }, [items, markShopItemsSeen])

  return (
    <section className={`screen shop-screen--${meta.accent}`}>
      <div className="screen__header">
        <span className="screen__kicker">{meta.kicker}</span>
        <h2 className="screen__title">{meta.title}</h2>
        <p className="screen__desc">{meta.desc}</p>
      </div>

      {items.length === 0 && <div className="shop-empty">{meta.emptyText}</div>}

      {unlockedItems.length > 0 && (
        <section className="shop-group shop-group--active">
          {lockedItems.length > 0 && (
            <div className="shop-group__head">
              <span className="shop-group__eyebrow">Доступно сейчас</span>
              <h3 className="shop-group__title">Разблокированные</h3>
              <p className="shop-group__desc">Выбирай с умом, выстраивай свою стратегию и просчитывай следующий шаг.</p>
            </div>
          )}

          {hasItemCategories ? (
            <div className="shop-categories">
              {renderCategorySections({
                groupedItems: unlockedByCategory,
                onBuy,
                onInspect: markShopItemSeen,
                delayOffset: 0,
              })}
            </div>
          ) : (
            <div className="shop-grid">
              {unlockedItems.map((item, index) => (
                <ShopCard
                  key={item.id}
                  itemId={item.id}
                  item={item}
                  canBuy={item.canBuy}
                  balance={item.balance}
                  onBuy={onBuy}
                  onInspect={markShopItemSeen}
                  delay={index}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {lockedItems.length > 0 && (
        <section className="shop-group shop-group--locked">
          <div className="shop-group__head">
            <span className="shop-group__eyebrow">Следующие цели</span>
            <h3 className="shop-group__title">Заблокированные</h3>
            <p className="shop-group__desc">Эти товары откроются по мере твоего прогресса.</p>
          </div>

          {hasItemCategories ? (
            <div className="shop-categories shop-categories--locked">
              {renderCategorySections({
                groupedItems: lockedByCategory,
                onBuy,
                onInspect: markShopItemSeen,
                delayOffset: unlockedItems.length,
              })}
            </div>
          ) : (
            <div className="shop-grid shop-grid--locked">
              {lockedItems.map((item, index) => (
                <ShopCard
                  key={item.id}
                  itemId={item.id}
                  item={item}
                  canBuy={item.canBuy}
                  balance={item.balance}
                  onBuy={onBuy}
                  onInspect={markShopItemSeen}
                  delay={unlockedItems.length + index}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  )
})
